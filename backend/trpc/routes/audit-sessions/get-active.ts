import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";

export const getActiveAuditSessionProcedure = publicProcedure
  .input(
    z.object({
      warehouseId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[AuditSessions] Getting active audit session for warehouse:', input.warehouseId);
    const session = await db.auditSessions.getActive(input.warehouseId);
    return session ?? null;
  });
