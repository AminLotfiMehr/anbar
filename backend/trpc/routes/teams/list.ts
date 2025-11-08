import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";

export const listTeamsProcedure = publicProcedure
  .input(
    z.object({
      warehouseId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[Teams] Listing teams for warehouse:', input.warehouseId);
    const teams = await db.teams.getByWarehouse(input.warehouseId);
    return teams;
  });
