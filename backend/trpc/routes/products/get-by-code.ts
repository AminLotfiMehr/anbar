import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';

export const getProductByCodeProcedure = protectedProcedure
  .input(z.object({ code: z.string() }))
  .query(async ({ input }) => {
    const product = await db.products.getByCode(input.code);
    
    if (!product) {
      throw new Error('کالا با این کد پیدا نشد');
    }
    
    return product;
  });
