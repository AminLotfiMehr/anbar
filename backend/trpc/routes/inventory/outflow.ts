import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { generateId } from '../../../utils/auth';

export const outflowProcedure = protectedProcedure
  .input(
    z.object({
      code: z.string(),
      quantity: z.number().positive('تعداد باید مثبت باشد'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const product = await db.products.getByCode(input.code);
    
    if (!product) {
      throw new Error('کالا با این کد پیدا نشد');
    }
    
    if (product.currentStock === 0) {
      throw new Error('کالا شمارش نشده است');
    }
    
    if (product.currentStock < input.quantity) {
      throw new Error(`موجودی کافی نمی‌باشد. موجودی فعلی: ${product.currentStock} عدد`);
    }
    
    const user = await db.users.getById(ctx.userId);
    if (!user) {
      throw new Error('کاربر یافت نشد');
    }
    
    const previousStock = product.currentStock;
    const newStock = previousStock - input.quantity;
    
    await db.products.update(product.id, {
      currentStock: newStock,
    });
    
    await db.transactions.create({
      id: generateId(),
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      type: 'out',
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
