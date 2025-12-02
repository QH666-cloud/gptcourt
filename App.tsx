import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import RoomPage from './components/RoomPage';
import { UserSession } from './types';

// Wrapper to handle params logic
const RoomRouteWrapper = ({ 
  session, 
  setSession, 
  onLeave 
}: { 
  session: UserSession | null, 
  setSession: (s: UserSession) => void,
  onLeave: () => void
}) => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // If we have a roomId in URL but no session, redirect to login but preserve room intent
    if (roomId && !session) {
        // In a real app, we might show a specific "Join Room X" screen.
        // For simplicity here, we assume user starts at landing.
        navigate('/');
    }
  }, [roomId, session, navigate]);

  if (!session) return null; // Or a loading spinner

  return <RoomPage session={session} onLeave={onLeave} />;
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPageWrapper 
              onJoin={(newSession) => setSession(newSession)} 
            />
          } 
        />
        <Route 
          path="/room/:roomId" 
          element={
            <RoomRouteWrapper 
              session={session} 
              setSession={setSession} 
              onLeave={() => setSession(null)}
            />
          } 
        />
      </Routes>
    </HashRouter>
  );
};

// Helper to handle navigation after join
const LandingPageWrapper = ({ onJoin }: { onJoin: (s: UserSession) => void }) => {
  const navigate = useNavigate();

  const handleJoin = (s: UserSession) => {
    onJoin(s);
    navigate(`/room/${s.roomId}`);
  };

  return <LandingPage onJoin={handleJoin} />;
};

export default App;
