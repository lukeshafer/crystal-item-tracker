import { locationSignal } from '../lib/state';
import { Component, For, ParentProps } from 'solid-js';
import type { LocationMap } from '../lib/location-data';
import { HoverBox } from './Tracker';

const [currentLocation, setCurrentLocation] = locationSignal;

export interface Props extends ParentProps {
	locations: LocationMap;
	positionModifier: number;
}

interface LocationDotProps {
	name: string;
	setLocation: () => void;
}
const LocationDot = ({ name, setLocation }: LocationDotProps) => {
	let tooltip: HTMLDivElement;
	const showTooltip = () => (tooltip.style.visibility = 'visible');
	const hideTooltip = () => (tooltip.style.visibility = 'hidden');
	return (
		<button
			class="absolute inset-0 block w-full h-full bg-pink-400"
			classList={{
				'bg-gray-400': currentLocation().name !== name,
				'bg-pink-400': currentLocation().name === name,
			}}
			onMouseEnter={showTooltip}
			onMouseLeave={hideTooltip}
			onFocus={showTooltip}
			onBlur={hideTooltip}
			onClick={() => {
				setLocation();
			}}>
			<HoverBox ref={tooltip!}>{name}</HoverBox>
		</button>
	);
};

export const LocationsOnMap: Component<Props> = ({
	locations,
	positionModifier,
}: Props) => {
	const setNewLocation = (name: string) => () => {
		setCurrentLocation(locations.get(name)!);
	};
	return (
		<>
			<ul>
				<For each={[...locations]}>
					{([name, location]) => (
						<li
							class="absolute w-4 h-4 -ml-2 -mt-2"
							style={{
								left: `${location.map_locations![0]!.x * positionModifier}px`,
								top: `${location.map_locations![0]!.y * positionModifier}px`,
							}}>
							<LocationDot name={name} setLocation={setNewLocation(name)} />
						</li>
					)}
				</For>
			</ul>
		</>
	);
};
