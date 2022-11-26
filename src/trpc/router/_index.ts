import { router } from '../trpc';
import { checkRouter } from './checks';
import { itemsRouter } from './items';
import { locationRouter } from './locations';
import { userRouter } from './users';

export type AppRouter = typeof appRouter;
export const appRouter = router({
	location: locationRouter,
	checks: checkRouter,
	item: itemsRouter,
	user: userRouter,
});
