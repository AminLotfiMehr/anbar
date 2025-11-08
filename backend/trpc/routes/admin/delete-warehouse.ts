import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';

export const deleteWarehouseProcedure = protectedProcedure
  .input(
    z.object({
      warehouseId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await db.users.getById(ctx.userId);
    if (!user || user.role !== 'admin') {
      throw new Error('دسترسی غیرمجاز');
    }

    const warehouse = await db.warehouses.getById(input.warehouseId);
    if (!warehouse) {
      throw new Error('انبار یافت نشد');
    }

    await db.warehouses.update(input.warehouseId, { isActive: false });

    return { success: true };
  });
