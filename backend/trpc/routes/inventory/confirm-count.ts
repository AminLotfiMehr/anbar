import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { generateId } from '../../../utils/auth';

export const confirmCountProcedure = protectedProcedure
  .input(
    z.object({
      code: z.string(),
      quantity: z.number().positive(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const product = await db.products.getByCode(input.code);
    
    if (!product) {
      throw new Error('کالا با این کد پیدا نشد');
    }
    
    const user = await db.users.getById(ctx.userId);
    if (!user) {
      throw new Error('کاربر یافت نشد');
    }
    
    const previousStock = product.currentStock;
    const newStock = previousStock + input.quantity;
    
    await db.products.update(product.id, {
      currentStock: newStock,
    });
    
    await db.transactions.create({
      id: generateId(),
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      type: 'count',
      quantity: input.quantity,
      previousStock,
      newStock,
      userId: user.id,
      username: user.username,
      createdAt: new Date(),
    });
    
    return {
      success: true,
      newStock,
    };
  });