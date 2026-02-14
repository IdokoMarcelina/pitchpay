import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Explorer from './pages/Explorer';
import Dashboard from './pages/Dashboard';
import CreatePitch from './pages/CreatePitch';
import PitchDetail from './pages/PitchDetail';
import Analytics from './pages/Analytics';
import Boost from './pages/Boost';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { useAnalytics } from './hooks/useAnalytics';


function AppContent() {
  useAnalytics();
  return (
    <div className="min-h-screen bg-brand-primary">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explorer" element={<Explorer />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/boost" element={<Boost />} />
          <Route path="/create" element={<CreatePitch />} />
        </Route>

        <Route path="/pitch/:id" element={<PitchDetail />} />
        <Route path="/profile/:address" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
