import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { generateId, hashPassword } from '../../../utils/auth';

export const createUserProcedure = protectedProcedure
  .input(
    z.object({
      username: z.string().min(3, 'نام کاربری باید حداقل 3 کاراکتر باشد'),
      password: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
      role: z.enum(['admin', 'user']),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const requestUser = await db.users.getById(ctx.userId);
    if (!requestUser || requestUser.role !== 'admin') {
      throw new Error('دسترسی غیرمجاز');
    }

    const existing = await db.users.getByUsername(input.username);
    if (existing) {
      throw new Error('نام کاربری قبلاً استفاده شده است');
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await db.users.create({
      id: generateId(),
      username: input.username,
      password: hashedPassword,
      role: input.role,
      createdAt: new Date(),
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };
  });
