# MARS PATHFINDER — Interplanetary Survival Guide: Martian Map
**NASA Space Apps Challenge 2026**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Scientific Integrity](https://img.shields.io/badge/Data-Verified%20NASA%2FUSGS-red)](https://mars.nasa.gov/)

Mars Pathfinder is a modern, scientifically responsible planetary exploration dashboard developed for the **NASA Space Apps Challenge 2026** under the challenge theme **"Interplanetary Survival Guide: Martian Map"**.

The application bridges the gap between raw planetary GIS datasets and intuitive, mission-control-inspired exploration tools. It visualizes verified Mars landing sites, computes spherical geodesic trajectories across the Martian datum, classifies terrain traversal hazards based on USGS mapping, and catalogs atmospheric telemetry from NASA missions.

---

## 🚀 Key Features

### 1. Mars Explorer (Interactive Cartography)
- **Equirectangular Planetary Map**: Explores the surface of Mars with full zoom, pan, and coordinate tracking.
- **Dynamic Coordinate HUD**: Displays instantaneous Mars areographic coordinates ($^{\circ}\text{N/S}$, $^{\circ}\text{E/W}$) under the cursor.
- **Flight & Fly-To Telemetry**: Clicking any exploration site smoothly flies the view to the target with zoom magnification.
- **Search & Filtering**: Instant filter across 13 verified NASA missions, landers, rovers, and landmarks.

### 2. Terrain & Elevation Explorer
- **Altimetric Datum Context**: Based on the Mars Orbiter Laser Altimeter (MOLA) geoid reference (0 m defined at 610.5 Pa triple point of water).
- **Layer Architecture**: Clear differentiation between available global datasets (MOLA Elevation, Viking MDIM 2.1) and cataloged high-resolution swaths (HiRISE, THEMIS) without deceptive synthetic global tiling.
- **USGS Morphological Hazard Analysis**: Evaluates traversal risks for volcanic plains, impact craters, deep canyon systems (Valles Marineris), and active sand dunes (Bagnold).

### 3. Scientific Locations Catalog
- Complete dossiers for:
  - **Rovers**: Curiosity (Gale Crater), Perseverance (Jezero Crater), Opportunity (Meridiani Planum), Spirit (Gusev Crater), Sojourner (Ares Vallis).
  - **Aerial Reconnaissance**: Ingenuity Mars Helicopter (72 successful powered flights).
  - **Landers**: InSight (Elysium Planitia), Phoenix (polar ice cap), Viking 1, Viking 2.
  - **Geological Features**: Olympus Mons (+21.2 km volcano), Valles Marineris (4,000 km canyon), Hellas Basin (-8.2 km impact depression).
- Direct citations and outbound links to NASA JPL and USGS planetary gazetteers.

### 4. Mission Route Planner & Trajectory Analyzer
- **Geodesic Great-Circle Calculation**: Accurately computes spherical surface distances using Mars' mean radius ($R = 3,389.5\text{ km}$).
- **Mission Sol Duration Estimates**: Models autonomous robotic rover traverse rates ($\sim 0.15\text{ km/Sol}$) vs conceptual pressurized crew exploration vehicles ($\sim 12\text{ km/Sol}$).
- **Mandatory Safety Disclaimer**: Strictly marks calculated trajectories as demonstration models, preventing unwarranted claims of traversability without high-resolution digital elevation model (DEM) slope validation.

### 5. Surface Environment & Meteorology
- **Atmospheric Mixing Ratios**: Gas chromatograph breakdown ($95.32\%\text{ CO}_2$, $2.7\%\text{ N}_2$, $1.6\%\text{ Ar}$, etc.).
- **Planetary Physical Parameters**: Quantitative Mars vs. Earth reference table (diameter, gravity $3.72\text{ m/s}^2$, solar sol duration $24\text{h } 39\text{m } 35\text{s}$).
- **NASA Sensor Payload Registry**: Details on the actual in-situ environmental instruments: Curiosity REMS, Perseverance MEDA, and InSight TWINS.
- **Scientific Protocol Disclosure**: Clarifies why continuous live weather streams are technically impossible without real-time Deep Space Network (DSN) downlinks.

### 6. Data Sources & Auditability
- Full registry of primary sources: NASA PDS, MOLA, USGS Astrogeology, Mars Trek, and ASU JMARS.
- Complies with NASA challenge requirements by citing every data origin.

### 7. About Mars Pathfinder
- Detailed breakdown of the challenge problem statement, system architecture, scientific limitations, and long-term utility for future human exploration missions (late 2030s Artemis/Mars horizon).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 8
- **Routing**: React Router DOM 7
- **Planetary Mapping**: Leaflet 1.9 + React Leaflet 5 (Equirectangular Mars MOLA tiles)
- **Icons**: Lucide React
- **Design System**: NASA Mission Control dark aesthetic with Mars-red accents (`#c0392b`, `#e74c3c`), responsive layout, and custom CSS variables.

---

## 💻 Getting Started

### Prerequisites
- Node.js (version 18+ recommended)
- npm

### Installation & Launch

1. Navigate to the project root:
   ```bash
   cd MARS-PATHFINDER
   ```

2. Dependencies are already installed. To re-install if needed:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

5. To run a production build test:
   ```bash
   npm run build
   ```

---

## 🧪 How to Test Each Feature

1. **Sidebar Navigation**:
   - Click through all seven sidebar tabs: *Mars Explorer*, *Terrain Explorer*, *Scientific Locations*, *Route Planner*, *Surface Conditions*, *Data Sources*, and *About*.
   - On mobile screens or resized windows, test the mobile menu drawer toggle and overlay click.

2. **Mars Explorer Map**:
   - Hover over the map to view the real-time coordinate tracker in the bottom-left corner.
   - Click any marker on the map to see its name, mission status, coordinates, and NASA dossier link.
   - Click any location card below the map to trigger the smooth fly-to camera animation.
   - Use the search bar to type `Gale`, `Jezero`, `Rover`, or `Volcano` to test instant multi-field filtering.
   - Test the layer switch button in the top right of the map toolbar.

3. **Terrain Explorer**:
   - Review the layer cards and observe how global vs local swath layers are distinguished.
   - Click different USGS terrain cards (Volcanic, Impact Craters, Canyons, Dunes) to inspect their hazard profile, characteristics, and examples.

4. **Route Planner**:
   - Select a start waypoint (e.g., *Curiosity Rover*) and a destination waypoint (e.g., *Perseverance Rover*).
   - Observe the great-circle arc distance ($km$) and estimated mission Sols update automatically.
   - Click **Swap Points** to invert trajectory direction.
   - Notice the geodesic dashed trajectory line visualized on the Mars map.
   - Review the safety disclaimer and environmental hazard checklist.

5. **Surface Conditions**:
   - Review the scientific atmospheric mixing ratio visualizer.
   - Compare Mars vs Earth values in the planetary parameters table.
   - Read the payload descriptions for REMS, MEDA, and TWINS.

6. **Data Sources**:
   - Click any **Access Repository** link to verify external NASA / USGS resources.

---

## 🔑 External APIs & Data Downloads Required

**Zero mandatory API keys or external downloads are required** to run the complete application.

- All planetary coordinates, terrain classifications, environmental metrics, and mission datasets are bundled locally within `src/data/`.
- The interactive map connects to public, keyless equirectangular MOLA planetary basemap tiles hosted by OpenPlanetary / USGS.
- If running offline or in restricted network environments, the application includes a styled Martian radar grid fallback with complete coordinate calculation and vector marker support.
