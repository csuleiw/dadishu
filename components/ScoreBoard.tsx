import React from 'react';
import { Clock, Trophy, Volume2, VolumeX } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  timeLeft: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, timeLeft, isMuted, onToggleMute }) => {
  return (
    <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-green-600 p-2 md:p-4 flex justify-between items-center mb-4 md:mb-6 transform -skew-x-2">
      
      {/* Score */}
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className="bg-yellow-400 p-1 md:p-2 rounded-lg border-2 border-yellow-600">
            <Trophy className="text-yellow-900 w-5 h-5 md:w-8 md:h-8" />
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Score</span>
            <span className="text-xl md:text-4xl font-black text-gray-800 game-font">{score}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className={`${timeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-blue-400'} p-1 md:p-2 rounded-lg border-2 ${timeLeft < 10 ? 'border-red-700' : 'border-blue-600'} transition-colors duration-300`}>
            <Clock className="text-white w-5 h-5 md:w-8 md:h-8" />
        </div>
         <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Time</span>
            <span className={`text-xl md:text-4xl font-black game-font ${timeLeft < 10 ? 'text-red-500' : 'text-gray-800'}`}>
                {timeLeft}s
            </span>
        </div>
      </div>

      {/* Controls */}
      <button 
        onClick={onToggleMute}
        className="p-2 md:p-3 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors active:scale-95"
      >
        {isMuted ? <VolumeX className="text-slate-600 w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="text-green-600 w-5 h-5 md:w-6 md:h-6" />}
      </button>
    </div>
  );
};