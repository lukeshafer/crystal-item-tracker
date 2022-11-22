import { getItemData } from '../lib/item-data';
import { getLocations } from '../lib/location-data';
import { prisma } from '$/db/client';
export const initRoom = async (roomId: string) => {
	const items = getItemData();
	const locations = getLocations();
	const room = await prisma.room.create({
		data: {
			id: roomId,
		},
	});
	const itemResults = await prisma.item.createMany({
		data: items.map((_, index) => ({ id: index, roomId: room.id })),
	});

	const locationResults = await prisma.location.createMany({
		data: [...locations].map((_, index) => ({ id: index, roomId: room.id })),
	});

	const checkData = [...locations].flatMap(
		([_, location], locationId) =>
			location.sections?.map((section, id) => ({
				...section,
				id,
				locationId,
			})) ?? []
	);
	const checkResults = await prisma.check.createMany({
		data: checkData.map((check) => ({
			id: check.id,
			locationId: check.locationId,
			roomId: room.id,
		})),
	});

	if (itemResults && locationResults && checkResults) return;
	else {
		throw new Error('Error creating room.');
	}
};

export const initUser = async (name: string, roomId: string) => {
	// verify roomId is valid
	const room = await prisma.room.findFirst({ where: { id: roomId } });
	if (!room) throw new Error('Invalid room ID');

	const user = await prisma.user.create({
		data: {
			name,
			roomId: room.id,
		},
	});

	const roomItems = await prisma.item.findMany({
		where: {
			roomId: room.id,
		},
	});
	const userItems = await prisma.userItem.createMany({
		data: roomItems.map((item) => ({
			itemId: item.id,
			roomId: room.id,
			userId: user.id,
		})),
	});

	const roomChecks = await prisma.check.findMany({
		where: {
			roomId: room.id,
		},
	});
	const userChecks = await prisma.userCheck.createMany({
		data: roomChecks.map((check) => ({
			userId: user.id,
			roomId: room.id,
			checkLocationId: check.locationId,
			checkId: check.id,
		})),
	});

	if (userItems && userChecks) return user.id;
	else {
		throw new Error('Error creating user.');
	}
};
