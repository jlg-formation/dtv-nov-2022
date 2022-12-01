import type L from "leaflet";

export const getStravaBoundsFromLeafletBounds = (
  bounds: L.LatLngBounds
): string => {
  return `${bounds.getSouthWest().lat},${bounds.getSouthWest().lng},${
    bounds.getNorthEast().lat
  },${bounds.getNorthEast().lng}`;
};
