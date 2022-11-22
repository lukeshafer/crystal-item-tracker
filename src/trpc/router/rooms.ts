import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const roomRouter = router({
  createRoom: publicProcedure.input(z.string()).mutation(({ input }) => {
    console.log('Creating a room in the database');
    return input;
  }),
});
