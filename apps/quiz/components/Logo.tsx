import React, { useState } from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className} select-none`}>
    
        <img 
            src='/assets/logo.png'
            alt="Timebending Logo" 
            className="max-w-[280px] md:max-w-[320px] h-auto object-contain drop-shadow-xl"
        />
      
    </div>
  );
};