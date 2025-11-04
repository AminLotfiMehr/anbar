import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { generateId } from '../../../utils/auth';

export const countInventoryProcedure = protectedProcedure
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
    
    const user = await db.users.getById(ctx.userId);
    if (!user) {
      throw new Error('کاربر یافت نشد');
    }
    
    if (product.currentStock > 0) {
      const previousStock = product.currentStock;
      const newStock = previousStock + input.quantity;
      
      const confirmation = {
        needsConfirmation: true,
        message: `کالا قبلا شمارش شده و دارای موجودی ${previousStock} عدد می‌باشد. آیا می‌خواهید موجودی جدید (${input.quantity} عدد) را به موجودی قبلی اضافه کنید؟`,
        previousStock,
        newQuantity: input.quantity,
        totalStock: newStock,
      };
      return confirmation;
    }
    
    await db.products.update(product.id, {
      currentStock: input.quantity,
    });
    
    await db.transactions.create({
      id: generateId(),
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      type: 'count',
      quantity: input.quantity,
      previousStock: 0,
      newStock: input.quantity,
      userId: user.id,
      username: user.username,
      createdAt: new Date(),
    });
    
    return {
      success: true,
      needsConfirmation: false,
      newStock: input.quantity,
    };
  });
