import React from 'react';

export const TouchControlsOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-1/2 flex items-center justify-center">
        <div className="text-white/30 text-xl">Tap to Jump</div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-center justify-center">
        <div className="text-white/30 text-xl">Hold to Slide</div>
      </div>
    </div>
  );
};

export default TouchControlsOverlay;
