import * as THREE from 'three';

/**
 * Converts areographic latitude and longitude to 3D Cartesian coordinates
 * aligned with equirectangular SphereGeometry UV coordinates.
 * 
 * @param {number} lat Latitude in degrees [-90 to +90]
 * @param {number} lng Longitude in degrees [-180 to +180]
 * @param {number} radius Sphere radius
 * @returns {THREE.Vector3}
 */
export function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Inverse conversion: Cartesian vector on sphere to areographic (lat, lng).
 * 
 * @param {THREE.Vector3} vector Point on sphere in local space
 * @returns {{lat: number, lng: number}}
 */
export function vector3ToLatLng(vector, _radius) {
  const norm = vector.clone().normalize();
  const phi = Math.acos(Math.max(-1, Math.min(1, norm.y)));
  const lat = 90 - (phi * 180) / Math.PI;

  const theta = Math.atan2(norm.z, -norm.x);
  let lng = (theta * 180) / Math.PI - 180;
  while (lng < -180) lng += 360;
  while (lng > 180) lng -= 360;

  return { lat, lng };
}

/**
 * Authentic NASA/IAU Mars planetary telemetry parameters.
 */
export const MARS_PHYSICAL_CONSTANTS = {
  axialTiltDeg: 25.19, // IAU obliquity to orbit
  equatorialRadiusKm: 3396.2,
  polarRadiusKm: 3376.2,
  meanRadiusKm: 3389.5,
  surfaceGravity: '3.721 m/s² (0.379 g)',
  solLength: '24h 39m 35.244s',
  orbitalPeriodDays: 686.98,
  atmosphericPressurePa: 610.5, // 6.1 mbar at MOLA zero datum
  datum: 'MOLA Areoid Geoid (Atmospheric Water Triple Point)',
};
