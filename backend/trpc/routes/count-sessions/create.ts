import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";
import { CountSession } from "@/backend/types/database";

export const createCountSessionProcedure = protectedProcedure
  .input(
    z.object({
      auditSessionId: z.string(),
      teamId: z.string(),
      name: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[CountSessions] Creating count session:', input.name);

    const session: CountSession = {
      id: Math.random().toString(36).substr(2, 9),
      auditSessionId: input.auditSessionId,
      teamId: input.teamId,
      name: input.name,
      status: 'active',
      createdAt: new Date(),
    };

    await db.countSessions.create(session);

    return { success: true, session };
  });
