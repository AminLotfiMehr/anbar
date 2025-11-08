import { z } from "zod";
import { protectedProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";

export const updateWarehouseProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Warehouses] Updating warehouse:', input.id);

    const { id, ...data } = input;
    const warehouse = await db.warehouses.update(id, data);

    if (!warehouse) {
      throw new Error('انبار پیدا نشد');
    }

    return { success: true, warehouse };
  });
