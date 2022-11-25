import { router } from '../trpc';
import { checkRouter } from './checks';
import { itemsRouter } from './items';
import { locationRouter } from './locations';

export type AppRouter = typeof appRouter;
export const appRouter = router({
	location: locationRouter,
	checks: checkRouter,
	item: itemsRouter,
});
