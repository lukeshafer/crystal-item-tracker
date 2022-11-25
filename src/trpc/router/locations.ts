import { router, protectedProcedure } from '../trpc';

export const locationRouter = router({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const { roomId, prisma } = ctx;
		try {
			const locations = await prisma.location.findMany({
				where: { roomId: roomId },
			});
			return {
				status: 201,
				locations: locations.map(({ id, name, x, y }) => ({
					id,
					name,
					x,
					y,
				})),
			};
		} catch (err) {
			return { status: 500, error: 'Error creating user' };
		}
	}),
});
