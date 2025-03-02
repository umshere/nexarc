import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import PixelatedRunnerGame from '../components/games/PixelatedRunnerGame';

const ArcadeDashboard: React.FC = () => {
  const upcomingGames = [
    {
      id: 'stormy-samurai',
      title: 'Stormy Samurai Showdown',
      description: 'A thrilling action game where you play as a samurai battling through stormy landscapes.',
      status: 'Coming Soon'
    },
    {
      id: 'cyber-quest',
      title: 'Cyber Quest 2077',
      description: 'Explore a neon-lit cyberpunk world full of adventure and mysteries.',
      status: 'In Development'
    }
  ];

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="text-4xl font-bold text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        NexArc Arcade
      </motion.h1>
      
      <motion.div 
        className="mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Featured Game</h2>
        <PixelatedRunnerGame />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-4">Upcoming Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                  <p className="mb-4 text-slate-600">{game.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">{game.status}</span>
                    <Button variant="outline">Preview</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArcadeDashboard;
