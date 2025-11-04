import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  let userId: string | null = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    userId = authHeader.substring(7);
  }
  
  return {
    req: opts.req,
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new Error('لطفا ابتدا وارد شوید');
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
