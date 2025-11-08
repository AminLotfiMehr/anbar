import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { generateId } from '../../../utils/auth';

export const outflowProcedure = protectedProcedure
  .input(
    z.object({
      code: z.string(),
      quantity: z.number().positive('تعداد باید مثبت باشد'),
      warehouseId: z.string(),
      auditSessionId: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (input.auditSessionId) {
      const auditSession = await db.auditSessions.getById(input.auditSessionId);
      if (auditSession && !auditSession.allowOutflow) {
        throw new Error('خروج کالا در حین انبارگردانی غیرفعال است');
      }
    }
    
    const product = await db.products.getByCode(input.code, input.warehouseId);
    
    if (!product) {
      throw new Error('کالا با این کد در این انبار پیدا نشد');
    }
    
    if (product.warehouseId !== input.warehouseId) {
      throw new Error('کالا متعلق به انبار دیگری است');
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
      warehouseId: input.warehouseId,
      type: 'out',
      quantity: input.quantity,
      previousStock,
      newStock,
      userId: user.id,
      username: user.username,
      auditSessionId: input.auditSessionId,
      countSessionId: undefined,
      isSynced: true,
      createdAt: new Date(),
    });
    
    return {
      success: true,
      newStock,
    };
  });
