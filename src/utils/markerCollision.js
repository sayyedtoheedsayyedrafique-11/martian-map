/**
 * markerCollision.js — Mission Control Map Marker & Collision Detection System
 * 
 * Provides:
 * 1. Level of detail (LOD) filtering based on zoom/camera distance
 * 2. Label collision detection and side-flipping (right -> left -> top -> bottom)
 * 3. Specific resolution for tightly spaced sites (e.g. Viking 1 vs Mars Pathfinder)
 * 4. SVG shape generation for tactical 8px icons (rover=circle, lander=triangle, landmark=diamond)
 */

export const MAJOR_SITE_IDS = new Set([
  'perseverance',
  'curiosity',
  'olympus-mons',
  'valles-marineris',
  'viking1',
  'perseverance-landing', // Jezero local major
]);

/**
 * Returns marker geometry shape category based on location type
 */
export function getMarkerShapeType(type) {
  if (type === 'landmark') return 'diamond';
  if (type === 'lander' || type === 'helicopter') return 'triangle';
  return 'circle'; // rover default
}

/**
 * Generates an SVG string for 2D Leaflet divIcon
 */
export function createMissionControlMarkerSvg(type = 'rover', isSelected = false, isHovered = false) {
  const shape = getMarkerShapeType(type);
  const strokeColor = '#0a0b0d';
  const strokeWidth = '1.2';
  const fillColor = isSelected ? '#f59e0b' : isHovered ? '#ffffff' : '#9aa1ab';

  let shapeElement = '';
  if (shape === 'triangle') {
    // 8px equilateral triangle centered at (12, 12)
    shapeElement = `<polygon points="12,7.5 16.5,15.5 7.5,15.5" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
  } else if (shape === 'diamond') {
    // 8px diamond centered at (12, 12)
    shapeElement = `<polygon points="12,7.5 16.5,12 12,16.5 7.5,12" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
  } else {
    // 8px circle centered at (12, 12)
    const r = isHovered ? '4.8' : isSelected ? '4.5' : '4';
    shapeElement = `<circle cx="12" cy="12" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
  }

  // Ring for selected marker (16px diameter, 1px amber border)
  const selectedRing = isSelected
    ? `<circle cx="12" cy="12" r="8" fill="none" stroke="#f59e0b" stroke-width="1" class="mc-marker-ring-pulse"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="mc-marker-svg ${isSelected ? 'mc-marker-svg--selected' : ''} ${isHovered ? 'mc-marker-svg--hovered' : ''}">
    ${selectedRing}
    ${shapeElement}
  </svg>`;
}

/**
 * Checks if two 2D bounding boxes overlap
 */
function boxesOverlap(b1, b2, padding = 4) {
  return !(
    b1.x + b1.w + padding <= b2.x ||
    b1.x >= b2.x + b2.w + padding ||
    b1.y + b1.h + padding <= b2.y ||
    b1.y >= b2.y + b2.h + padding
  );
}

/**
 * Computes non-overlapping label layout for screen markers
 * @param {Array} markers Array of { id, name, x, y, isSelected, isHovered, coordsText }
 * @param {Object} options { zoomLevel: number, bounds: { width, height } }
 * @returns {Map<string, { showLabel: boolean, labelSide: 'right' | 'left' | 'top' | 'bottom' }>}
 */
export function computeLabelPlacements(markers, options = {}) {
  const { zoomLevel = 3, bounds = { width: 1200, height: 800 } } = options;
  const placements = new Map();

  // Sort markers by priority descending:
  // Selected (4) > Hovered (3) > Major (2) > Others (1)
  const prioritized = markers.map((m) => {
    const isMajor = MAJOR_SITE_IDS.has(m.id);
    let priority = 1;
    if (m.isSelected) priority = 4;
    else if (m.isHovered) priority = 3;
    else if (isMajor) priority = 2;

    // Approximate label dimensions (10.5px mono font ~ 6.8px per char + 16px padding)
    const displayName = m.name ? m.name.split('(')[0].trim() : '';
    const labelWidth = Math.max(displayName.length * 7 + 16, 70);
    const labelHeight = m.isSelected && m.coordsText ? 36 : 22;

    return {
      ...m,
      displayName,
      priority,
      isMajor,
      labelWidth,
      labelHeight,
    };
  }).sort((a, b) => b.priority - a.priority);

  const placedBoxes = [];

  // Register marker dot collision boxes (16x16px centered at marker) so labels don't cover other dots
  prioritized.forEach((m) => {
    placedBoxes.push({
      id: `dot-${m.id}`,
      x: m.x - 8,
      y: m.y - 8,
      w: 16,
      h: 16,
      isDot: true,
    });
  });

  for (const m of prioritized) {
    // Level of detail check:
    // Zoomed out (zoom < 3): only show labels for selected, hovered, or major sites
    // Mid zoom (3 to 4): show labels for rovers/landers and major sites
    // High zoom (>= 5): show all
    let shouldAttemptLabel = true;
    if (zoomLevel < 3) {
      shouldAttemptLabel = m.isSelected || m.isHovered || m.isMajor;
    } else if (zoomLevel < 5) {
      shouldAttemptLabel = m.isSelected || m.isHovered || m.isMajor || m.type === 'rover' || m.type === 'lander';
    }

    if (!shouldAttemptLabel) {
      placements.set(m.id, { showLabel: false, labelSide: 'right' });
      continue;
    }

    const dotOffset = 12; // 10px from edge of 8px dot (radius 4px + 8px gap)
    const candidates = [
      // 1. Right (default)
      {
        side: 'right',
        x: m.x + dotOffset,
        y: m.y - m.labelHeight / 2,
        w: m.labelWidth,
        h: m.labelHeight,
      },
      // 2. Left
      {
        side: 'left',
        x: m.x - dotOffset - m.labelWidth,
        y: m.y - m.labelHeight / 2,
        w: m.labelWidth,
        h: m.labelHeight,
      },
      // 3. Top
      {
        side: 'top',
        x: m.x - m.labelWidth / 2,
        y: m.y - dotOffset - m.labelHeight,
        w: m.labelWidth,
        h: m.labelHeight,
      },
      // 4. Bottom
      {
        side: 'bottom',
        x: m.x - m.labelWidth / 2,
        y: m.y + dotOffset,
        w: m.labelWidth,
        h: m.labelHeight,
      },
    ];

    let chosenPlacement = null;

    for (const cand of candidates) {
      // Check viewport boundary
      if (
        cand.x < 10 ||
        cand.x + cand.w > bounds.width - 10 ||
        cand.y < 35 ||
        cand.y + cand.h > bounds.height - 10
      ) {
        continue;
      }

      // Check collision with already placed labels (and other marker dots)
      let collides = false;
      for (const placed of placedBoxes) {
        // Skip self dot
        if (placed.id === `dot-${m.id}`) continue;

        if (boxesOverlap(cand, placed, 4)) {
          collides = true;
          break;
        }
      }

      if (!collides) {
        chosenPlacement = cand;
        break;
      }
    }

    if (chosenPlacement) {
      placedBoxes.push({
        id: `label-${m.id}`,
        ...chosenPlacement,
      });
      placements.set(m.id, { showLabel: true, labelSide: chosenPlacement.side });
    } else {
      // If selected or hovered, always force show on best side even if snug
      if (m.isSelected || m.isHovered) {
        const forced = candidates[0];
        placedBoxes.push({
          id: `label-${m.id}`,
          ...forced,
        });
        placements.set(m.id, { showLabel: true, labelSide: forced.side });
      } else {
        // Suppress label to prevent overlap
        placements.set(m.id, { showLabel: false, labelSide: 'right' });
      }
    }
  }

  return placements;
}
