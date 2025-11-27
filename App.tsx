import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mole } from './components/Mole';
import { ScoreBoard } from './components/ScoreBoard';
import { audioService } from './services/audioService';
import { GameState, Hole, MoleType } from './types';
import { GAME_CONFIG, MOLE_TYPES_ARRAY, MIN_HOLES, MAX_HOLES } from './constants';
import { Play, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.initialTime);
  const [holes, setHoles] = useState<Hole[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  // Custom Cursor Ref
  const cursorRef = useRef<HTMLDivElement>(null);
  
  // Refs for loop management to avoid stale closures in intervals
  const timerRef = useRef<number | null>(null);
  const moleTimerRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>(GameState.IDLE);

  // Initialize holes
  const initHoles = useCallback(() => {
    // Determine random hole count between 6 and 8
    const holeCount = Math.floor(Math.random() * (MAX_HOLES - MIN_HOLES + 1)) + MIN_HOLES;
    
    const newHoles: Hole[] = Array.from({ length: holeCount }, (_, i) => ({
      id: i,
      status: 'empty',
      moleType: MOLE_TYPES_ARRAY[0],
      // Randomize position slightly for "scattered" look, but keep it tight for iPad safety
      x: Math.random() * 20 - 10, 
      y: Math.random() * 20 - 10, 
      shape: '50%',
      rotation: Math.random() * 4 - 2, 
    }));
    setHoles(newHoles);
  }, []);

  useEffect(() => {
    initHoles();
    gameStateRef.current = GameState.IDLE;
    
    // Cursor Logic
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    
    const smashCursor = () => {
      if (cursorRef.current) {
        const hammer = cursorRef.current.querySelector('.hammer-img');
        if (hammer) {
          hammer.classList.remove('cursor-smash');
          // Force reflow
          void (hammer as HTMLElement).offsetWidth;
          hammer.classList.add('cursor-smash');
        }
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', smashCursor);

    return () => {
      stopGame();
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', smashCursor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initHoles]);

  const stopGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    
    // Clear any individual mole timeouts
    setHoles(prev => {
       prev.forEach(h => { if (h.timeoutId) clearTimeout(h.timeoutId); });
       return prev;
    });

    audioService.stopMusic();
  };

  const startGame = () => {
    stopGame();
    setScore(0);
    setTimeLeft(GAME_CONFIG.initialTime);
    setGameState(GameState.PLAYING);
    gameStateRef.current = GameState.PLAYING;
    audioService.startMusic();
    
    // Reset holes (keep positions, reset status)
    setHoles(prev => prev.map(h => ({ ...h, status: 'empty' })));

    // Start Game Timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    scheduleNextMole();
  };

  const endGame = () => {
    stopGame();
    setGameState(GameState.FINISHED);
    gameStateRef.current = GameState.FINISHED;
    audioService.playGameOverSound();
  };

  const scheduleNextMole = () => {
    if (gameStateRef.current !== GameState.PLAYING) return;

    const randomInterval = Math.random() * (GAME_CONFIG.maxInterval - GAME_CONFIG.minInterval) + GAME_CONFIG.minInterval;
    
    moleTimerRef.current = window.setTimeout(() => {
      showRandomMole();
      scheduleNextMole();
    }, randomInterval);
  };

  const showRandomMole = () => {
    if (gameStateRef.current !== GameState.PLAYING) return;

    setHoles(currentHoles => {
      // Find empty holes
      const emptyHoleIndices = currentHoles
        .map((h, i) => h.status === 'empty' ? i : -1)
        .filter(i => i !== -1);

      if (emptyHoleIndices.length === 0) return currentHoles;

      const randomIndex = emptyHoleIndices[Math.floor(Math.random() * emptyHoleIndices.length)];
      const randomMole = MOLE_TYPES_ARRAY[Math.floor(Math.random() * MOLE_TYPES_ARRAY.length)];

      const newHoles = [...currentHoles];
      
      // Auto-hide logic
      const timeoutId = window.setTimeout(() => {
        setHoles(h => h.map(hole => 
          hole.id === randomIndex && hole.status === 'active' 
            ? { ...hole, status: 'empty' } 
            : hole
        ));
      }, GAME_CONFIG.moleStayDuration);

      newHoles[randomIndex] = {
        ...newHoles[randomIndex],
        status: 'active',
        moleType: randomMole,
        timeoutId
      };

      audioService.playPopSound();
      return newHoles;
    });
  };

  const handleWhack = (id: number) => {
    if (gameStateRef.current !== GameState.PLAYING) return;

    setHoles(currentHoles => {
      const hole = currentHoles.find(h => h.id === id);
      if (!hole || hole.status !== 'active') return currentHoles;

      audioService.playHitSound();
      setScore(s => s + 10);
      
      // Clear auto-hide timeout if exists
      if (hole.timeoutId) clearTimeout(hole.timeoutId);

      return currentHoles.map(h => 
        h.id === id ? { ...h, status: 'hit' } : h
      );
    });

    // Reset to empty after animation
    setTimeout(() => {
        setHoles(prev => prev.map(h => h.id === id ? { ...h, status: 'empty' } : h));
    }, 500);
  };

  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const getGridClasses = () => {
    let classes = "grid gap-x-4 gap-y-6 md:gap-x-12 md:gap-y-10 lg:gap-x-16 lg:gap-y-12 mx-auto ";
    if (holes.length >= 7) {
        // High count: 2 cols mobile, 3 cols tablet portrait, 4 cols landscape/desktop
        classes += "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    } else {
        // Low count: 2 cols mobile, 3 cols tablet/desktop
        classes += "grid-cols-2 md:grid-cols-3";
    }
    return classes;
  };

  return (
    <div className="min-h-screen h-full bg-green-500 relative overflow-hidden flex flex-col items-center cursor-none touch-none select-none">
      
      {/* Custom Hammer Cursor */}
      <div 
        ref={cursorRef} 
        className="fixed pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: '-100px', top: '-100px' }} // Hide initially
      >
        <div className="hammer-img origin-bottom-right" style={{ transform: 'rotate(-30deg)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                {/* Handle */}
                <path d="M45,55 L35,95 L55,95 L65,55 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="3" />
                {/* Head */}
                <rect x="20" y="20" width="70" height="40" rx="8" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
                {/* Shine */}
                <path d="M30 30 L80 30" stroke="#FECACA" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                {/* Side Face */}
                <ellipse cx="20" cy="40" rx="5" ry="12" fill="#B91C1C" />
                <ellipse cx="90" cy="40" rx="5" ry="12" fill="#F87171" />
            </svg>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#ffffff 3px, transparent 3px)', 
             backgroundSize: '40px 40px' 
           }} 
      />
      
      {/* Sun Decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full blur-xl opacity-60" />

      <div className="relative z-10 w-full max-w-5xl px-4 py-2 md:py-4 flex flex-col items-center h-full max-h-screen">
        
        {/* Header / Title - Scaled for iPad */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-black mb-2 md:mb-4 drop-shadow-lg tracking-wider game-font text-center transform -rotate-2 border-text">
          WHACK-A-MOLE
        </h1>

        <ScoreBoard 
          score={score} 
          timeLeft={timeLeft} 
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />

        {/* Game Grid Container */}
        <div className="flex-1 w-full flex items-center justify-center my-2 md:my-0">
            <div className={getGridClasses()}>
            {holes.map((hole) => (
                <Mole
                key={hole.id}
                status={hole.status}
                moleType={hole.moleType}
                x={hole.x}
                y={hole.y}
                shape={hole.shape}
                rotation={hole.rotation}
                onClick={() => handleWhack(hole.id)}
                />
            ))}
            </div>
        </div>

      </div>
      
      {/* Start Game Modal */}
      {gameState === GameState.IDLE && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 cursor-default">
             <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl text-center border-b-8 border-green-600 transform hover:scale-105 transition-transform duration-300 max-w-md w-full relative overflow-hidden">
               <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full opacity-50 pointer-events-none"></div>
               
               <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 game-font text-green-600">Ready?</h2>
               <p className="text-gray-600 mb-6 md:mb-8 text-lg font-medium">Smash the moles! But be quick, they are tricky little critters.</p>
               
               <button 
                 onClick={startGame}
                 className="w-full bg-green-500 hover:bg-green-600 text-white text-xl md:text-2xl font-black py-4 md:py-5 px-8 rounded-2xl shadow-lg flex items-center justify-center space-x-3 transition-all active:translate-y-1 active:shadow-none group"
               >
                 <Play fill="currentColor" className="w-8 h-8 group-hover:scale-110 transition-transform"/>
                 <span>START!</span>
               </button>
             </div>
           </div>
        )}

      {/* Game Over Modal */}
      {gameState === GameState.FINISHED && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 cursor-default">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl text-center border-b-8 border-purple-600 animate-bounce-in max-w-md w-full relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-100 rounded-full opacity-50 pointer-events-none"></div>

              <h2 className="text-4xl md:text-5xl font-black text-purple-600 mb-2 game-font">TIME'S UP!</h2>
              <div className="text-6xl md:text-7xl mb-4 animate-pulse">🏆</div>
              <p className="text-gray-500 mb-1 uppercase tracking-widest text-sm font-bold">Final Score</p>
              <p className="text-5xl md:text-6xl font-black text-gray-800 mb-6 md:mb-8">{score}</p>
              <button 
                onClick={startGame}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xl font-bold py-4 md:py-5 px-8 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all active:translate-y-1 active:shadow-none group"
              >
                <RotateCcw className="group-hover:-rotate-180 transition-transform duration-500"/>
                <span>PLAY AGAIN</span>
              </button>
            </div>
          </div>
        )}

      {/* Footer Decoration */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-green-800/40 to-transparent pointer-events-none" />
    </div>
  );
};

export default App;