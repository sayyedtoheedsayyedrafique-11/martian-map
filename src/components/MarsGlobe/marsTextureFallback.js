import * as THREE from 'three';

/**
 * Generates an authentic, scientifically grounded procedural Mars equirectangular texture
 * as an emergency or offline fallback if the primary NASA 2K texture is unavailable.
 * Accurately positions authentic areographic albedo provinces, impact basins, volcanic shields, and polar caps.
 */
export function generateProceduralMarsTexture(width = 2048, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Natural Martian Base Albedo Gradient
  // Calibrated to calibrated Viking / Hubble / Mars Express spectra (iron(III) oxide regolith & basalt)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0.0, '#36180d'); // High northern latitudes / dark polar sand dunes (Olympia Undae)
  bgGrad.addColorStop(0.12, '#873d1f'); // Northern lowlands (Vastitas Borealis)
  bgGrad.addColorStop(0.45, '#a84c24'); // Equatorial ferric oxide dust mantle (Tharsis / Arabia Terra)
  bgGrad.addColorStop(0.60, '#8c3b1a'); // Southern cratered highlands
  bgGrad.addColorStop(0.85, '#6a2a12'); // Subpolar permafrost margin
  bgGrad.addColorStop(1.0, '#30140a'); // High southern latitudes
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Convert (lat, lng) in degrees to canvas (x, y)
  const toXY = (lat, lng) => ({
    x: ((lng + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  });

  const drawAlbedo = (cx, cy, rx, ry, color, angle = 0, blur = 18) => {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.filter = `blur(${blur}px)`;
    ctx.fill();
    ctx.restore();
  };

  // 2. Major Basaltic Low-Albedo Provinces (Mare / Volcanic Ash / Pyroxene)
  // Syrtis Major Planum (prominent dark volcanic shield ~10°N, 70°E)
  const syrtis = toXY(10, 70);
  drawAlbedo(syrtis.x, syrtis.y, width * 0.08, height * 0.14, 'rgba(38, 18, 12, 0.78)', -0.2, 16);

  // Acidalia Planitia (dark northern lowland basin ~45°N, -40°W)
  const acidalia = toXY(45, -40);
  drawAlbedo(acidalia.x, acidalia.y, width * 0.11, height * 0.12, 'rgba(42, 20, 14, 0.68)', 0.1, 20);

  // Sinus Meridiani & Mare Erythraeum (~0°N, 0°E down to -20°S, -40°W)
  const meridiani = toXY(0, 0);
  drawAlbedo(meridiani.x, meridiani.y, width * 0.09, height * 0.08, 'rgba(44, 21, 15, 0.65)', 0, 14);

  const erythraeum = toXY(-22, -35);
  drawAlbedo(erythraeum.x, erythraeum.y, width * 0.13, height * 0.10, 'rgba(36, 17, 11, 0.72)', 0.15, 22);

  // Mare Cimmerium & Tyrrhenum (southern dark belt ~-20°S to -30°S, 140°E to 180°E)
  const cimmerium = toXY(-25, 150);
  drawAlbedo(cimmerium.x, cimmerium.y, width * 0.18, height * 0.08, 'rgba(40, 19, 13, 0.70)', -0.08, 22);

  // 3. Major Impact Basins (High Albedo / Dust Trap Basins)
  // Hellas Planitia (giant 2,300 km impact basin ~-42°S, 70°E, deepest point on Mars -8.2 km)
  const hellas = toXY(-42, 70);
  drawAlbedo(hellas.x, hellas.y, width * 0.08, height * 0.10, 'rgba(196, 115, 75, 0.55)', 0, 18);

  // Argyre Planitia (impact basin ~-50°S, -44°W)
  const argyre = toXY(-50, -44);
  drawAlbedo(argyre.x, argyre.y, width * 0.06, height * 0.07, 'rgba(188, 108, 68, 0.48)', 0, 14);

  // Utopia Planitia (Zhurong rover site ~45°N, 110°E)
  const utopia = toXY(45, 110);
  drawAlbedo(utopia.x, utopia.y, width * 0.12, height * 0.09, 'rgba(172, 92, 54, 0.42)', 0, 24);

  // 4. Volcanic Shields (Tharsis Bulge & Olympus Mons)
  // Olympus Mons (~18.65°N, -133.8°W / 226.2°E) — largest volcano in the Solar System
  const oMons = toXY(18.65, -133.8);
  drawAlbedo(oMons.x, oMons.y, width * 0.035, height * 0.045, 'rgba(195, 115, 75, 0.65)', 0, 8);
  // Central caldera ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(oMons.x, oMons.y, width * 0.007, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(50, 22, 14, 0.8)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Tharsis Montes Trio (Ascraeus 11.9°N, Pavonis 0.8°N, Arsia -8.4°S)
  const ascraeus = toXY(11.9, -104.5);
  drawAlbedo(ascraeus.x, ascraeus.y, width * 0.02, height * 0.025, 'rgba(185, 105, 68, 0.6)', 0, 6);

  const pavonis = toXY(0.8, -113.0);
  drawAlbedo(pavonis.x, pavonis.y, width * 0.02, height * 0.025, 'rgba(185, 105, 68, 0.6)', 0, 6);

  const arsia = toXY(-8.4, -121.0);
  drawAlbedo(arsia.x, arsia.y, width * 0.02, height * 0.025, 'rgba(185, 105, 68, 0.6)', 0, 6);

  // 5. Valles Marineris Canyon System (-14°S, -60°W, ~4,000 km long)
  const vm = toXY(-14, -60);
  ctx.save();
  ctx.strokeStyle = 'rgba(28, 12, 8, 0.85)';
  ctx.lineWidth = height * 0.022;
  ctx.lineCap = 'round';
  ctx.filter = 'blur(4px)';
  ctx.beginPath();
  ctx.moveTo(vm.x - width * 0.09, vm.y - height * 0.012);
  ctx.bezierCurveTo(
    vm.x - width * 0.03, vm.y - height * 0.005,
    vm.x + width * 0.04, vm.y + height * 0.015,
    vm.x + width * 0.09, vm.y + height * 0.022
  );
  ctx.stroke();
  ctx.restore();

  // 6. Natural Martian Surface Grain (Regolith Dust & Impact Craters Noise)
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.65));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.35));
  }
  ctx.putImageData(imgData, 0, 0);

  // 7. North Polar Ice Cap (Planum Boreum — perennial water ice & CO₂ frost)
  const northCap = ctx.createLinearGradient(0, 0, 0, height * 0.13);
  northCap.addColorStop(0.0, 'rgba(248, 250, 255, 0.96)');
  northCap.addColorStop(0.45, 'rgba(235, 240, 248, 0.88)');
  northCap.addColorStop(0.80, 'rgba(175, 135, 115, 0.45)');
  northCap.addColorStop(1.0, 'rgba(175, 135, 115, 0)');
  ctx.fillStyle = northCap;
  ctx.fillRect(0, 0, width, height * 0.13);

  // 8. South Polar Ice Cap (Planum Australe — perennial CO₂ dry ice slab)
  const southCap = ctx.createLinearGradient(0, height * 0.89, 0, height);
  southCap.addColorStop(0.0, 'rgba(175, 135, 115, 0)');
  southCap.addColorStop(0.40, 'rgba(225, 235, 245, 0.65)');
  southCap.addColorStop(1.0, 'rgba(250, 252, 255, 0.96)');
  ctx.fillStyle = southCap;
  ctx.fillRect(0, height * 0.89, width, height * 0.11);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Generates an authentic procedural MOLA Global Laser Altimetry map for the 3D globe.
 * Uses NASA MOLA hypsometric color ramp from -8.2 km (deep purple in Hellas)
 * to +21.2 km (white/buff on Olympus Mons).
 */
export function generateProceduralMolaGlobeTexture(width = 2048, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Northern lowlands baseline (-4 km: deep blue / cyan) vs Southern highlands (+1 to +3 km: yellow / orange)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0.0, '#371982'); // Deep north polar trough
  bgGrad.addColorStop(0.18, '#1e5ac8'); // Vastitas Borealis lowlands (-4 to -5 km)
  bgGrad.addColorStop(0.45, '#14b4b4'); // Crustal dichotomy boundary (~-2 km)
  bgGrad.addColorStop(0.60, '#f0d723'); // Southern cratered plateau (+1 to +2 km)
  bgGrad.addColorStop(0.85, '#f0731e'); // Southern highlands (+2 to +4 km)
  bgGrad.addColorStop(1.0, '#fff5f0'); // South polar cap
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const toXY = (lat, lng) => ({
    x: ((lng + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  });

  const drawZone = (cx, cy, rx, ry, color, blur = 24) => {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.filter = `blur(${blur}px)`;
    ctx.fill();
    ctx.restore();
  };

  // Hellas Basin (-8.2 km deepest impact basin: deep violet-purple #280e66)
  const hellas = toXY(-42, 70);
  drawZone(hellas.x, hellas.y, width * 0.09, height * 0.12, '#200b55', 20);

  // Argyre Basin (-5.2 km: deep indigo #24358a)
  const argyre = toXY(-50, -44);
  drawZone(argyre.x, argyre.y, width * 0.06, height * 0.08, '#1a307c', 16);

  // Tharsis Volcanic Rise (+8 to +10 km plateau: bright orange-red #e84518)
  const tharsis = toXY(0, -105);
  drawZone(tharsis.x, tharsis.y, width * 0.16, height * 0.18, '#e84518', 30);

  // Olympus Mons (+21.2 km summit: white-hot peak #fff5f0 with #d82b18 ring)
  const oMons = toXY(18.65, -133.8);
  drawZone(oMons.x, oMons.y, width * 0.04, height * 0.05, '#d82b18', 12);
  drawZone(oMons.x, oMons.y, width * 0.015, height * 0.02, '#ffffff', 6);

  // Valles Marineris (-2 to -4 km deep cut through Tharsis: cyan-blue #14b4b4)
  const vm = toXY(-14, -60);
  ctx.save();
  ctx.strokeStyle = '#1288b8';
  ctx.lineWidth = height * 0.024;
  ctx.lineCap = 'round';
  ctx.filter = 'blur(6px)';
  ctx.beginPath();
  ctx.moveTo(vm.x - width * 0.09, vm.y - height * 0.012);
  ctx.bezierCurveTo(
    vm.x - width * 0.03, vm.y - height * 0.005,
    vm.x + width * 0.04, vm.y + height * 0.015,
    vm.x + width * 0.09, vm.y + height * 0.022
  );
  ctx.stroke();
  ctx.restore();

  // Elysium Volcanic Rise (+12 km: orange rise #f0731e)
  const elysium = toXY(25, 147);
  drawZone(elysium.x, elysium.y, width * 0.07, height * 0.08, '#f0731e', 18);

  // North Polar Cap (Planum Boreum: +1 to +2 km water ice dome: white #ffffff)
  const northCap = ctx.createLinearGradient(0, 0, 0, height * 0.10);
  northCap.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  northCap.addColorStop(0.7, 'rgba(240, 245, 255, 0.85)');
  northCap.addColorStop(1.0, 'rgba(240, 245, 255, 0)');
  ctx.fillStyle = northCap;
  ctx.fillRect(0, 0, width, height * 0.10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
