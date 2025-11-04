import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';

export const listProductsProcedure = protectedProcedure
  .query(async () => {
    const products = await db.products.getAll();
    return products.sort((a, b) => a.code.localeCompare(b.code));
  });
