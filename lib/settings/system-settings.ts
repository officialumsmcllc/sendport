// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { prisma } from "@/lib/db/prisma";

let isTableReady = false;

export async function ensureSystemSettingTable(): Promise<void> {
  if (isTableReady) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'GENERAL',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");
    `);
    isTableReady = true;
  } catch (err) {
    // If table already exists or DB dialect differs, proceed
    isTableReady = true;
  }
}

export async function getSetting(key: string, defaultValue: string = ""): Promise<string> {
  try {
    await ensureSystemSettingTable();
    const row = await prisma.systemSetting.findUnique({
      where: { key },
    });
    if (row && row.value !== undefined && row.value !== null) {
      return row.value;
    }
  } catch (e) {
    console.warn(`[SETTINGS_READ_WARN]: Failed to fetch '${key}' from DB, using fallback.`);
  }
  return defaultValue;
}

export async function setSetting(key: string, value: string, category: string = "GENERAL"): Promise<boolean> {
  try {
    await ensureSystemSettingTable();
    await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value, category },
      update: { value, category, updatedAt: new Date() },
    });
    return true;
  } catch (e) {
    console.error(`[SETTINGS_WRITE_ERR]: Failed to save '${key}' to DB.`, e);
    return false;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    await ensureSystemSettingTable();
    const rows = await prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  } catch (e) {
    console.error("[SETTINGS_GETALL_ERR]:", e);
    return {};
  }
}

export async function setManySettings(
  settingsMap: Record<string, string>,
  category: string = "GENERAL"
): Promise<boolean> {
  try {
    await ensureSystemSettingTable();
    for (const [key, value] of Object.entries(settingsMap)) {
      if (value !== undefined && value !== null) {
        await prisma.systemSetting.upsert({
          where: { key },
          create: { key, value: String(value), category },
          update: { value: String(value), category, updatedAt: new Date() },
        });
      }
    }
    return true;
  } catch (e) {
    console.error("[SETTINGS_SETMANY_ERR]:", e);
    return false;
  }
}

