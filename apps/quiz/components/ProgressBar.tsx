import React from 'react';

interface Props {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<Props> = ({ current, total }) => {
  const percentage = Math.min(100, Math.max(0, ((current) / total) * 100));

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between text-xs text-brand-light mb-2 font-sans tracking-widest uppercase">
        <span>Start</span>
        <span>Jouw Type</span>
      </div>
      <div className="h-2 w-full bg-brand-dark border border-brand-primary/30 rounded-full overflow-hidden relative">
        <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-500 ease-out shadow-[0_0_10px_rgba(74,222,128,0.5)]"
            style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};