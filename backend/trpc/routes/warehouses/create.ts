import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";
import { Warehouse } from "@/backend/types/database";

export const createWarehouseProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Warehouses] Creating warehouse:', input.name);

    const warehouse: Warehouse = {
      id: Math.random().toString(36).substr(2, 9),
      name: input.name,
      description: input.description,
      isActive: true,
      createdAt: new Date(),
    };

    await db.warehouses.create(warehouse);

    return { success: true, warehouse };
  });
