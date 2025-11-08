import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";
import { Team } from "@/backend/types/database";

export const createTeamProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      warehouseId: z.string(),
      memberIds: z.array(z.string()).default([]),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Teams] Creating team:', input.name);

    const team: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: input.name,
      warehouseId: input.warehouseId,
      memberIds: input.memberIds,
      createdAt: new Date(),
    };

    await db.teams.create(team);

    return { success: true, team };
  });
