import type L from "leaflet";
import type { DetailedSegment } from "./interfaces/DetailedSegment";

export const getStravaBoundsFromLeafletBounds = (
  bounds: L.LatLngBounds
): string => {
  return `${bounds.getSouthWest().lat},${bounds.getSouthWest().lng},${
    bounds.getNorthEast().lat
  },${bounds.getNorthEast().lng}`;
};

export const getCurrentPosition = (
  options?: PositionOptions
): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const remainingEffort = (s: DetailedSegment): number => {
  return Math.floor(
    s.distance *
      (2 * (+s.local_legend?.effort_count ? +s.local_legend?.effort_count : 1) +
        1)
  );
};
