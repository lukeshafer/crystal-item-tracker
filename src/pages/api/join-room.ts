import type { APIContext } from 'astro';
import { initUser } from '../../db/room-data';
import { prisma } from '../../db/client';

export const post = async ({
	request,
	redirect,
	cookies,
}: APIContext): Promise<Response> => {
	const formEncodedData = await request.text();
	const params = new URLSearchParams(formEncodedData);
	const userName = params.get('userName');
	const roomId = params.get('roomId');
	if (!roomId)
		return new Response(
			JSON.stringify({ message: 'You must provide a room ID' }),
			{ status: 400, statusText: 'roomId is required.' }
		);
	if (!userName)
		return new Response(
			JSON.stringify({ message: 'You must provide a username' }),
			{ status: 400, statusText: 'userName is required.' }
		);

	// 1. check for userId cookie
	// 1.b if cookie exists, check if that userId is already in this room
	// 1.c if userId is in the room, join the room as that user.
	// 1.d if old name is different from new name, ask which one the user would like to user
	// 2 create user

	let userId = cookies.get(roomId).value;
	if (userId) {
		const user = await prisma.user.findFirst({
			where: {
				id: userId,
				roomId: roomId,
			},
		});
		if (user) {
			return redirect(`/room/${roomId}`, 302);
		}
	}

	try {
		userId = await initUser({ name: userName, roomId });
	} catch (err) {
		if (err instanceof Error)
			if (err.message === 'Invalid room ID')
				return redirect(`/?error=${roomId}`);
		return new Response(
			JSON.stringify({ err, message: 'Server error while creating user.' }),
			{
				status: 500,
				statusText: err?.message ?? 'Server error while creating user.',
			}
		);
	}

	console.log(roomId, userId);
	cookies.set(roomId, userId, {
		maxAge: 60 * 60 * 24 /* 1 day */,
		path: '/',
		httpOnly: true,
	});
	return redirect(`/room/${roomId}`, 302);
};
