import { createQuery } from '@tanstack/solid-query';
import type { inferRouterOutputs } from '@trpc/server';
import { createSignal, For } from 'solid-js';
import { client } from '../lib/trpc-client';
import type { AppRouter } from '../trpc/router/_index';

export type User = inferRouterOutputs<AppRouter>['user']['getUsers'][number];

interface UserProps {
	users: User[];
}
export const UserList = ({ users: initialUsers }: UserProps) => {
	const [users, setUsers] = createSignal(initialUsers);
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
	return (
		<ul class="grid p-3 w-60 gap-4 content-start">
			<For each={users()}>
				{(user) => (
					<li
						class="px-4 py-2 h-16 flex items-center text-xl font-sans text-white w-full"
						classList={{
							'bg-blue-900': user.isCurrentUser,
							'bg-slate-900': !user.isCurrentUser,
						}}>
						{user.name}
					</li>
				)}
			</For>
		</ul>
	);
};
