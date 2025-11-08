import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { generateId } from '../../../utils/auth';

export const countInventoryProcedure = protectedProcedure
  .input(
    z.object({
      code: z.string(),
      quantity: z.number().positive('تعداد باید مثبت باشد'),
      warehouseId: z.string(),
      auditSessionId: z.string().optional(),
      countSessionId: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const product = await db.products.getByCode(input.code, input.warehouseId);
    
    if (!product) {
      throw new Error('کالا با این کد در این انبار پیدا نشد');
    }
    
    if (product.warehouseId !== input.warehouseId) {
      throw new Error('کالا متعلق به انبار دیگری است');
    }
    
    if (input.auditSessionId) {
      const auditSession = await db.auditSessions.getById(input.auditSessionId);
      if (!auditSession) {
        throw new Error('جلسه انبارگردانی یافت نشد');
      }
      if (auditSession.status !== 'active') {
        throw new Error('جلسه انبارگردانی فعال نیست');
      }
      if (auditSession.warehouseId !== input.warehouseId) {
        throw new Error('جلسه انبارگردانی متعلق به انبار دیگری است');
      }
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
      warehouseId: input.warehouseId,
      type: 'count',
      quantity: input.quantity,
      previousStock: 0,
      newStock: input.quantity,
      userId: user.id,
      username: user.username,
      auditSessionId: input.auditSessionId,
      countSessionId: input.countSessionId,
      isSynced: true,
      createdAt: new Date(),
    });
    
    return {
      success: true,
      needsConfirmation: false,
      newStock: input.quantity,
    };
  });
