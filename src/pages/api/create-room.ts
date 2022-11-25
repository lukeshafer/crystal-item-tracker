import type { APIContext } from 'astro';
import { initRoom, initUser } from '../../db/room-data';
import { prisma } from '../../db/client';

export const post = async ({
	request,
	cookies,
	redirect,
}: APIContext): Promise<Response> => {
	const formEncodedData = await request.text();
	const userName = new URLSearchParams(formEncodedData).get('userName');
	if (!userName)
		return new Response(
			JSON.stringify({ message: 'You must provide a username' }),
			{ status: 400, statusText: 'userName is required.' }
		);
	cookies.set('userName', userName, {
		maxAge: 60 * 60 * 24 /* 1 day */,
		path: '/',
	});

	let roomId;
	try {
		roomId = await initRoom();
	} catch (err) {
		return new Response(JSON.stringify({ err }), {
			status: 500,
			statusText: 'Server error while creating room.',
		});
	}

	let userId;
	try {
		userId = await initUser({ name: userName, roomId });
	} catch (err) {
		await prisma.room.delete({ where: { id: roomId } });
		return new Response(JSON.stringify({ err }), {
			status: 500,
			statusText: 'Server error while creating user. Room was not created.',
		});
	}

	cookies.set(roomId, userId, {
		maxAge: 60 * 60 * 24 /* 1 day */,
		path: '/',
		httpOnly: true,
	});

	return redirect(`/room/${roomId}`);
};
