import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';

export const listTransactionsProcedure = protectedProcedure
  .input(
    z.object({
      productCode: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let transactions = await db.transactions.getAll();
    
    if (input.productCode) {
      const product = await db.products.getByCode(input.productCode);
      if (product) {
        transactions = await db.transactions.getByProductId(product.id);
      }
    }
    
    return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });