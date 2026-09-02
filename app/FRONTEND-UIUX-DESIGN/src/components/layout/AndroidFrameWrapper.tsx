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
    /*
     * On actual mobile (< sm breakpoint) we render a transparent, full-
     * viewport shell — no fake status bar, no device frame.
     *
     * On desktop / tablet (≥ sm) we render the familiar phone-frame mockup
     * centered on a dark background so developers can preview the app.
     */
    <div
      className={[
        /* Mobile: clean full-screen shell */
        'w-full h-dvh min-h-dvh flex flex-col bg-slate-50',
        /* Desktop: dark stage + centred phone frame */
        'sm:min-h-screen sm:bg-slate-900 sm:items-center sm:justify-center sm:py-6 sm:px-4',
        'font-sans antialiased',
      ].join(' ')}
    >
      {/* ── Phone device frame (desktop preview only) ── */}
      <div
        className={[
          /* Mobile: fill entire viewport without restricting touch flow */
          'w-full flex-1 flex flex-col min-h-0 relative',
          /* Desktop: constrained phone shape with contained overflow */
          'sm:w-[390px] sm:max-w-[420px] sm:h-[844px] sm:max-h-[95vh]',
          'sm:rounded-[44px] sm:shadow-2xl sm:shadow-black/80',
          'sm:border-[10px] sm:border-slate-800 sm:ring-1 sm:ring-white/10 sm:overflow-hidden',
          'bg-white',
        ].join(' ')}
      >
        {/* Camera punch-hole — desktop only */}
        <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 z-50 w-24 h-4 bg-slate-800 rounded-full items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700/50" />
        </div>

        {/* Simulated Android status bar — desktop preview only */}
        <div className="hidden sm:flex w-full h-7 bg-white text-slate-800 px-5 items-center justify-between text-[11px] font-bold z-40 select-none shrink-0 border-b border-slate-100/50 pt-1">
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

        {/* Content area */}
        <div className="flex-1 w-full relative flex flex-col min-h-0 bg-slate-50">
          {children}
        </div>

        {/* Gesture navigation pill — desktop only */}
        <div className="hidden sm:flex w-full h-4 bg-white items-center justify-center shrink-0 z-40 pb-1">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default AndroidFrameWrapper;
