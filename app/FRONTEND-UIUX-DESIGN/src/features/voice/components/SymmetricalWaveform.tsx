/**
 * SymmetricalWaveform — pure presentational component.
 * Renders an animated waveform using Framer Motion bars.
 * Receives isActive prop to switch between idle and listening animations.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { SYMMETRICAL_WAVE_BARS } from '../constants/voiceConstants';

interface SymmetricalWaveformProps {
  isActive: boolean;
}

export const SymmetricalWaveform: React.FC<SymmetricalWaveformProps> = ({ isActive }) => (
  <div className="flex items-center justify-center gap-1 h-8">
    {SYMMETRICAL_WAVE_BARS.map((bar, idx) => (
      <motion.span
        key={idx}
        className="w-1 rounded-full bg-teal-200/60"
        animate={
          isActive
            ? {
                height: [bar.minH, bar.maxH, bar.minH],
                opacity: [0.6, 1, 0.6],
                backgroundColor: [
                  'rgba(94, 234, 212, 0.6)',
                  'rgba(255, 255, 255, 0.95)',
                  'rgba(94, 234, 212, 0.6)',
                ],
              }
            : {
                height: [bar.minH, bar.minH + 3, bar.minH],
                opacity: [0.35, 0.55, 0.35],
                backgroundColor: 'rgba(94, 234, 212, 0.45)',
              }
        }
        transition={{
          duration: isActive ? 0.75 : 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: bar.delay,
        }}
      />
    ))}
  </div>
);

export default SymmetricalWaveform;
