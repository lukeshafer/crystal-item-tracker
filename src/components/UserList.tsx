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
		<ul>
			<For each={users()}>
				{(user) => (
					<li style={{ color: user.isCurrentUser ? 'red' : 'white' }}>
						{user.name}
					</li>
				)}
			</For>
		</ul>
	);
};
