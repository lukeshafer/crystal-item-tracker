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
				const data = await prisma.item.findUnique({
					where: {
						id_roomId: { id: input.itemId, roomId },
					},
					include: {
						foundAtCheck: true,
					},
				});
				if (!data?.foundAtCheck) return null;
				const check = await prisma.check.findUnique({
					where: {
						id_roomId_locationId: {
							id: data.foundAtCheck.id,
							roomId,
							locationId: data.foundAtCheck.locationId,
						},
					},
					include: {
						location: true,
					},
				});
				if (!check) return null;
				return {
					checkId: check.id,
					checkName: check.name,
					locationId: check.locationId,
					locationName: check.location.name,
				};
			} catch (err) {
				console.error(err);
				return null;
			}
		}),
	setCheck: protectedProcedure
		.input(z.object({
			itemId: z.number(),
			checkId: z.number(),
			checkLocationId: z.number(),
		}).optional())
		.mutation(async ({ input, ctx }) => {
			const { roomId, prisma } = ctx;
			if (!input) return { success: false };
			try {
				const data = await prisma.item.update({
					where: {
						id_roomId: { id: input.itemId, roomId },
					},
					data: {
						checkId: input.checkId,
						checkLocationId: input.checkLocationId,
					},
				})
				if (data) return { success: true };
				else return { success: false };
			} catch (err) {
				console.error(err);
				return { success: false };
			}
		}),
	removeCheck: protectedProcedure
		.input(z.object({
			itemId: z.number(),
		}).optional())
		.mutation(async ({ input, ctx }) => {
			const { roomId, prisma } = ctx;
			if (!input) return { success: false };
			try {
				const data = await prisma.item.update({
					where: {
						id_roomId: { id: input.itemId, roomId },
					},
					data: {
						checkId: null,
						checkLocationId: null,
					},
				})
				if (data) return { success: true };
				else return { success: false };
			} catch (err) {
				console.error(err);
				return { success: false };
			}
		})
});
