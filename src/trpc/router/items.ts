import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const itemsRouter = router({
	updateCollectedStatus: publicProcedure
		.input(
			z.object({
				itemId: z.number(),
				isCollected: z.boolean(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { prisma, userId, roomId } = ctx;
			try {
				const result = await prisma.userItem.update({
					where: {
						userId_itemId_roomId: { userId, itemId: input.itemId, roomId },
					},
					data: {
						found: input.isCollected,
					},
				});
				if (result) return { success: true };
				else return { success: false };
			} catch (err) {
				console.error(err);
				return { success: false };
			}
		}),
	getCollectedStatus: protectedProcedure
		.input(z.object({ itemId: z.number() }))
		.query(async ({ input, ctx }) => {
			const { userId, roomId, prisma } = ctx;
			try {
				const data = await prisma.userItem.findUnique({
					where: {
						userId_itemId_roomId: { userId, itemId: input.itemId, roomId },
					},
				});
				return data?.found ?? false;
			} catch (err) {
				console.error(err);
				return false;
			}
		}),
	getItemData: protectedProcedure
		.input(z.object({ itemId: z.number() }))
		.query(async ({ input, ctx }) => {
			const { roomId, prisma } = ctx;
			try {
				const data = await prisma.item.findUnique({
					where: {
						id_roomId: { id: input.itemId, roomId },
					},
				});
				return data;
			} catch (err) {
				console.error(err);
				return null;
			}
		}),
});
