import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { hashPassword, generateId } from '../../../utils/auth';

export const registerProcedure = publicProcedure
  .input(
    z.object({
      username: z.string().min(3, 'نام کاربری باید حداقل 3 کاراکتر باشد'),
      password: z.string().min(4, 'رمز عبور باید حداقل 4 کاراکتر باشد'),
    })
  )
  .mutation(async ({ input }) => {
    const existingUser = await db.users.getByUsername(input.username);
    
    if (existingUser) {
      throw new Error('این نام کاربری قبلا ثبت شده است');
    }
    
    const user = await db.users.create({
      id: generateId(),
      username: input.username,
      password: hashPassword(input.password),
      role: 'user',
      createdAt: new Date(),
    });
    
    return {
      success: true,
      userId: user.id,
      username: user.username,
    };
  });
