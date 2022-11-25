import { createContext, ParentProps, useContext } from 'solid-js';
import type { Item } from '../lib/item-data';

interface Context {
	items: Item[];
}

const RoomContext = createContext<Context>();

type ProviderProps = Context & ParentProps;

export const RoomContextProvider = ({ children, items }: ProviderProps) => {
	return (
		<RoomContext.Provider value={{ items }}>{children}</RoomContext.Provider>
	);
};

export const useRoomContext = () => useContext(RoomContext)!;
