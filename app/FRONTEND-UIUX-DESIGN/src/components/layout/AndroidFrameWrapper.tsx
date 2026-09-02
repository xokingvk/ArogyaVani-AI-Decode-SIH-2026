import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

interface AndroidFrameWrapperProps {
  children: React.ReactNode;
}

export const AndroidFrameWrapper: React.FC<AndroidFrameWrapperProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      hours = hours % 12 || 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setCurrentTime(`${hours}:${minutesStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-slate-900 flex items-center justify-center sm:py-4 sm:px-4 font-sans select-none antialiased">
      {/* Outer Mobile Device Frame Container */}
      <div className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[860px] sm:max-h-[95vh] bg-white sm:rounded-[44px] shadow-2xl shadow-black/80 flex flex-col overflow-hidden relative border-0 sm:border-[10px] sm:border-slate-800 ring-1 ring-white/10">
        
        {/* Android Top Camera Punch Hole (Desktop Viewport Only) */}
        <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 z-50 w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700/50" />
        </div>

        {/* Android Native Status Bar */}
        <div className="w-full h-7 bg-white text-slate-800 px-5 flex items-center justify-between text-[11px] font-bold z-40 select-none shrink-0 border-b border-slate-100/50 pt-1">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span>{currentTime}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-[10px] font-extrabold text-[#0D9488] tracking-wider">5G</span>
            <Signal className="w-3 h-3 text-slate-700" strokeWidth={2.5} />
            <Wifi className="w-3 h-3 text-slate-700" strokeWidth={2.5} />
            <Battery className="w-3.5 h-3.5 text-slate-700" strokeWidth={2.2} />
          </div>
        </div>

        {/* Mobile Viewport Content Area */}
        <div className="flex-1 w-full relative flex flex-col overflow-hidden bg-slate-50">
          {children}
        </div>

        {/* Android Bottom Gesture Navigation Pill Bar */}
        <div className="w-full h-4 bg-white flex items-center justify-center shrink-0 z-40 pb-1">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default AndroidFrameWrapper;
