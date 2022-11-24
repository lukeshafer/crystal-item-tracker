import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';
//import { itemsRouter } from './router/items';

const t = initTRPC.context<Context>().create({
	// Optional:
	transformer: superjson,
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

// Export type router type signature,
// NOT the router itself.

/**
 * We recommend only exporting the functionality that we
 * use so we can enforce which base procedures should be used
 **/
export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;
