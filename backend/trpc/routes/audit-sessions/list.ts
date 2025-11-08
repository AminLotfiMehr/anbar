import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";

export const listAuditSessionsProcedure = publicProcedure
  .input(
    z.object({
      warehouseId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[AuditSessions] Listing audit sessions for warehouse:', input.warehouseId);
    const sessions = await db.auditSessions.getByWarehouse(input.warehouseId);
    return sessions;
  });
