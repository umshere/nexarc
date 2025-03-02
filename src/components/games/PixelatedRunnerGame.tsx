import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useGame } from './game-engine/useGame';
import { useDeviceType } from './game-engine/useDeviceType';
import { useCanvasSize } from './game-engine/useCanvasSize';
import { TouchControlsOverlay } from './game-engine/TouchControlsOverlay';
import { previewSceneRenderer } from './game-engine/previewSceneRenderer';

const gameDescription = [
  {
    title: "Welcome to Pixelated Runner",
    text: "An epic journey through a neon-lit cyberpunk world"
  },
  {
    title: "Your Mission",
    text: "Navigate through treacherous terrain, dodge obstacles, and collect power-ups as you race through an endless cyberpunk cityscape"
  },
  {
    title: "Controls",
    text: "SPACE or tap upper screen to jump, DOWN ARROW or tap lower screen to slide"
  }
];

const PixelatedRunnerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [currentDescIndex, setCurrentDescIndex] = useState(0);
  const { isTouchDevice } = useDeviceType();
  const { width, height, updateSize } = useCanvasSize(canvasRef, isExpanded);
  const { gameState, drawGame } = useGame(width, height);

  const containerStyles = isExpanded ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 50,
  } : {
    position: 'relative' as const,
    width: '100%',
    height: 'auto',
    zIndex: 1,
  };

  const containerVariants = {
    expanded: {
      scale: 1,
    },
    collapsed: {
      scale: 1,
    }
  };

  React.useEffect(() => {
    if (showDescription && !isExpanded) {
      const interval = setInterval(() => {
        setCurrentDescIndex((prev) => (prev + 1) % gameDescription.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showDescription, isExpanded]);

  React.useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      if (lastTime === 0) lastTime = currentTime;
      const delta = currentTime - lastTime;

      if (!isExpanded) {
        previewSceneRenderer.render(ctx, width, height, delta);
      } else {
        drawGame(ctx);
      }

      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isExpanded, drawGame, width, height]);

  React.useEffect(() => {
    updateSize();
  }, [isExpanded, updateSize]);

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <div className={`game-overlay ${isExpanded ? 'game-overlay-active' : ''}`} />
        )}
      </AnimatePresence>

      {isExpanded && isTouchDevice && <TouchControlsOverlay />}
      
      <motion.div
        layout
        initial={false}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={containerVariants}
        style={containerStyles}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 100,
          mass: 1,
        }}
        onHoverStart={() => !isExpanded && setShowDescription(true)}
        onHoverEnd={() => setShowDescription(false)}
      >
        <Card className={`p-6 ${isExpanded ? 'h-full' : ''} relative overflow-hidden`}>
          <AnimatePresence mode="wait">
            {showDescription && !isExpanded && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-black/90 to-black/70 z-10 p-6 flex flex-col justify-center items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  key={currentDescIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-md"
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {gameDescription[currentDescIndex].title}
                  </h3>
                  <p className="text-gray-200">
                    {gameDescription[currentDescIndex].text}
                  </p>
                </motion.div>
                <div className="flex gap-2 mt-4">
                  {gameDescription.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentDescIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                      animate={{
                        scale: index === currentDescIndex ? 1.2 : 1,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            layout="position"
            className="mb-4 relative z-0"
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 150
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <motion.h2 
                layout="position"
                className="text-2xl font-bold"
              >
                Pixelated Runner
              </motion.h2>
              <motion.div 
                layout="position"
                className="text-lg font-semibold"
              >
                Score: {gameState.score}
              </motion.div>
            </div>
            <motion.div
              className="w-full relative"
              layoutId="game-canvas-container"
              initial={{ scale: 1 }}
              animate={{ 
                scale: isExpanded ? 1 : 0.98,
                opacity: 1 
              }}
              transition={{
                scale: {
                  type: "spring",
                  damping: 15,
                  stiffness: 200
                }
              }}
            >
              <canvas
                ref={canvasRef}
                className={`w-full border-2 border-slate-200 rounded-lg ${
                  isExpanded ? 'game-canvas-expanded' : 'game-canvas'
                }`}
              />
            </motion.div>
          </motion.div>

          <motion.div 
            layout="position"
            className="flex justify-center gap-4 relative z-0"
          >
            {!isExpanded ? (
              <Button 
                onClick={() => setIsExpanded(true)}
                className="relative"
              >
                Start Game
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </Button>
            ) : (
              <Button 
                onClick={() => setIsExpanded(false)} 
                variant="outline"
              >
                Exit
              </Button>
            )}
          </motion.div>
        </Card>
      </motion.div>
    </>
  );
};

export default PixelatedRunnerGame;
