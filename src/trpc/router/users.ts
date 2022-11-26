import { router, protectedProcedure } from '../trpc';

export const userRouter = router({
	getUsers: protectedProcedure.query(async ({ ctx }) => {
		const { roomId, userId, prisma } = ctx;
		const users = await prisma.user.findMany({ where: { roomId } });

		const userData = await Promise.all(
			users.map(async ({ name, id }) => {
				const userChecks = await prisma.userCheck.findMany({
					where: { userId: id, roomId },
				});
				const userItems = await prisma.userItem.findMany({
					where: { userId: id, roomId },
				});
				return {
					name,
					isCurrentUser: id === userId,
					userChecks: userChecks.map(
						({ checkId, checkLocationId, completed }) => ({
							checkId,
							checkLocationId,
							completed,
						})
					),
					userItems: userItems.map(({ itemId, found }) => ({
						itemId,
						found,
					})),
				};
			})
		);

		return userData;
	}),
});
