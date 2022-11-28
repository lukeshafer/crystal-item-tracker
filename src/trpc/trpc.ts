import { initTRPC, TRPCError } from '@trpc/server';
//import superjson from 'superjson';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
	// Optional:
	//transformer: superjson,superjson
	// Optional:
	errorFormatter({ shape }) {
		return {
			...shape,
			data: {
				...shape.data,
			},
		};
	},
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(({ ctx, next }) => {
	if (!ctx.userId || !ctx.roomId) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next();
});

/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed);
