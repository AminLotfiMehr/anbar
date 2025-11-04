import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { db } from '../../../db/storage';
import { verifyPassword } from '../../../utils/auth';

export const loginProcedure = publicProcedure
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await db.users.getByUsername(input.username);
    
    if (!user || !verifyPassword(input.password, user.password)) {
      throw new Error('نام کاربری یا رمز عبور اشتباه است');
    }
    
    return {
      success: true,
      userId: user.id,
      username: user.username,
      token: user.id,
    };
  });
