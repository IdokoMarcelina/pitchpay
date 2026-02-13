import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Explorer from './pages/Explorer';
import Dashboard from './pages/Dashboard';
import CreatePitch from './pages/CreatePitch';
import PitchDetail from './pages/PitchDetail';
import { useAnalytics } from './hooks/useAnalytics';

function App() {
  useAnalytics();
  
  return (
    <Router>
      <div className="min-h-screen bg-brand-primary">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreatePitch />} />
          <Route path="/pitch/:id" element={<PitchDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
