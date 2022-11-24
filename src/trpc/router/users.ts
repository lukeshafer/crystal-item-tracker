import { initUser } from '../../db/room-data';
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const userRouter = router({
	createUser: publicProcedure
		.input(
			z.object({
				name: z.string(),
				roomId: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const userId = await initUser(input.name, input.roomId);
				return { status: 201, userId: userId };
			} catch (err) {
				return { status: 500, error: 'Error creating user' };
			}
		}),
});
