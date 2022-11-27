import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

const userPreferencesSchema = z.object({
	colorName: z.string().optional(),
	colorClass: z.string().optional(),
});

export const userRouter = router({
	getUsers: protectedProcedure.query(async ({ ctx }) => {
		const { roomId, userId, prisma } = ctx;
		const users = await prisma.user.findMany({
			where: { roomId },
			include: {
				checks: true,
				items: true,
			},
		});

		const userData = await Promise.all(
			users.map(async (user) => {
				let preferences: z.infer<typeof userPreferencesSchema>;
				try {
					const prefJson = JSON.parse(user!.preferences!);
					preferences = userPreferencesSchema.parse(prefJson);
				} catch {
					preferences = {};
				}
				return {
					name: user.name,
					isCurrentUser: user.id === userId,
					userChecks: user.checks.map(
						({ checkId, checkLocationId, completed }) => ({
							checkId,
							checkLocationId,
							completed,
						})
					),
					userItems: user.items.map(({ itemId, found }) => ({
						itemId,
						found,
					})),
					preferences,
				};
			})
		);

		// Sort moves current user to the top of their list
		return userData.sort((a, b) =>
			a.isCurrentUser ? -1 : b.isCurrentUser ? 1 : 0
		);
	}),
	getUserPreferences: protectedProcedure
		.input(z.object({ userId: z.string().optional() }))
		.mutation(async ({ input, ctx }) => {
			const { roomId, userId: curUserId, prisma } = ctx;
			const { userId = curUserId } = input;
			const settingsString = JSON.stringify(input);
			const response = await prisma.user.update({
				where: {
					id_roomId: { id: userId, roomId },
				},
				data: {
					preferences: settingsString,
				},
			});
			return response;
		}),
	setUserPreferences: protectedProcedure
		.input(userPreferencesSchema)
		.mutation(async ({ input, ctx }) => {
			const { roomId, userId, prisma } = ctx;
			const settingsString = JSON.stringify(input);
			const response = await prisma.user.update({
				where: {
					id_roomId: { id: userId, roomId },
				},
				data: {
					preferences: settingsString,
				},
			});
			return response;
		}),
});
