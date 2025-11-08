import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';

export const getReportsProcedure = protectedProcedure
  .input(
    z.object({
      warehouseId: z.string().optional(),
      auditSessionId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const user = await db.users.getById(ctx.userId);
    if (!user || user.role !== 'admin') {
      throw new Error('دسترسی غیرمجاز');
    }

    let transactions = await db.transactions.getAll();
    let products = await db.products.getAll();

    if (input.warehouseId) {
      transactions = transactions.filter(t => t.warehouseId === input.warehouseId);
      products = products.filter(p => p.warehouseId === input.warehouseId);
    }

    if (input.auditSessionId) {
      transactions = transactions.filter(t => t.auditSessionId === input.auditSessionId);
    }

    if (input.startDate) {
      const start = new Date(input.startDate);
      transactions = transactions.filter(t => new Date(t.createdAt) >= start);
    }

    if (input.endDate) {
      const end = new Date(input.endDate);
      transactions = transactions.filter(t => new Date(t.createdAt) <= end);
    }

    const countTransactions = transactions.filter(t => t.type === 'count');
    const outTransactions = transactions.filter(t => t.type === 'out');
    const inTransactions = transactions.filter(t => t.type === 'in');

    const totalProducts = products.length;
    const countedProducts = products.filter(p => p.currentStock > 0).length;
    const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);

    return {
      summary: {
        totalProducts,
        countedProducts,
        uncountedProducts: totalProducts - countedProducts,
        totalStock,
        totalCounts: countTransactions.length,
        totalOuts: outTransactions.length,
        totalIns: inTransactions.length,
      },
      transactions: transactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      products,
    };
  });
