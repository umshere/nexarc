import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "./ui/button";
import PixelatedRunnerGame from "./games/PixelatedRunnerGame";
import { useState } from 'react';

interface ArcadeDashboardProps {
  onTextHover: (text: string) => void;
}

export default function ArcadeDashboard({ onTextHover }: ArcadeDashboardProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const handleCardClick = (gameId: string) => {
    setActiveGame(gameId);
  };

  const closeGame = () => {
    setActiveGame(null);
  };

  // Default images
  const featuredImage = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920";
  const upcomingImages = [
    "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1610041321420-a596dd14ebc9?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1616031037011-867861c15479?auto=format&fit=crop&w=800"
  ];
  const classicsImages = [
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800"
  ];

  return (
    <div className="min-h-screen w-full text-white p-8 bg-transparent">
      <motion.h1 
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        NexArc - Futuristic Arcade Dashboard
      </motion.h1>
      
      {/* Featured game section */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Featured</h2>
        <motion.div
          className="group relative w-full h-[400px] rounded-xl overflow-hidden cursor-pointer shadow-2xl"
          style={{ 
            backgroundImage: `url(${featuredImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.5, ease: "easeOut" }
          }}
          onClick={() => handleCardClick('samurai-run')}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
            initial={{ opacity: 0.5 }}
            whileHover={{ opacity: 0.8 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute bottom-8 left-8 transform group-hover:translate-y-[-10px] transition-all duration-300">
            <h3 
              className="text-4xl font-bold mb-4"
              onMouseEnter={() => onTextHover('Multi-Level Samurai')}
              onMouseLeave={() => onTextHover('')}
            >
              Multi-Level Samurai
            </h3>
            <p className="text-xl text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Embark on an epic journey through mystical realms
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Upcoming games section */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onMouseEnter={() => setHoveredSection('upcoming')}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <h2 className="text-2xl font-semibold mb-4">Upcoming Games</h2>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {['Cyber Kart', 'Sky Siege', 'Neo Puzzler', 'Galactic Harvest'].map((title, idx) => (
            <motion.div
              key={idx}
              className="group w-72 h-48 flex-shrink-0 rounded-lg relative cursor-pointer transform-gpu"
              style={{ 
                backgroundImage: `url(${upcomingImages[idx]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              whileHover={{ 
                scale: 1.2,
                zIndex: 20,
                y: -20,
                transition: { 
                  scale: { duration: 0.4, ease: "easeOut" },
                  y: { duration: 0.4, ease: "easeOut" }
                }
              }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              />
              <div 
                className="absolute bottom-4 left-4 transform group-hover:translate-y-[-5px] transition-all duration-300"
                onMouseEnter={() => onTextHover(title)}
                onMouseLeave={() => onTextHover('')}
              >
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Coming Soon
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Classics section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        onMouseEnter={() => setHoveredSection('classics')}
        onMouseLeave={() => setHoveredSection(null)}
      >
        <h2 className="text-2xl font-semibold mb-4">Arcade Classics</h2>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {['Retro Racer', 'Brick Bash', 'Alien Invasion'].map((title, idx) => (
            <motion.div
              key={idx}
              className="group w-72 h-48 flex-shrink-0 rounded-lg relative cursor-pointer transform-gpu"
              style={{ 
                backgroundImage: `url(${classicsImages[idx]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              whileHover={{ 
                scale: 1.2,
                zIndex: 20,
                y: -20,
                transition: { 
                  scale: { duration: 0.4, ease: "easeOut" },
                  y: { duration: 0.4, ease: "easeOut" }
                }
              }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              />
              <div 
                className="absolute bottom-4 left-4 transform group-hover:translate-y-[-5px] transition-all duration-300"
                onMouseEnter={() => onTextHover(title)}
                onMouseLeave={() => onTextHover('')}
              >
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Play Now
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Game modal with AnimatePresence */}
      <AnimatePresence>
        {activeGame === 'samurai-run' && (
          <motion.div
            key="samurai-run-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full h-full md:w-[95%] md:h-[95%] bg-gray-900/95 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              initial={{ 
                scale: 0.5,
                opacity: 0
              }}
              animate={{ 
                scale: 1,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }
              }}
              exit={{ 
                scale: 0.5,
                opacity: 0,
                transition: {
                  duration: 0.3
                }
              }}
            >
              <Button 
                onClick={closeGame}
                variant="default"
                className="absolute top-4 right-4 z-10 bg-red-500/80 hover:bg-red-600/90 text-white font-semibold px-6 py-2 rounded-lg shadow-lg backdrop-blur-sm border-2 border-white/20 transition-all duration-200 hover:scale-105"
              >
                Close
              </Button>
              <div className="relative h-full w-full">
                <div className="absolute top-0 left-0 w-full p-8 z-10">
                  <motion.h1 
                    className="text-5xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Multi-Level Samurai
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-gray-200"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Embark on an epic journey through mystical realms
                  </motion.p>
                </div>
                <div className="h-full w-full flex items-center justify-center pt-24">
                  <div className="w-[90%] h-[90%] flex items-center justify-center bg-black/30 rounded-xl backdrop-blur-sm border border-white/10">
                    <PixelatedRunnerGame />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
