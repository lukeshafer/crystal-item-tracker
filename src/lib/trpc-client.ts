import { createTRPCProxyClient, httpBatchLink, httpLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../trpc/router/_index';

export const client = createTRPCProxyClient<AppRouter>({
	transformer: superjson,
	links: [
		httpLink({
			url: '/api/trpc',
		}),
	],
});
