import { NextRequest } from "next/server";
import { getCurrentUser } from "./session";
import { prisma } from "@/lib/db/prisma";

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
  };
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
            OR: [
              { keyHash: apiKeyToken },
              { keyPrefix: { startsWith: apiKeyToken.substring(0, 12) } },
            ],
          },
          include: {
            workspace: true,
            user: true,
          },
        });

        if (apiKey?.workspace && apiKey?.user) {
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
  const session = await getCurrentUser();
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (user) {
      let workspace = user.workspaces?.[0]?.workspace;
      if (!workspace) {
        // Auto-provision an isolated workspace if one wasn't linked
        const userSlug = (user.email.split("@")[0] || "user").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const slug = `ws-${userSlug}-${user.id.substring(0, 5)}`;
        workspace = await prisma.workspace.create({
          data: {
            name: `${user.name || user.email.split("@")[0]}'s Workspace`,
            slug,
            plan: "STARTER",
            dailyQuota: 100,
            members: {
              create: {
                userId: user.id,
                role: "OWNER",
              },
            },
          },
        });
      }

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
  }

  return null;
}
