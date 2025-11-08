import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";

export const completeAuditSessionProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[AuditSessions] Completing audit session:', input.id);

    const session = await db.auditSessions.getById(input.id);
    if (!session) {
      throw new Error('جلسه انبارگردانی پیدا نشد');
    }

    const updated = await db.auditSessions.update(input.id, {
      status: 'completed',
      completedAt: new Date(),
    });

    return { success: true, session: updated };
  });
