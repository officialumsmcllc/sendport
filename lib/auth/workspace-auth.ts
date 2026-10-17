import { NextRequest } from "next/server";
import { getCurrentUser } from "./session";
import { isSuperAdminUser } from "./admin-guard";
import { prisma } from "@/lib/db/prisma";
import { ensureDbSchema } from "@/lib/db/ensure-schema";

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    dailyQuota: number;
    usedToday: number;
    quotaResetAt?: Date;
  };
}

/**
 * Ensures workspace daily quota automatically resets at midnight (00:00:00).
 */
async function autoResetDailyQuotaIfExpired(workspace: any) {
  if (!workspace) return;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  if (!workspace.quotaResetAt || new Date(workspace.quotaResetAt) < startOfToday) {
    try {
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          usedToday: 0,
          quotaResetAt: new Date(),
        },
      });
      workspace.usedToday = 0;
      workspace.quotaResetAt = new Date();
    } catch (_) {}
  }
}

/**
 * Resolves the authenticated user and their isolated workspace.
 * Supports both API Key (Bearer sk_live_...) and Web Session Cookies.
 * NEVER leaks data across users or defaults to an arbitrary workspace.
 */
export async function getAuthContext(req?: NextRequest): Promise<AuthContext | null> {
  // 1. Check Bearer API Key in Authorization header
  if (req) {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const apiKeyToken = authHeader.replace("Bearer ", "").trim();
      if (apiKeyToken && apiKeyToken !== "undefined" && apiKeyToken !== "null") {
        const apiKey = await prisma.apiKey.findFirst({
          where: {
            keyHash: apiKeyToken,
          },
          include: {
            workspace: true,
            user: true,
          },
        });

        if (apiKey?.workspace && apiKey?.user) {
          await autoResetDailyQuotaIfExpired(apiKey.workspace);

          return {
            user: {
              id: apiKey.user.id,
              email: apiKey.user.email,
              name: apiKey.user.name,
              role: apiKey.user.role,
            },
            workspace: apiKey.workspace,
          };
        }
      }
    }
  }

  // 2. Check Cookie Session for logged-in web users
  const session = await getCurrentUser(req);
  if (session) {
    try {
      let user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
          workspaces: {
            include: {
              workspace: {
                include: {
                  domains: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      // Auto-heal: If user was reseeded or ID changed, try lookup by email
      if (!user && session.email) {
        user = await prisma.user.findUnique({
          where: { email: session.email },
          include: {
            workspaces: {
              include: {
                workspace: {
                  include: {
                    domains: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        });
      }

      // Auto-heal: If user still doesn't exist in DB, create record for validly signed session
      if (!user && session.email) {
        const isAdminEmail = isSuperAdminUser(session.email, session.role);
        try {
          user = await prisma.user.create({
            data: {
              id: session.userId,
              email: session.email,
              name: session.name || session.email.split("@")[0],
              role: isAdminEmail ? "ADMIN" : "USER",
            },
            include: {
              workspaces: {
                include: {
                  workspace: {
                    include: {
                      domains: true,
                    },
                  },
                },
              },
            },
          });
        } catch (_) {
          // In case ID already existed, fallback to findUnique
          user = await prisma.user.findUnique({
            where: { email: session.email },
            include: {
              workspaces: {
                include: {
                  workspace: {
                    include: {
                      domains: true,
                    },
                  },
                },
              },
            },
          });
        }
      }

      if (user) {
        // Guarantee admin role if super admin
        if (isSuperAdminUser(user.email, user.role) && user.role !== "ADMIN") {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
            include: {
              workspaces: {
                include: {
                  workspace: {
                    include: {
                      domains: true,
                    },
                  },
                },
              },
            },
          });
        }

        // 1. Prioritize workspace that already has user's configured domains
        let workspace: any = user.workspaces?.find((w) => w.workspace?.domains && w.workspace.domains.length > 0)?.workspace;

        // 2. If not found, check if ANY domain in DB belongs to this user or user's email
        if (!workspace) {
          const userDomain = await prisma.domain.findFirst({
            where: {
              OR: [
                { userId: user.id },
                { user: { email: user.email } },
              ],
            },
            include: { workspace: true },
            orderBy: { createdAt: "desc" },
          });

          if (userDomain?.workspace) {
            workspace = userDomain.workspace;
            // Ensure user is linked as OWNER/member
            await prisma.workspaceMember.upsert({
              where: {
                workspaceId_userId: {
                  workspaceId: workspace.id,
                  userId: user.id,
                },
              },
              create: {
                workspaceId: workspace.id,
                userId: user.id,
                role: "OWNER",
              },
              update: {},
            }).catch(() => {});
          }
        }

        // 3. Fallback to first existing workspace in user.workspaces
        if (!workspace) {
          workspace = user.workspaces?.[0]?.workspace;
        }

        // 4. Fallback to any workspace with user membership
        if (!workspace) {
          const existingWs = await prisma.workspace.findFirst({
            where: {
              members: { some: { userId: user.id } },
            },
            include: { domains: true },
          });
          if (existingWs) {
            workspace = existingWs;
          }
        }

        // 5. Auto-provision an isolated workspace if one wasn't linked
        if (!workspace) {
          const userSlug = (user.email.split("@")[0] || "user").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          const uniqueSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          const slug = `ws-${userSlug}-${uniqueSuffix}`;
          const isSuperPlan = user.role === "ADMIN";
          await ensureDbSchema();
          workspace = await prisma.workspace.create({
            data: {
              name: `${user.name || user.email.split("@")[0]}'s Workspace`,
              slug,
              plan: isSuperPlan ? "SCALE_PRO" : "STARTER",
              dailyQuota: isSuperPlan ? 50000 : 100,
              credits: 0,
              members: {
                create: {
                  userId: user.id,
                  role: "OWNER",
                },
              },
            },
          });
        }

        // 6. Consolidate any orphan domains/keys belonging to this user into their active workspace
        if (workspace?.id) {
          try {
            const orphanDomains = await prisma.domain.findMany({
              where: {
                OR: [
                  { userId: user.id },
                  { user: { email: user.email } },
                ],
                workspaceId: { not: workspace.id },
              },
            });
            for (const d of orphanDomains) {
              const conflict = await prisma.domain.findFirst({
                where: { workspaceId: workspace.id, name: d.name },
              });
              if (!conflict) {
                await prisma.domain.update({
                  where: { id: d.id },
                  data: { workspaceId: workspace.id, userId: user.id },
                }).catch(() => {});
              }
            }
          } catch (_) {}

          try {
            await prisma.apiKey.updateMany({
              where: {
                userId: user.id,
                workspaceId: { not: workspace.id },
              },
              data: {
                workspaceId: workspace.id,
              },
            });
          } catch (_) {}
        }

        // Auto-heal Starter plan quota if it was previously set to admin quota (50000)
        if (workspace?.id && workspace.plan === "STARTER" && workspace.dailyQuota > 100 && !isSuperAdminUser(user.email, user.role)) {
          try {
            await prisma.workspace.update({
              where: { id: workspace.id },
              data: { dailyQuota: 100 },
            });
            workspace.dailyQuota = 100;
          } catch (_) {}
        }

        await autoResetDailyQuotaIfExpired(workspace);

        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          workspace,
        };
      }
    } catch (err) {
      console.error("Error in getAuthContext fetching user/workspace:", err);
      // Resilience fallback: Return minimal auth context so session doesn't fail with 401
      return {
        user: {
          id: session.userId,
          email: session.email,
          name: session.name || session.email.split("@")[0],
          role: isSuperAdminUser(session.email, session.role) ? "ADMIN" : (session.role || "USER"),
        },
        workspace: {
          id: `ws_${session.userId}`,
          name: "Primary Workspace",
          slug: `ws-${session.userId}`,
          plan: isSuperAdminUser(session.email, session.role) ? "SCALE_PRO" : "STARTER",
          dailyQuota: isSuperAdminUser(session.email, session.role) ? 50000 : 100,
          usedToday: 0,
        },
      };
    }
  }

  return null;
}
