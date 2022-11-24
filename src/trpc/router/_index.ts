import { router } from '../trpc';
import { checkRouter } from './checks';
import { locationRouter } from './locations';
import { roomRouter } from './rooms';
import { userRouter } from './users';

export type AppRouter = typeof appRouter;
export const appRouter = router({
	location: locationRouter,
	checks: checkRouter,
	//item: itemsRouter,
});
