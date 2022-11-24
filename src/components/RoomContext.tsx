import { createContext, ParentProps, useContext } from 'solid-js';

const RoomIdContext = createContext<{ roomId: string; userId: string }>();

interface ProviderProps extends ParentProps {
	roomId: string;
	userId: string;
}

export const RoomContextProvider = ({
	children,
	roomId,
	userId,
}: ProviderProps) => {
	return (
		<RoomIdContext.Provider value={{ roomId, userId }}>
			{children}
		</RoomIdContext.Provider>
	);
};

export const useRoomId = () => useContext(RoomIdContext)!;
