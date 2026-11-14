import MarsMissionIntelligence from '../components/MissionIntelligence/MarsMissionIntelligence';
import { useSearchParams } from 'react-router-dom';
import './MissionIntelligencePage.css';

function MissionIntelligencePage() {
  const [searchParams] = useSearchParams();
  const initialMission = searchParams.get('mission') || 'perseverance';
  const initialMode = searchParams.get('mode') || 'explorer';

  return (
    <div className="mission-page fade-in">
      <MarsMissionIntelligence defaultMissionId={initialMission} initialMode={initialMode} />
    </div>
  );
}

export default MissionIntelligencePage;
