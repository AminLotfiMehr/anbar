import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { generateId } from '../../../utils/auth';

export const uploadExcelProcedure = protectedProcedure
  .input(
    z.object({
      warehouseId: z.string(),
      products: z.array(
        z.object({
          code: z.string(),
          name: z.string(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    await db.products.clear(input.warehouseId);
    
    const newProducts = input.products.map((p) => ({
      id: generateId(),
      code: p.code,
      name: p.name,
      warehouseId: input.warehouseId,
      currentStock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    await db.products.bulkCreate(newProducts);
    
    return {
      success: true,
      count: newProducts.length,
    };
  });
