import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import MarsExplorer from './pages/MarsExplorer';
import MarsDataExplorer from './pages/MarsDataExplorer';
import ScientificLocations from './pages/ScientificLocations';
import TerrainExplorer from './pages/TerrainExplorer';
import RoutePlanner from './pages/RoutePlanner';
import SurvivalAnalysis from './pages/SurvivalAnalysis';
import SurfaceConditions from './pages/SurfaceConditions';
import DataSourcesPage from './pages/DataSourcesPage';
import About from './pages/About';
import MissionIntelligencePage from './pages/MissionIntelligencePage';
import ErrorBoundary from './components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<MarsExplorer />} />
            <Route path="data-explorer" element={<MarsDataExplorer />} />
            <Route path="data" element={<Navigate to="/data-explorer" replace />} />
            <Route path="missions" element={<MissionIntelligencePage />} />
            <Route path="mission-intelligence" element={<Navigate to="/missions" replace />} />
            <Route path="locations" element={<ScientificLocations />} />
            <Route path="terrain" element={<TerrainExplorer />} />
            <Route path="jezero" element={<Navigate to="/terrain?tab=jezero" replace />} />
            <Route path="jezero-3d" element={<Navigate to="/terrain?tab=jezero" replace />} />
            <Route path="hazards" element={<Navigate to="/terrain" replace />} />
            <Route path="route-planner" element={<RoutePlanner />} />
            <Route path="conditions" element={<SurfaceConditions />} />
            <Route path="survival" element={<SurvivalAnalysis />} />
            <Route path="simulator" element={<Navigate to="/survival" replace />} />
            <Route path="data-sources" element={<DataSourcesPage />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
