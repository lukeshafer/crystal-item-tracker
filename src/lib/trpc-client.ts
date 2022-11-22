import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '$/trpc/trpc';

export const client = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: '/api/trpc',
		}),
	],
});
