/**
 * Geographic utility functions
 */

/**
 * Calculates distance between two GPS coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Converts GPS coordinates to grid cell key for clustering
 * @param lat Latitude
 * @param lon Longitude
 * @param gridSize Grid size in degrees (default: 0.01 ≈ 1km)
 * @returns Grid cell key as string
 */
export function toGridCell(lat: number, lon: number, gridSize: number = 0.01): string {
  const gridLat = Math.round(lat / gridSize) * gridSize;
  const gridLon = Math.round(lon / gridSize) * gridSize;
  return `${gridLat.toFixed(2)}_${gridLon.toFixed(2)}`;
}
