import { createSignal, Show } from 'solid-js';

export const Settings = ({ roomId }: { roomId: string }) => {
	const [isSettingsShown, setIsSettingsShown] = createSignal(false);
	const [isRoomIdShown, setIsRoomIdShown] = createSignal(false);
	const toggleVisibility = () => {
		setIsSettingsShown((current) => !current);
		setIsRoomIdShown(false);
	};
	return (
		<section id="settings" class="flex justify-self-start gap-6 h-10">
			<button
				onClick={toggleVisibility}
				class="bg-gray-200 text-black p-2 rounded shadow-slate-900 shadow w-max block">
				Settings
			</button>
			<Show when={isSettingsShown()}>
				<button
					class="text-center bg-gray-200 text-black p-2 rounded shadow-slate-900 shadow w-max block h-max"
					onClick={() => setIsRoomIdShown((cur) => !cur)}>
					<h2>{isRoomIdShown() ? 'Hide' : 'Show'} Room Id</h2>
					<div class="text-center text-xl">
						<Show
							when={isRoomIdShown()}
							fallback={
								<span class="block blur-sm" hidden>
									WORM
								</span>
							}>
							{roomId}
						</Show>
					</div>
				</button>
				<section>
					<h2 class="font-bold">Instructions</h2>
					<p>Left click a check or item to mark as complete.</p>
					<p>Right click to remove/undo a check</p>
					<p>
						Right click an incomplete check to remove an item (be careful with
						this one!)
					</p>
				</section>
			</Show>
		</section>
	);
};
