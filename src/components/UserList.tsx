import {
	createMutation,
	createQuery,
	useQueryClient,
} from '@tanstack/solid-query';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { FaSolidPalette } from 'solid-icons/fa';
import { client } from '../lib/trpc-client';
import type { AppRouter } from '../trpc/router/_index';

export type User = inferRouterOutputs<AppRouter>['user']['getUsers'][number];
export type UserPreferences =
	inferRouterInputs<AppRouter>['user']['setUserPreferences'];

interface UserProps {
	users: User[];
}
const [users, setUsers] = createSignal<User[]>([]);
export const userList = users;

const ColorSelector = ({ onSelect }: { onSelect(): void }) => {
	const queryClient = useQueryClient();
	const colors = new Map([
		['red', ['bg-pink-600', 'bg-rose-600', 'bg-red-600']],
		['yellow', ['bg-orange-600', 'bg-amber-600', 'bg-yellow-600']],
		['green', ['bg-green-600', 'bg-emerald-600', 'bg-teal-600']],
		['blue', ['bg-sky-600', 'bg-blue-600', 'bg-indigo-600']],
		['purple', ['bg-violet-600', 'bg-purple-600', 'bg-fuchsia-600']],
		['gray', ['bg-stone-600', 'bg-zinc-600', 'bg-slate-600']],
	]);

	const setPreferencesMutation = createMutation({
		mutationFn: (input: UserPreferences) =>
			client.user.setUserPreferences.mutate(input),
		meta: { queryKey: ['user.getUsers'] },
		onMutate: (input) => {
			const queryData = users().map((user) => ({
				...user,
				preferences: user.isCurrentUser ? input : user.preferences,
			}));
			setUsers(queryData);
		},
		onSettled: () => {
			queryClient.invalidateQueries(['user.getUsers']);
		},
	});

	const otherUserColors = userList().map((user) =>
		user.isCurrentUser ? 'not set' : user.preferences.colorName ?? 'not set'
	);

	const setColor = (name: string, color: string) => {
		setPreferencesMutation.mutate({ colorClass: color, colorName: name });
		onSelect();
	};

	return (
		<div class="flex flex-col gap-4 right-0 top-full absolute z-10 bg-gray-900 p-2">
			<For each={[...colors]}>
				{([name, colors]) => (
					<div class="flex gap-4">
						<Show when={!otherUserColors.includes(name)}>
							<For each={colors}>
								{(color) => (
									<button
										onClick={() => setColor(name, color)}
										class={`w-16 h-16 ${color}`}></button>
								)}
							</For>
						</Show>
					</div>
				)}
			</For>
		</div>
	);
};

export const UserList = ({ users: initialUsers }: UserProps) => {
	createQuery(
		() => ['user.getUsers'],
		() => client.user.getUsers.query(),
		{
			initialData: initialUsers,
			onSuccess(data) {
				setUsers(data);
			},
		}
	);
	const [isSelectorShown, setIsSelectorShown] = createSignal(false);
	createEffect(() => console.log(isSelectorShown()));
	return (
		<ul class="grid p-3 w-60 gap-4 content-start">
			<For each={users()}>
				{(user) => (
					<li
						class="px-4 py-2 h-16 flex items-center justify-between text-xl font-sans text-white w-full relative"
						classList={{ [user.preferences.colorClass ?? '']: true }}>
						{user.name}
						<Show when={user.isCurrentUser}>
							<button onClick={() => setIsSelectorShown(!isSelectorShown())}>
								<FaSolidPalette width={30} height={30}></FaSolidPalette>
							</button>
							<Show when={isSelectorShown()}>
								<ColorSelector
									onSelect={() => setIsSelectorShown(false)}></ColorSelector>
							</Show>
						</Show>
					</li>
				)}
			</For>
		</ul>
	);
};
