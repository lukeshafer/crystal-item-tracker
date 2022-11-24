//import { locationSignal } from '../lib/state';
import { Component, createSignal, For, ParentProps } from 'solid-js';
import { HoverBox } from './Tracker';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../trpc/router/_index';

type Location = Exclude<
	inferRouterOutputs<AppRouter>['location']['getAll']['locations'],
	undefined
>[number];

export const currentLocationSignal = createSignal<Location>();
const [currentLocation, setCurrentLocation] = currentLocationSignal;

export interface Props extends ParentProps {
	locations: Location[];
	positionModifier: number;
}

interface LocationDotProps {
	location: Location;
	setLocation: () => void;
}
const LocationDot = ({ location, setLocation }: LocationDotProps) => {
	let tooltip: HTMLDivElement;
	const showTooltip = () => (tooltip.style.visibility = 'visible');
	const hideTooltip = () => (tooltip.style.visibility = 'hidden');
	return (
		<button
			class="absolute inset-0 block w-full h-full bg-pink-400"
			classList={{
				'bg-gray-400': currentLocation()?.name !== location.name,
				'bg-pink-400': currentLocation()?.name === location.name,
			}}
			onMouseEnter={showTooltip}
			onMouseLeave={hideTooltip}
			onFocus={showTooltip}
			onBlur={hideTooltip}
			onClick={() => {
				setLocation();
			}}>
			<HoverBox ref={tooltip!}>{location.name}</HoverBox>
		</button>
	);
};

export const LocationsOnMap: Component<Props> = ({
	locations,
	positionModifier,
}: Props) => {
	const setNewLocation = (location: Location) => () => {
		setCurrentLocation(location);
	};
	return (
		<>
			<ul>
				<For each={locations}>
					{(location) => {
						return (
							<li
								class="absolute w-4 h-4 -ml-2 -mt-2"
								style={{
									left: `${location.x * positionModifier}px`,
									top: `${location.y * positionModifier}px`,
								}}>
								<LocationDot
									location={location}
									setLocation={setNewLocation(location)}
								/>
							</li>
						);
					}}
				</For>
			</ul>
		</>
	);
};
