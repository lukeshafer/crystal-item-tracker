import { getItemData } from '../lib/item-data';
import { getLocations } from '../lib/location-data';
import { prisma } from './client';

const checkIfRoomIdExists = async (roomId: string) => {
	const room = await prisma.room.findFirst({
		where: {
			id: roomId,
		},
	});
	return !!room;
};

const generateRoomId = async (length = 4) => {
	let str = '';
	do {
		str = '';
		for (let i = 0; i < length; i++) {
			let num = Math.floor(Math.random() * 36);
			str += num < 10 ? num.toString() : String.fromCharCode(num + 55);
		}
		const similarChars: [string, string][] = [
			['O', '0'],
			['I', '1'],
			['L', '1'],
			['S', '5'],
		];

		similarChars.forEach(([oldChar, newChar]) => {
			str = str.replaceAll(oldChar, newChar);
		});
	} while (await checkIfRoomIdExists(str));

	return str;
};

export const initRoom = async () => {
	const roomId = await generateRoomId();
	const items = getItemData();
	const locations = [...getLocations().values()];

	try {
		await prisma.room.create({
			data: {
				id: roomId,
			},
		});
	} catch (err) {
		console.error('Error creating room.', { roomId });
		throw err;
	}

	let step = 'item';
	try {
		const itemData = items.map((_, index) => ({ id: index, roomId: roomId }));
		console.log(itemData);
		await prisma.item.createMany({
			data: itemData,
		});
		step = 'location';
		await prisma.location.createMany({
			data: locations.map((location, locationIndex) => ({
				id: locationIndex,
				roomId: roomId,
				name: location.name,
				x: Math.floor(location.map_locations?.at(0)?.x!),
				y: Math.floor(location.map_locations?.at(0)?.y!),
			})),
		});
		step = 'check';
		await prisma.check.createMany({
			data: locations.flatMap(({ sections }, locationIndex) =>
				sections!.map((check, checkIndex) => ({
					id: checkIndex,
					locationId: locationIndex,
					roomId: roomId,
					name: check.name,
				}))
			),
		});
	} catch (err) {
		await prisma.room.delete({ where: { id: roomId } });
		console.error(`Error creating room at ${step} step.`, { roomId });
		throw err;
	}

	return roomId;
};

export const initUser = async ({
	name,
	roomId,
}: {
	name: string;
	roomId: string;
}) => {
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
