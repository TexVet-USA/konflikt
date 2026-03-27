import React from 'react';
import { GameProvider, useGame } from '@/lib/GameContext';
import HeroSection from './game/HeroSection';
import GameView from './game/GameView';

const GameRouter: React.FC = () => {
  const { state } = useGame();

  if (state.phase === 'pre-game') {
    return <HeroSection />;
  }

  return <GameView />;
};

const AppLayout: React.FC = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <GameRouter />
      </div>
    </GameProvider>
  );
};

export default AppLayout;
