import React from 'react';
import { MoleType } from '../types';

interface MoleProps {
  status: 'empty' | 'active' | 'hit';
  moleType: MoleType;
  onClick: () => void;
  x: number;
  y: number;
  shape: string;
  rotation: number;
}

export const Mole: React.FC<MoleProps> = ({ status, moleType, onClick, x, y, rotation }) => {
  return (
    <div 
      className="relative w-28 h-24 md:w-32 md:h-28 lg:w-40 lg:h-32 flex justify-center items-end"
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
      }}
    >
      {/* --- CUTE HOLE VISUALS --- */}
      
      {/* 1. Base Shadow (Ground Contact) */}
      <div className="absolute bottom-1 w-[90%] h-12 bg-black/20 rounded-full blur-md z-0" />

      {/* 2. The Dirt Mound (Back) */}
      <div className="absolute bottom-2 w-full h-16 bg-[#8B5E3C] rounded-[40%] z-10" />

      {/* 3. The Hole Opening (Dark Interior) - Clean Oval */}
      <div className="absolute bottom-4 w-[80%] h-12 bg-[#3E2723] rounded-full z-10 shadow-inner overflow-hidden border-b-4 border-[#2D1B19]">
           {/* Inner shadow gradient */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* 4. Decorative Flowers (Static on the mound) */}
      <div className="absolute -left-2 bottom-6 z-30 transform -rotate-12 pointer-events-none">
          <span className="text-xl">🌸</span>
      </div>
      <div className="absolute -right-1 bottom-4 z-30 transform rotate-12 pointer-events-none scale-75">
          <span className="text-xl">🌼</span>
      </div>


      {/* --- THE MOLE --- */}
      <div className="absolute bottom-4 w-28 h-32 md:w-32 md:h-36 lg:w-40 lg:h-44 flex justify-center items-end overflow-hidden z-20 pointer-events-none">
         <div 
           className={`
             w-full h-full flex items-center justify-center text-6xl md:text-7xl lg:text-8xl cursor-pointer pointer-events-auto select-none
             transition-transform duration-200
             ${status === 'active' ? 'mole-appear' : ''}
             ${status === 'hit' ? 'mole-hit' : ''}
             ${status === 'empty' ? 'translate-y-[120%]' : ''}
           `}
           onMouseDown={onClick}
           role="button"
           aria-label="Mole"
         >
           {moleType}
         </div>
      </div>


      {/* 5. The Dirt Mound (Front Lip) to hide bottom of mole */}
      {/* This creates the illusion the mole is inside */}
      <div className="absolute bottom-2 w-full h-8 z-30 overflow-hidden pointer-events-none">
          {/* A curved shape to cover the bottom of the mole */}
          <div className="w-full h-16 bg-[#8B5E3C] rounded-[50%] -mt-8 border-t-4 border-[#A16E45]"></div>
      </div>

      {/* Hit Effect Visual */}
      {status === 'hit' && (
        <>
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-40 text-5xl font-black text-red-500 animate-bounce pointer-events-none drop-shadow-xl whitespace-nowrap game-font" style={{textShadow: '3px 3px 0px white'}}>
            POW!
          </div>
          {/* Starburst particles */}
          <div className="absolute top-0 left-1/2 z-40 w-3 h-3 bg-yellow-300 rounded-full particle shadow-lg" style={{'--tx': '-50px', '--ty': '-50px'} as React.CSSProperties} />
          <div className="absolute top-0 left-1/2 z-40 w-2 h-2 bg-white rounded-full particle shadow-lg" style={{'--tx': '50px', '--ty': '-60px'} as React.CSSProperties} />
          <div className="absolute top-0 left-1/2 z-40 w-3 h-3 bg-orange-400 rounded-full particle shadow-lg" style={{'--tx': '-40px', '--ty': '-80px'} as React.CSSProperties} />
          <div className="absolute top-0 left-1/2 z-40 w-2 h-2 bg-yellow-100 rounded-full particle shadow-lg" style={{'--tx': '40px', '--ty': '-30px'} as React.CSSProperties} />
          <div className="absolute top-0 left-1/2 z-40 w-4 h-4 text-yellow-400 particle" style={{'--tx': '0px', '--ty': '-90px'} as React.CSSProperties}>★</div>
        </>
      )}
    </div>
  );
};