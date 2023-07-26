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
					codes: true,
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
				// Get user's current progressCodes, and either add remove the item's code 
				const user = await prisma.user.findUnique({
					where: {
						id: userId
					},
					select: {
						progressCodes: true
					}
				});
				const item = await prisma.item.findUnique({
					where: {
						id_roomId: {
							id: input.itemId,
							roomId
						}
					},
					select: {
						codes: true
					}
				});
				if (!user || !item) {
					throw new Error('User or item not found');
				}
				const progressCodeData = z.array(z.string()).safeParse(JSON.parse(user.progressCodes));
				if (!progressCodeData.success) {
					throw new Error('Invalid progress codes');
				}

				const progressCodes = progressCodeData.data;
				const itemCodes = item.codes.split(',');

				// If adding, add all item codes to progress codes 
				// If removing, remove all item codes from progress codes 
				const newCodes = input.isCollected ?
					progressCodes.reduce((acc, code) =>
						itemCodes.includes(code) ?
							acc
							: [...acc, code], [] as string[])
					: progressCodes.filter((code) => !itemCodes.includes(code))
				const newProgressCodes = JSON.stringify(newCodes);

				// Update user's progress codes 
				await prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						progressCodes: newProgressCodes,
					},
				});

			} catch (err) {
				console.error(err);
			}

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
