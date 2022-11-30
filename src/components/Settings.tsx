import {
	createMutation,
	createQuery,
	useQueryClient,
} from '@tanstack/solid-query';
import { FaSolidLock, FaSolidLockOpen } from 'solid-icons/fa';
import { createSignal, Show } from 'solid-js';
import { client } from '../lib/trpc-client';

export const Settings = ({ roomId }: { roomId: string }) => {
	const queryClient = useQueryClient();
	const [isSettingsShown, setIsSettingsShown] = createSignal(false);
	const [isRoomIdShown, setIsRoomIdShown] = createSignal(false);
	const [isRoomLocked, setIsRoomLocked] = createSignal(false);
	const toggleVisibility = () => {
		setIsSettingsShown((current) => !current);
		setIsRoomIdShown(false);
	};

	createQuery(
		() => ['room.getIsLocked'],
		() => client.room.getIsLocked.query()
	);

	const mutateRoomLock = createMutation({
		mutationFn: (input: boolean) =>
			client.room.setIsLocked.mutate({ value: input }),
		onMutate(input) {
			setIsRoomLocked(input);
		},
		meta: { queryKey: ['room.getIsLocked'] },
		onSettled: () => queryClient.invalidateQueries(['room.getIsLocked']),
	});

	return (
		<section id="settings" class="flex justify-self-start gap-6 h-10">
			<button
				onClick={toggleVisibility}
				class="bg-gray-200 text-black p-2 rounded shadow-slate-900 shadow w-max block">
				Settings
			</button>
			<Show when={isSettingsShown()}>
				<section class="flex flex-col gap-2">
					<button
						class="text-center bg-gray-200 text-black p-2 rounded shadow-slate-900 shadow w-max block h-max"
						onClick={() => setIsRoomIdShown((cur) => !cur)}>
						{isRoomIdShown() ? 'Hide' : 'Show'} Room Id
					</button>
					<div class="bg-white text-black text-center text-xl p-2 rounded">
						<Show
							when={isRoomIdShown()}
							fallback={
								<span class="block blur-[5px]" hidden>
									{roomId}
								</span>
							}>
							{roomId}
						</Show>
					</div>
				</section>
				<section>
					<h2 class="font-bold">Instructions</h2>
					<p>Left click a check or item to mark as complete.</p>
					<p>Right click to remove/undo a check</p>
					<p>
						Right click an incomplete check to remove an item (be careful with
						this one!)
					</p>
				</section>
				<section>
					<button
						class="text-center bg-gray-200 text-black p-2 rounded shadow-slate-900 shadow w-max h-max grid justify-items-center gap-2"
						onclick={() => mutateRoomLock.mutate(!isRoomLocked())}>
						<span>{isRoomLocked() ? 'Unlock' : 'Lock'} Room</span>
						<Show
							when={isRoomLocked()}
							fallback={<FaSolidLockOpen width={40} height={40} />}>
							<FaSolidLock width={40} height={40}></FaSolidLock>
						</Show>
					</button>
				</section>
			</Show>
		</section>
	);
};
