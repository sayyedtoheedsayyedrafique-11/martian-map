import JezeroTerrain3D from '../JezeroTerrain3D/JezeroTerrain3D';

/**
 * JezeroTerrainViewer
 * Re-exports the production-grade JezeroTerrain3D component for backwards compatibility
 * Powered by USGS Astrogeology / NASA Mars 2020 CTX Science DEM Mosaic (20m/px)
 */
function JezeroTerrainViewer({ onFeatureSelect, onSelectFeature, ...props }) {
  return (
    <JezeroTerrain3D
      onSelectFeature={onSelectFeature || onFeatureSelect}
      {...props}
    />
  );
}

export default JezeroTerrainViewer;
