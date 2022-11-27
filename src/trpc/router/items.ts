import type { Item } from '@prisma/client';
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const itemsRouter = router({
	getAll: publicProcedure.query(async ({ ctx }) => {
		const { prisma, roomId } = ctx;
		try {
			const result = await prisma.item.findMany({
				where: {
					roomId,
				},
				select: {
					id: true,
					roomId: true,
					img: true,
					name: true,
					type: true,
					img_mods: true,
				},
			});
			return result;
		} catch (err) {
			console.error(err);
			return [] as Item[];
		}
	}),
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
	getCheckInfo: protectedProcedure
		.input(z.object({ itemId: z.number() }))
		.query(async ({ input, ctx }) => {
			const { roomId, prisma } = ctx;
			try {
				const data = await prisma.check.findFirst({
					where: {
						itemId: input.itemId,
						roomId,
					},
					include: {
						location: true,
					},
				});
				if (data)
					return {
						checkId: data.id,
						checkName: data.name,
						locationId: data.locationId,
						locationName: data.location.name,
					};
				else return null;
			} catch (err) {
				console.error(err);
				return null;
			}
		}),
});
