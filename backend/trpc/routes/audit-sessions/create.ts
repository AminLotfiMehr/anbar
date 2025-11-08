import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";
import { AuditSession } from "@/backend/types/database";

export const createAuditSessionProcedure = protectedProcedure
  .input(
    z.object({
      warehouseId: z.string(),
      name: z.string(),
      allowOutflow: z.boolean().default(false),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[AuditSessions] Creating audit session:', input.name);

    const existingActive = await db.auditSessions.getActive(input.warehouseId);
    if (existingActive) {
      throw new Error('یک جلسه انبارگردانی فعال برای این انبار وجود دارد');
    }

    const session: AuditSession = {
      id: Math.random().toString(36).substr(2, 9),
      warehouseId: input.warehouseId,
      name: input.name,
      status: 'active',
      allowOutflow: input.allowOutflow,
      createdAt: new Date(),
    };

    await db.auditSessions.create(session);

    return { success: true, session };
  });
