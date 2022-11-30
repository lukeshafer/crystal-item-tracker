import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const roomRouter = router({
	getIsLocked: protectedProcedure.query(async ({ ctx }) => {
		const { roomId, prisma } = ctx;
		try {
			const status = await prisma.room.findUnique({
				where: { id: roomId },
				select: {
					isLocked: true,
				},
			});
			return status?.isLocked ?? false;
		} catch (err) {
			return false;
		}
	}),
	setIsLocked: protectedProcedure
		.input(z.object({ value: z.boolean() }))
		.mutation(async ({ input, ctx }) => {
			const { roomId, prisma } = ctx;
			try {
				const result = await prisma.room.update({
					where: { id: roomId },
					data: { isLocked: input.value },
				});
				return result;
			} catch (err) {
				return { status: 500, error: 'Error creating user' };
			}
		}),
});
