import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import marsLocations from '../../data/marsLocations';
import { latLngToVector3, vector3ToLatLng, MARS_PHYSICAL_CONSTANTS } from './globeUtils';
import { generateProceduralMarsTexture, generateProceduralMolaGlobeTexture } from './marsTextureFallback';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Compass,
  MapPin,
  Tag,
  Crosshair,
  ChevronDown,
  Radio,
  Layers,
  ArrowDownCircle,
  X,
} from 'lucide-react';
import { createMissionControlMarkerSvg, computeLabelPlacements } from '../../utils/markerCollision';
import './MarsGlobe.css';

const GLOBE_RADIUS = 5;
const MARS_AXIAL_TILT = (MARS_PHYSICAL_CONSTANTS.axialTiltDeg * Math.PI) / 180;

// Authentic Mars atmospheric haze shader (Rayleigh-Mie dust scattering at glancing angles)
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform vec3 color;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    // Subtle Rayleigh-Mie glancing angle limb glow (aerosol optical depth ~0.4)
    float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
    float intensity = pow(fresnel, 3.8) * 0.70;
    gl_FragColor = vec4(color, intensity);
  }
`;

function checkWebGlSupported() {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function MarsGlobe({
  locations = marsLocations,
  selectedLocation = null,
  onLocationSelect = () => {},
  onScrollToMap = null,
  onExploreTerrain = null,
  height = '82vh',
  className = '',
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const globeMeshRef = useRef(null);
  const globeGroupRef = useRef(null);
  const atmosphereRef = useRef(null);
  const markersGroupRef = useRef(null);
  const markerMeshesMapRef = useRef(new Map());
  const animationFrameIdRef = useRef(null);
  const isInteractingRef = useRef(false);
  const cameraTargetRef = useRef(null);
  const pulseRingsRef = useRef([]);

  // Stored textures for instant switching
  const texturesCacheRef = useRef({
    viking: null,
    mola: null,
  });

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  }, []);

  // UI state
  const [autoRotate, setAutoRotate] = useState(!prefersReducedMotion);
  const [showLabels, setShowLabels] = useState(true);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [globeLayer, setGlobeLayer] = useState('viking'); // 'viking' | 'mola'
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const hoveredLocationRef = useRef(null);
  useEffect(() => {
    hoveredLocationRef.current = hoveredLocation;
  }, [hoveredLocation]);

  const [pointerCoords, setPointerCoords] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [isLoaded, setIsLoaded] = useState(false);
  const [textureSourceNote, setTextureSourceNote] = useState('Loading NASA Viking 2K equirectangular mosaic...');
  const [webGlSupported, setWebGlSupported] = useState(checkWebGlSupported);
  const [screenMarkers, setScreenMarkers] = useState([]);

  // Top highlight sites for quick jump pills
  const featuredSites = useMemo(() => {
    const featuredIds = ['perseverance', 'curiosity', 'pathfinder', 'viking1', 'opportunity', 'zhurong', 'olympus-mons'];
    return locations.filter((loc) => featuredIds.includes(loc.id));
  }, [locations]);

  // Camera smooth navigation helper
  const navigateToLocation = useCallback((location, instant = false) => {
    if (!location || !cameraRef.current || !globeGroupRef.current) return;

    const localVec = latLngToVector3(location.lat, location.lng, GLOBE_RADIUS);
    const worldVec = localVec.clone().applyMatrix4(globeGroupRef.current.matrixWorld);

    const currentDist = cameraRef.current.position.length();
    const targetDist = Math.max(7.8, Math.min(10.5, currentDist));
    const targetPos = worldVec.clone().normalize().multiplyScalar(targetDist);

    if (instant || prefersReducedMotion) {
      cameraRef.current.position.copy(targetPos);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      cameraTargetRef.current = null;
    } else {
      cameraTargetRef.current = {
        targetPosition: targetPos,
        startPosition: cameraRef.current.position.clone(),
        progress: 0,
        duration: 55,
      };
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (selectedLocation) {
      navigateToLocation(selectedLocation);
    }
  }, [selectedLocation, navigateToLocation]);

  // Main Three.js Scene Setup & Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container || !webGlSupported) return;

    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 600;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 1000);
    camera.position.set(0, 1.8, 11.2);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL init failed:', e);
      setTimeout(() => setWebGlSupported(false), 0);
      return;
    }

    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.85;
    controls.minDistance = 6.6;
    controls.maxDistance = 21.0;
    controls.enablePan = false;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isInteractingRef.current = true;
    });
    controls.addEventListener('end', () => {
      isInteractingRef.current = false;
    });

    // 4. Directional Solar Illumination + Dark-Side Fill
    const sunLight = new THREE.DirectionalLight(0xfff7eb, 1.9);
    sunLight.position.set(16, 5, 12);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x221a16, 0.52);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x382822, 0.38);
    rimLight.position.set(-16, -3, -10);
    scene.add(rimLight);

    // 5. Starfield
    const starCount = 900;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 90 + Math.random() * 40;
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xd4d4d8,
      size: 1.1,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Globe Group with true Mars Axial Tilt (25.19°)
    const globeGroup = new THREE.Group();
    globeGroup.rotation.z = -MARS_AXIAL_TILT;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 7. Mars Sphere Geometry & Material
    const marsGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 72, 72);

    const textureLoader = new THREE.TextureLoader();

    // Prepare procedural MOLA topography texture for instant layer toggle
    const molaTex = generateProceduralMolaGlobeTexture(2048, 1024);
    texturesCacheRef.current.mola = molaTex;

    const applyTexture = (texture, isOfficial = true) => {
      texturesCacheRef.current.viking = texture;

      const marsMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.9,
        metalness: 0.04,
      });

      const marsMesh = new THREE.Mesh(marsGeometry, marsMaterial);
      globeGroup.add(marsMesh);
      globeMeshRef.current = marsMesh;

      // 8. Atmospheric Glow Shell (Natural Martian peach-amber limb)
      const atmoGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, 64, 64);
      const atmoMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        uniforms: {
          color: { value: new THREE.Color('#d97645') },
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      });
      const atmosphereMesh = new THREE.Mesh(atmoGeometry, atmoMaterial);
      globeGroup.add(atmosphereMesh);
      atmosphereRef.current = atmosphereMesh;

      setLoadingProgress(100);
      setIsLoaded(true);
      setTextureSourceNote(
        isOfficial
          ? 'NASA Viking MDIM 2.1 / USGS Astrogeology Global Mosaic (2K)'
          : 'Procedural High-Albedo Martian Albedo Baseline'
      );
    };

    textureLoader.load(
      '/textures/mars_surface_2k.jpg',
      (texture) => {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;
        applyTexture(texture, true);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const pct = Math.round((xhr.loaded / xhr.total) * 65) + 35;
          setLoadingProgress(pct);
        }
      },
      (err) => {
        console.warn('NASA 2K texture load failed, applying procedural canvas fallback:', err);
        const fallbackTex = generateProceduralMarsTexture(1024, 512);
        applyTexture(fallbackTex, false);
      }
    );

    // 9. Markers Group
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const rings = [];
    const meshesMap = new Map();

    locations.forEach((loc) => {
      const markerGroup = new THREE.Group();
      const pos = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS * 1.003);
      markerGroup.position.copy(pos);

      markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());

      const isCurSelected = selectedLocation?.id === loc.id;
      const markerColor = isCurSelected ? 0xf5c542 : 0xf5f5f0;

      const dotGeo = new THREE.SphereGeometry(isCurSelected ? 0.09 : 0.065, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: markerColor });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      markerGroup.add(dotMesh);

      const ringGeo = new THREE.RingGeometry(0.1, 0.14, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isCurSelected ? 0.95 : 0.65,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      markerGroup.add(ringMesh);

      const pulseGeo = new THREE.RingGeometry(0.15, 0.19, 24);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xf5c542,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isCurSelected ? 0.8 : 0.0,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      markerGroup.add(pulseMesh);
      rings.push({ mesh: pulseMesh, locId: loc.id, baseScale: 1 });

      const hitGeo = new THREE.SphereGeometry(0.32, 12, 12);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { location: loc };
      markerGroup.add(hitMesh);

      markersGroup.add(markerGroup);
      meshesMap.set(loc.id, { markerGroup, dotMesh, ringMesh, pulseMesh, hitMesh });
    });

    markerMeshesMapRef.current = meshesMap;
    pulseRingsRef.current = rings;

    // 10. Raycasting for hover & click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const hitMeshes = Array.from(markerMeshesMapRef.current.values()).map((m) => m.hitMesh);
      const markerIntersects = raycaster.intersectObjects(hitMeshes, false);

      if (markerIntersects.length > 0) {
        const hit = markerIntersects[0];
        const worldPos = new THREE.Vector3();
        hit.object.getWorldPosition(worldPos);

        if (worldPos.dot(camera.position) > 0) {
          container.style.cursor = 'pointer';
          setHoveredLocation(hit.object.userData.location);
          return;
        }
      }

      if (globeMeshRef.current) {
        const globeIntersects = raycaster.intersectObject(globeMeshRef.current, false);
        if (globeIntersects.length > 0) {
          const pt = globeIntersects[0].point;
          const localPt = pt.clone().applyMatrix4(globeGroup.matrixWorld.clone().invert());
          const coords = vector3ToLatLng(localPt, GLOBE_RADIUS);
          setPointerCoords(coords);
          container.style.cursor = 'grab';
        } else {
          setPointerCoords(null);
          container.style.cursor = 'default';
        }
      } else {
        container.style.cursor = 'default';
      }

      setHoveredLocation(null);
    };

    const handlePointerClick = () => {
      const hitMeshes = Array.from(markerMeshesMapRef.current.values()).map((m) => m.hitMesh);
      const markerIntersects = raycaster.intersectObjects(hitMeshes, false);

      if (markerIntersects.length > 0) {
        const hit = markerIntersects[0];
        const worldPos = new THREE.Vector3();
        hit.object.getWorldPosition(worldPos);

        if (worldPos.dot(camera.position) > 0) {
          const loc = hit.object.userData.location;
          onLocationSelect(loc);
          navigateToLocation(loc);
          return;
        }
      }

      // Clicking empty space or globe surface deselects
      if (onLocationSelect) {
        onLocationSelect(null);
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handlePointerMove);
    domElement.addEventListener('click', handlePointerClick);

    // 11. Responsive Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        }
      }
    });
    resizeObserver.observe(container);

    let isVisible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    visibilityObserver.observe(container);

    // 12. Main Render Loop
    let lastTime = performance.now();
    let pulseAngle = 0;

    const animate = (time) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (autoRotate && !isInteractingRef.current && !cameraTargetRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotateY(0.0016);
      }

      if (cameraTargetRef.current) {
        const target = cameraTargetRef.current;
        target.progress += 1;
        const t = Math.min(target.progress / target.duration, 1.0);
        const ease = 1 - Math.pow(1 - t, 3);

        camera.position.lerpVectors(target.startPosition, target.targetPosition, ease);
        controls.target.set(0, 0, 0);

        if (t >= 1.0) {
          cameraTargetRef.current = null;
        }
      }

      controls.update();

      pulseAngle += delta * 3.5;
      const pulseScale = 1 + (Math.sin(pulseAngle) * 0.5 + 0.5) * 0.9;
      const pulseOpacity = 0.85 * (1 - (pulseScale - 1) / 0.9);

      pulseRingsRef.current.forEach(({ mesh, locId }) => {
        const isCurSel = selectedLocation?.id === locId;
        if (isCurSel) {
          mesh.scale.set(pulseScale, pulseScale, pulseScale);
          mesh.material.opacity = pulseOpacity;
          mesh.material.color.setHex(0xf5c542);
        } else {
          mesh.scale.set(1, 1, 1);
          mesh.material.opacity = 0;
        }
      });

      if (renderer && camera && globeGroupRef.current) {
        const projected = [];
        const camPos = camera.position;
        const rect = renderer.domElement.getBoundingClientRect();

        locations.forEach((loc) => {
          const localVec = latLngToVector3(loc.lat, loc.lng, GLOBE_RADIUS * 1.004);
          const worldPos = localVec.clone().applyMatrix4(globeGroupRef.current.matrixWorld);

          const worldNorm = worldPos.clone().normalize();
          const camNorm = camPos.clone().normalize();
          const facingDot = worldNorm.dot(camNorm);

          // Far-side fade out based on camera-facing angle:
          // Smooth fade between facingDot 0.05 and 0.25, fully visible above 0.25
          if (facingDot > 0.05) {
            const opacity = Math.min(Math.max((facingDot - 0.05) / 0.2, 0), 1);
            const screenVec = worldPos.clone().project(camera);
            const x = ((screenVec.x + 1) * rect.width) / 2;
            const y = ((-screenVec.y + 1) * rect.height) / 2;

            projected.push({
              id: loc.id,
              name: loc.name,
              mission: loc.mission,
              type: loc.type,
              lat: loc.lat,
              lng: loc.lng,
              x,
              y,
              opacity,
              isSelected: selectedLocation?.id === loc.id,
              isHovered: hoveredLocationRef.current?.id === loc.id,
              coordsText: `${Math.abs(loc.lat).toFixed(2)}°${loc.lat >= 0 ? 'N' : 'S'}, ${Math.abs(loc.lng).toFixed(2)}°${loc.lng >= 0 ? 'E' : 'W'}`,
            });
          }
        });

        // LOD level based on camera distance (zoomed out: > 14, mid: 9.5-14, zoomed in: < 9.5)
        const camDist = camPos.length();
        let zoomLevel = 3;
        if (camDist > 14) zoomLevel = 2;
        else if (camDist < 9.5) zoomLevel = 6;
        else zoomLevel = 4;

        const placements = computeLabelPlacements(projected, {
          zoomLevel,
          bounds: { width: rect.width, height: rect.height },
        });

        const withPlacements = projected.map((p) => ({
          ...p,
          labelPlacement: placements.get(p.id) || { showLabel: false, labelSide: 'right' },
        }));

        setScreenMarkers(withPlacements);
      } else {
        setScreenMarkers([]);
      }

      renderer.render(scene, camera);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('click', handlePointerClick);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      controls.dispose();

      starGeo.dispose();
      starMat.dispose();
      marsGeometry.dispose();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [locations, webGlSupported, autoRotate, showLabels, onLocationSelect, navigateToLocation, selectedLocation]);

  // Update marker styles when selectedLocation changes
  useEffect(() => {
    if (!markerMeshesMapRef.current) return;
    markerMeshesMapRef.current.forEach(({ dotMesh, ringMesh, pulseMesh }, id) => {
      const isSel = selectedLocation?.id === id;
      const color = isSel ? 0xf5c542 : 0xf5f5f0;
      dotMesh.material.color.setHex(color);
      dotMesh.scale.setScalar(isSel ? 1.4 : 1.0);
      ringMesh.material.color.setHex(color);
      ringMesh.material.opacity = isSel ? 0.95 : 0.65;
      if (pulseMesh) {
        pulseMesh.material.opacity = isSel ? 0.8 : 0;
      }
    });
  }, [selectedLocation]);

  // Switch Globe Basemap Texture (Viking Visible vs MOLA Altimetry)
  useEffect(() => {
    if (!globeMeshRef.current) return;
    if (globeLayer === 'mola') {
      if (texturesCacheRef.current.mola) {
        globeMeshRef.current.material.map = texturesCacheRef.current.mola;
        globeMeshRef.current.material.needsUpdate = true;
        setTextureSourceNote('NASA MGS MOLA Global Topographic Laser Altimetry (~463m/px)');
      }
    } else {
      if (texturesCacheRef.current.viking) {
        globeMeshRef.current.material.map = texturesCacheRef.current.viking;
        globeMeshRef.current.material.needsUpdate = true;
        setTextureSourceNote('NASA Viking MDIM 2.1 / USGS Astrogeology Global Color Mosaic (2K)');
      }
    }
  }, [globeLayer]);

  // Control handlers
  const handleZoomIn = () => {
    if (cameraRef.current) {
      const currentDist = cameraRef.current.position.length();
      const newDist = Math.max(currentDist - 1.8, 6.8);
      cameraRef.current.position.setLength(newDist);
      controlsRef.current?.update();
    }
  };

  const handleZoomOut = () => {
    if (cameraRef.current) {
      const currentDist = cameraRef.current.position.length();
      const newDist = Math.min(currentDist + 2.2, 20.0);
      cameraRef.current.position.setLength(newDist);
      controlsRef.current?.update();
    }
  };

  const handleResetView = () => {
    if (cameraRef.current && globeGroupRef.current) {
      cameraRef.current.position.set(0, 1.8, 11.2);
      globeGroupRef.current.rotation.set(0, 0, -MARS_AXIAL_TILT);
      controlsRef.current?.target.set(0, 0, 0);
      controlsRef.current?.update();
    }
  };

  const toggleAtmosphere = () => {
    if (atmosphereRef.current) {
      atmosphereRef.current.visible = !showAtmosphere;
      setShowAtmosphere(!showAtmosphere);
    }
  };

  return (
    <div className={`mars-globe-container ${className}`} style={{ height }}>
      {/* 3D Canvas Mounting Container */}
      <div ref={mountRef} className="mars-globe-viewport" />

      {/* WebGL Unsupported Fallback */}
      {!webGlSupported && (
        <div className="mars-globe-fallback">
          <div className="mars-fallback-card">
            <Radio size={32} color="#F5C542" />
            <h3 className="mars-fallback-title">3D WebGL Acceleration Unavailable</h3>
            <p className="mars-fallback-text">
              Your browser or hardware acceleration settings currently do not support WebGL 3D rendering.
              You can explore the verified landing sites directly via our high-resolution 2D GIS map.
            </p>
            {onScrollToMap && (
              <button type="button" className="mars-fallback-btn" onClick={onScrollToMap}>
                Switch to 2D Planetary GIS Map
              </button>
            )}
          </div>
        </div>
      )}

      {/* Asset Loading Splash */}
      {!isLoaded && webGlSupported && (
        <div className="mars-globe-loader">
          <div className="mars-loader-content">
            <div className="mars-loader-header">
              <span className="mars-loader-tag">MISSION CONTROL // INITIALIZING</span>
              <span className="mono">{loadingProgress}%</span>
            </div>
            <div className="mars-loader-bar">
              <div className="mars-loader-fill" style={{ width: `${loadingProgress}%` }} />
            </div>
            <span className="mars-loader-subtext mono">
              FETCHING NASA PDS CARTOGRAPHIC PROJECTION & AREOGRAPHIC GEOMETRY...
            </span>
          </div>
        </div>
      )}

      {/* Unified Top Overlays Stack (Non-overlapping, organized flex column) */}
      <div className="mars-globe-header-overlay">
        {/* Top Row: Left Telemetry & Right Basemap Toggle */}
        <div className="mars-globe-top-row">
          <div className="mars-hud-telemetry">
            <div className="mars-hud-chip mars-hud-chip--badge">
              <span className="mars-status-dot" />
              <span className="mars-hud-label mono">ORBITAL 3D GIS</span>
            </div>

            <div className="mars-hud-chip mono">
              <Compass size={11} color="var(--accent-amber, #d99b26)" />
              <span>TILT: {MARS_PHYSICAL_CONSTANTS.axialTiltDeg}°</span>
            </div>

            <div className="mars-hud-chip mono">
              <span>Ls: 64° [N. SPRING]</span>
            </div>

            {pointerCoords && (
              <div className="mars-hud-chip mars-hud-chip--active mono">
                <Crosshair size={11} color="var(--accent-amber, #d99b26)" />
                <span>
                  {Math.abs(pointerCoords.lat).toFixed(1)}°{pointerCoords.lat >= 0 ? 'N' : 'S'},{' '}
                  {Math.abs(pointerCoords.lng).toFixed(1)}°{pointerCoords.lng >= 0 ? 'E' : 'W'}
                </span>
              </div>
            )}
          </div>

          {/* Right Header: Viking / MOLA Toggle + Shortened Citation */}
          <div className="mars-globe-header-right">
            <div className="mars-globe-layer-toggle mono">
              <button
                type="button"
                className={`mars-globe-toggle-btn ${globeLayer === 'viking' ? 'mars-globe-toggle-btn--active' : ''}`}
                onClick={() => setGlobeLayer('viking')}
                title="NASA Viking MDIM 2.1 Global Controlled Color Mosaic"
              >
                Viking Color
              </button>
              <button
                type="button"
                className={`mars-globe-toggle-btn ${globeLayer === 'mola' ? 'mars-globe-toggle-btn--active' : ''}`}
                onClick={() => setGlobeLayer('mola')}
                title="NASA MOLA Laser Altimetry Topographic Map"
              >
                MOLA Topo
              </button>
            </div>

            <div className="mars-hud-meta mono" title={textureSourceNote}>
              <span className="mars-meta-cit">{globeLayer === 'mola' ? 'NASA MOLA (~463m/px)' : 'Viking MDIM 2.1 (2K)'}</span>
            </div>
          </div>
        </div>

        {/* SITES bar: single row, horizontally scrollable, placed directly below top row */}
        <div className="mars-globe-quick-strip">
          <span className="mars-strip-label mono">
            <MapPin size={11} color="var(--accent-amber, #d99b26)" /> SITES:
          </span>
          <div className="mars-strip-chips">
            {featuredSites.map((site) => {
              const isSelected = selectedLocation?.id === site.id;
              const isHovered = hoveredLocation?.id === site.id;
              return (
                <button
                  key={site.id}
                  type="button"
                  className={`mars-strip-chip ${isSelected ? 'mars-strip-chip--selected' : ''} ${
                    isHovered ? 'mars-strip-chip--hovered' : ''
                  }`}
                  onMouseEnter={() => setHoveredLocation(site)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  onClick={() => {
                    onLocationSelect(site);
                    navigateToLocation(site);
                  }}
                >
                  {isSelected && <span className="mars-strip-chip-dot" />}
                  {site.name.split('(')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Mission Control Tactical Markers & Collision-Resolved Labels */}
      <div className="mars-globe-markers-overlay" aria-label="Mars Surface Markers">
        {screenMarkers.map((m) => {
          const placement = m.labelPlacement || { showLabel: false, labelSide: 'right' };
          // Marker labels are hidden by default; show ONLY on hover or select
          const showLabel = (m.isHovered || m.isSelected) && m.opacity > 0.35;
          const isInteractive = m.opacity > 0.25;

          return (
            <div
              key={m.id}
              className={`mc-globe-marker-node ${m.isSelected ? 'mc-globe-marker-node--selected' : ''}`}
              style={{
                position: 'absolute',
                left: `${m.x}px`,
                top: `${m.y}px`,
                transform: 'translate(-50%, -50%)',
                opacity: m.opacity,
                pointerEvents: isInteractive ? 'auto' : 'none',
                zIndex: m.isSelected ? 50 : m.isHovered ? 40 : 20,
              }}
            >
              <button
                type="button"
                className="mc-marker-container"
                tabIndex={isInteractive ? 0 : -1}
                aria-label={m.name}
                onClick={(e) => {
                  e.stopPropagation();
                  const target = locations.find((l) => l.id === m.id);
                  if (target) {
                    onLocationSelect(target);
                    navigateToLocation(target);
                  }
                }}
                onMouseEnter={() => {
                  const target = locations.find((l) => l.id === m.id);
                  if (target) setHoveredLocation(target);
                }}
                onMouseLeave={() => setHoveredLocation(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = locations.find((l) => l.id === m.id);
                    if (target) {
                      onLocationSelect(target);
                      navigateToLocation(target);
                    }
                  }
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: createMissionControlMarkerSvg(m.type, m.isSelected, m.isHovered),
                  }}
                />
                <div
                  className={`mc-marker-label mc-label--${placement.labelSide} ${
                    showLabel ? 'mc-marker-label--visible' : ''
                  } ${m.isSelected ? 'mc-marker-label--selected' : ''}`}
                >
                  <span className="mc-label-name">{m.name.split('(')[0].trim()}</span>
                  {m.isSelected && (
                    <span className="mc-label-coords">
                      {Math.abs(m.lat).toFixed(2)}°{m.lat >= 0 ? 'N' : 'S'}, {Math.abs(m.lng).toFixed(2)}°{m.lng >= 0 ? 'E' : 'W'}
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Selected Site Summary Dossier Overlay (Compact & dismissible) */}
      {selectedLocation && (
        <div className="mars-globe-selected-dossier">
          <div className="mars-dossier-header">
            <div className="mars-dossier-header-badges">
              <span className="mars-dossier-tag mono">VERIFIED SITE</span>
              <span className="mars-dossier-status mono">{selectedLocation.status}</span>
            </div>
            <button
              type="button"
              className="mars-dossier-close-btn"
              onClick={() => onLocationSelect(null)}
              aria-label="Close Site Details"
              title="Close Site Details"
            >
              <X size={12} />
            </button>
          </div>
          <h3 className="mars-dossier-name">{selectedLocation.name}</h3>
          <p className="mars-dossier-mission mono">
            {selectedLocation.mission} • {selectedLocation.agency || 'NASA'}
          </p>

          <div className="mars-dossier-stats mono">
            <div className="mars-dossier-stat">
              <span className="mars-stat-label">COORDS</span>
              <span className="mars-stat-val">
                {Math.abs(selectedLocation.lat).toFixed(2)}°{selectedLocation.lat >= 0 ? 'N' : 'S'},{' '}
                {Math.abs(selectedLocation.lng).toFixed(2)}°{selectedLocation.lng >= 0 ? 'E' : 'W'}
              </span>
            </div>
            <div className="mars-dossier-stat">
              <span className="mars-stat-label">ELEV</span>
              <span className="mars-stat-val">{selectedLocation.elevation || 'MOLA'}</span>
            </div>
          </div>

          {selectedLocation.notableDiscovery && (
            <p className="mars-dossier-desc">
              <strong>Finding:</strong> {selectedLocation.notableDiscovery.length > 95 ? `${selectedLocation.notableDiscovery.slice(0, 90)}…` : selectedLocation.notableDiscovery}
            </p>
          )}

          {selectedLocation.id === 'perseverance' && onExploreTerrain && (
            <button
              type="button"
              className="mars-dossier-action-btn mars-dossier-action-btn--terrain"
              onClick={() => onExploreTerrain(selectedLocation)}
            >
              <Compass size={12} color="#080909" />
              <span>Explore 3D Jezero DEM</span>
            </button>
          )}

          {onScrollToMap && (
            <button
              type="button"
              className="mars-dossier-action-btn"
              onClick={() => onScrollToMap(selectedLocation)}
            >
              <ArrowDownCircle size={12} color="#080909" />
              <span>Inspect on 2D GIS Map</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Mission Control Action Toolbar (Right Side) */}
      <div className="mars-globe-controls">
        <button
          type="button"
          className={`mars-ctrl-btn ${autoRotate ? 'mars-ctrl-btn--active' : ''}`}
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Pause planetary rotation' : 'Resume planetary rotation'}
          aria-label={autoRotate ? 'Pause planetary rotation' : 'Resume planetary rotation'}
        >
          {autoRotate ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <button
          type="button"
          className="mars-ctrl-btn"
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn size={15} />
        </button>

        <button
          type="button"
          className="mars-ctrl-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut size={15} />
        </button>

        <button
          type="button"
          className="mars-ctrl-btn"
          onClick={handleResetView}
          title="Reset View Orientation"
          aria-label="Reset view orientation"
        >
          <RotateCcw size={15} />
        </button>

        <button
          type="button"
          className={`mars-ctrl-btn ${showLabels ? 'mars-ctrl-btn--active' : ''}`}
          onClick={() => setShowLabels(!showLabels)}
          title={showLabels ? 'Hide Site Labels' : 'Show Site Labels'}
          aria-label="Toggle site labels"
        >
          <Tag size={15} />
        </button>

        <button
          type="button"
          className={`mars-ctrl-btn ${showAtmosphere ? 'mars-ctrl-btn--active' : ''}`}
          onClick={toggleAtmosphere}
          title={showAtmosphere ? 'Atmosphere Haze: ON' : 'Atmosphere Haze: OFF'}
          aria-label="Toggle atmospheric rim"
        >
          <Layers size={15} />
        </button>
      </div>

      {/* Bottom Hint Banner */}
      <div className="mars-globe-bottom-hint mono">
        <span>DRAG TO ORBIT • SCROLL TO ZOOM</span>
        {onScrollToMap && (
          <button type="button" className="mars-scroll-prompt-btn" onClick={onScrollToMap}>
            <span>CONTINUE TO 2D GIS MAP</span>
            <ChevronDown size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default MarsGlobe;
