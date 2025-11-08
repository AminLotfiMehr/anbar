import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";

export const listCountSessionsProcedure = publicProcedure
  .input(
    z.object({
      auditSessionId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[CountSessions] Listing count sessions for audit:', input.auditSessionId);
    const sessions = await db.countSessions.getByAuditSession(input.auditSessionId);
    return sessions;
  });
