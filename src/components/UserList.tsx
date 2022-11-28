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
		['red', ['#de1429', '#de3214', '#de145b']],
		['yellow', ['#9b5b0d', '#bc9613', '#c3e500']],
		['green', ['#3b840b', '#0e840b', '#0b8444']],
		['blue', ['#0b4a84', '#0b0d84', '#630b84']],
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
		setPreferencesMutation.mutate({ colorValue: color, colorName: name });
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
										style={{ background: color }}
										class={`w-16 h-16`}></button>
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
	return (
		<ul class="grid p-3 w-60 gap-4 content-start">
			<For each={users()}>
				{(user) => (
					<li
						class="px-4 py-2 h-16 flex items-center justify-between text-xl font-sans text-white w-full relative"
						style={{ background: user.preferences.colorValue }}>
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
