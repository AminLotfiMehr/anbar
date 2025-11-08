import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';

export const listUsersProcedure = protectedProcedure
  .input(z.object({}).optional())
  .query(async ({ ctx }) => {
    const user = await db.users.getById(ctx.userId);
    if (!user || user.role !== 'admin') {
      throw new Error('دسترسی غیرمجاز');
    }

    const users = await db.users.getAll();
    return users.map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      createdAt: u.createdAt,
    }));
  });
