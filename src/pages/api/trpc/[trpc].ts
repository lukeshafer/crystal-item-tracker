import { createAstroTRPCApiHandler } from 'astro-trpc';
import { appRouter } from '$/trpc/trpc';
import { createContext } from '$/trpc/context';

export default createAstroTRPCApiHandler({
    router: appRouter,
    createContext,
    onError:
        process.env.NODE_ENV === 'development'
            ? ({ path, error }: { path: any; error: any }) => {
                console.error(`❌ tRPC failed on ${path}: ${error}`);
            }
            : undefined,
});
