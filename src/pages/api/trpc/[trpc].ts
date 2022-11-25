import { appRouter } from '../../../trpc/router/_index';
import { generateContextFunction } from '../../../trpc/context';

import type { APIContext } from 'astro';
import { resolveHTTPResponse } from '@trpc/server/http';
import type { HTTPHeaders } from '@trpc/client';

/**
 * Handles trpc query client requests.
 *
 * @param {APIContext} - Astro API Context
 * @returns {Promise<Response>} - trpc response
 *
 * @beta
 */
async function httpHandler({
	request,
	params,
	url,
	cookies,
}: APIContext): Promise<Response> {
	const referer = request.headers.get('Referer');
	const roomId = referer?.split('/').at(-1);
	const userId = cookies.get(roomId ?? 'invalid').value;

	if (!userId || !roomId)
		return new Response(null, {
			status: 400,
			statusText: 'Missing userId or roomId',
		});
	const query = url.searchParams;

	const requestBody = request.method === 'GET' ? {} : await request.json();

	const { status, headers, ...response } = await resolveHTTPResponse({
		createContext: generateContextFunction({ userId, roomId }),
		router: appRouter,
		path: params.trpc as string,
		req: {
			query,
			method: request.method,
			headers: request.headers as unknown as HTTPHeaders,
			body: requestBody,
		},
	});

	return new Response(response.body, {
		headers: headers as HeadersInit,
		status,
	});
}

export const post = httpHandler;

export const get = httpHandler;
