import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Play, Pause, X } from 'lucide-react';

// Minimal interface for Entities and Projectiles
interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  collected?: boolean;
  hitPoints?: number;
}

interface Projectile {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

// Single definitions for leaves and raindrops
interface Leaf {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  rotation: number;
  color: string;
}

interface Raindrop {
  x: number;
  y: number;
  speed: number;
}

// Allowed game statuses
type GameStatus = 'start' | 'playing' | 'paused' | 'gameOver';

interface StormySamuraiProps {
  onClose?: () => void; // Callback to close/unmount the game
}

const StormySamuraiShowdown: React.FC<StormySamuraiProps> = ({ onClose }) => {
  // Canvas ref and game state variables
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('start');
  const [score, setScore] = useState(0);
  const [hasPowerShot, setHasPowerShot] = useState(false);

  // Samurai (player) settings
  // Ground at y=660, samurai is 75px tall -> y=585 is ground level
  const samuraiRef = useRef<Entity>({ x: 120, y: 585, width: 60, height: 75 });
  const samuraiVelocityRef = useRef(0);
  const gravity = 0.8;
  const jumpPower = -16;

  // Collections for game objects
  const obstaclesRef = useRef<Entity[]>([]);
  const orbsRef = useRef<Entity[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const leavesRef = useRef<Leaf[]>([]);
  const rainRef = useRef<Raindrop[]>([]);
  const lightningRef = useRef({ active: false, timer: 0 });

  // Animation & difficulty
  const frameCount = useRef(0);
  const requestIdRef = useRef<number | null>(null);
  // Increase comet speed slightly over time
  const getCometSpeed = () => 6 + Math.floor(frameCount.current / 600);

  // Random spawn timers with more frequent encounters
  const spawnTimersRef = useRef({
    comet: Math.floor(Math.random() * 45) + 45, // 45-90 frames
    orb: Math.floor(Math.random() * 450) + 250  // 250-700 frames
  });

  // 16×16 “pixel” Samurai silhouette (scaled by 3)
  const samuraiPixels = [
    ".......XX.......",
    "......XXXX......",
    "......XXXX......",
    ".......XX.......",
    "......XXXX......",
    ".....XXXXXX.....",
    "...XXXXXXXXXX...",
    "..XXXXXXXXXXXX..",
    "..XX..XXXX..XX..",
    "..XX..XXXX..XX..",
    ".....XXXXXX.....",
    "......XXXX......",
    ".......XX.......",
    ".......XX.......",
    "........X.......",
    "................",
  ];

  // -------------------------------
  // Spawn Functions
  // -------------------------------
  const spawnComet = () => {
    const size = 20 + Math.floor(Math.random() * 24);
    const yOffset = Math.random() * 20 - 10;
    obstaclesRef.current.push({
      x: 960 + 40,
      y: 400 - (size - 24) + yOffset,
      width: size,
      height: size
    });
  };

  const spawnPowerOrb = () => {
    orbsRef.current.push({
      x: 960 + 20,
      y: 405,
      width: 20,
      height: 20,
      collected: false
    });
  };

  // -------------------------------
  // Input Handling
  // -------------------------------
  const handleJump = useCallback(() => {
    // Allow jump if the samurai is within 2px of y=585
    if (Math.abs(samuraiRef.current.y - 585) < 2) {
      samuraiVelocityRef.current = jumpPower;
    }
  }, []);

  const handleShoot = useCallback(() => {
    if (hasPowerShot) {
      const box = samuraiRef.current;
      projectilesRef.current.push({
        x: box.x + box.width,
        y: box.y + box.height / 2 - 8,
        width: 16,
        height: 16,
        speed: 12
      });
    }
  }, [hasPowerShot]);

  // Resume from pause without resetting
  const resumeGame = () => {
    setGameStatus('playing');
    if (!requestIdRef.current) {
      requestIdRef.current = requestAnimationFrame(draw);
    }
  };

  // Listen for keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (gameStatus === 'playing') {
          handleJump();
        } else if (gameStatus === 'start') {
          startGame();
        } else if (gameStatus === 'paused') {
          resumeGame();
        }
      } else if (e.code === 'ArrowRight') {
        if (gameStatus === 'playing') {
          handleShoot();
        }
      } else if (e.code === 'Escape') {
        if (gameStatus === 'playing') {
          setGameStatus('paused');
        } else if (gameStatus === 'paused') {
          resumeGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleJump, handleShoot]);

  // -------------------------------
  // Drawing Functions
  // -------------------------------
  const drawSamurai = (ctx: CanvasRenderingContext2D, ent: Entity) => {
    const cellSize = 4.5; // increased scale factor
    // Draw the pixel-art body with dynamic glow effect
    ctx.save();
    // Add glow based on power state
    ctx.shadowColor = hasPowerShot ? '#40a0ff' : '#ff4040';
    ctx.shadowBlur = hasPowerShot ? 20 : 10;
    
    for (let row = 0; row < samuraiPixels.length; row++) {
      for (let col = 0; col < samuraiPixels[row].length; col++) {
        if (samuraiPixels[row][col] === 'X') {
          ctx.fillStyle = '#d03030';
          ctx.fillRect(
            ent.x + col * cellSize,
            ent.y + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
    ctx.restore();
    
    // Draw a glowing sword
    ctx.save();
    ctx.shadowColor = '#80c0ff';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#e0e0ff';
    ctx.lineWidth = 3;
    const handX = ent.x + 42;
    const handY = ent.y + 30;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(handX + 25, handY - 8);
    ctx.stroke();
    // Sword hilt
    ctx.strokeStyle = '#a05520';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(handX + 5, handY + 5);
    ctx.stroke();
    ctx.restore();
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0b0e11');
    grad.addColorStop(1, '#232526');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(0, 660, w, 60);

    // Lightning silhouettes with more dramatic mountains
    if (lightningRef.current.active) {
      ctx.save();
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.moveTo(0, 660);
      ctx.lineTo(300, 400);
      ctx.lineTo(600, 660);
      ctx.lineTo(900, 380);
      ctx.lineTo(1100, 660);
      ctx.lineTo(1280, 660);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#080808';
      for (let i = 0; i < 4; i++) {
        const tx = 150 + i * 200;
        ctx.beginPath();
        ctx.moveTo(tx, 380);
        ctx.lineTo(tx - 40, 480);
        ctx.lineTo(tx + 40, 480);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  const drawLeavesAndRain = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Draw raindrops
    for (let drop of rainRef.current) {
      drop.y += drop.speed;
      drop.x += 0.3;
      if (drop.y > h) {
        drop.y = -10;
        drop.x = Math.random() * w;
      }
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(173,216,230,0.6)';
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + 1.5, drop.y + 10);
      ctx.stroke();
    }
    // Leaves
    for (let leaf of leavesRef.current) {
      leaf.x += leaf.speedX;
      leaf.y += leaf.speedY;
      leaf.rotation += 0.02;
      if (leaf.y > h || leaf.x > w) {
        leaf.x = Math.random() * w;
        leaf.y = -20;
      }
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 10, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawComet = (ctx: CanvasRenderingContext2D, ent: Entity) => {
    const r = ent.width / 2;
    const cx = ent.x + r;
    const cy = ent.y + r;

    // Glow effect
    ctx.save();
    ctx.shadowColor = '#ff6000';
    ctx.shadowBlur = 30;
    
    // Core gradient
    const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.2, '#ffba08');
    grad.addColorStop(0.6, '#faa307');
    grad.addColorStop(1, '#d00000');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();

    // Multiple flame tails
    ctx.strokeStyle = 'rgba(255,128,0,0.4)';
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * 8;
      ctx.lineWidth = 8 - Math.abs(i - 1) * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + offset);
      ctx.lineTo(cx + r * 4, cy + offset * 1.5);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawOrb = (ctx: CanvasRenderingContext2D, ent: Entity) => {
    const r = ent.width / 2;
    const cx = ent.x + r;
    const cy = ent.y + r;
    
    // Outer glow
    ctx.save();
    ctx.shadowColor = '#4040ff';
    ctx.shadowBlur = 20;
    
    // Inner gradient
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#00b4d8');
    grad.addColorStop(1, '#03045e');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fill();
    
    // Energy rings
    ctx.strokeStyle = 'rgba(100,200,255,0.5)';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * (0.4 + i * 0.2), 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawProjectile = (ctx: CanvasRenderingContext2D, p: Projectile) => {
    ctx.save();
    ctx.shadowColor = '#ff4040';
    ctx.shadowBlur = 15;
    
    // Gradient for projectile
    const grad = ctx.createRadialGradient(
      p.x + p.width/2, p.y + p.height/2,
      p.width * 0.2,
      p.x + p.width/2, p.y + p.height/2,
      p.width/2
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#ff5050');
    grad.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(p.x + p.width/2, p.y + p.height/2, p.width/2, p.height/2, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Trailing effect
    ctx.strokeStyle = 'rgba(255,80,80,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x - p.width, p.y + p.height/2);
    ctx.lineTo(p.x + p.width*2, p.y + p.height/2);
    ctx.stroke();
    ctx.restore();
  };

  // Collision detection
  const isColliding = (a: Entity, b: Entity) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  const projCollision = (p: Projectile, o: Entity) => {
    return (
      p.x < o.x + o.width &&
      p.x + p.width > o.x &&
      p.y < o.y + o.height &&
      p.y + p.height > o.y
    );
  };

  // -------------------------------
  // Main Game Loop
  // -------------------------------
  const draw = () => {
    frameCount.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1) Background
    drawBackground(ctx, canvas.width, canvas.height);

    // 2) Leaves + rain
    drawLeavesAndRain(ctx, canvas.width, canvas.height);

    // 3) Update Samurai if playing
    if (gameStatus === 'playing') {
      samuraiRef.current.y += samuraiVelocityRef.current;
      samuraiVelocityRef.current += gravity;
      // Collide with ground at y=430
      if (samuraiRef.current.y > 585) {
        samuraiRef.current.y = 585;
        samuraiVelocityRef.current = 0;
      }
    }
    drawSamurai(ctx, samuraiRef.current);

    // 4) Obstacles (comets)
    const cometSpeed = getCometSpeed();
    obstaclesRef.current.forEach((obs) => {
      obs.x -= cometSpeed;
      drawComet(ctx, obs);
    });
    obstaclesRef.current = obstaclesRef.current.filter((o) => o.x + o.width > 0);

    // 5) Orbs
    orbsRef.current.forEach((orb) => {
      orb.x -= 3;
      drawOrb(ctx, orb);
    });
    orbsRef.current = orbsRef.current.filter((o) => o.x + o.width > 0 && !o.collected);

    // 6) Projectiles
    projectilesRef.current.forEach((proj) => {
      proj.x += proj.speed;
      drawProjectile(ctx, proj);
    });
    projectilesRef.current = projectilesRef.current.filter((proj) => proj.x < canvas.width + 50);

    // 7) Collision detection (samurai + sub‐hitbox)
    const samuraiHitbox = {
      x: samuraiRef.current.x + 5,
      y: samuraiRef.current.y + 10,
      width: 30,
      height: 40
    };
    obstaclesRef.current.forEach((obs) => {
      // If collision => gameOver
      if (isColliding(samuraiHitbox, obs)) {
        setGameStatus('gameOver');
      }
      // Projectile vs. comet
      projectilesRef.current.forEach((proj) => {
        if (projCollision(proj, obs)) {
          obs.x = -9999;
          proj.x = 9999;
          setScore((prev) => prev + 2);
        }
      });
    });
    orbsRef.current.forEach((orb) => {
      if (!orb.collected && isColliding(samuraiHitbox, orb)) {
        orb.collected = true;
        setHasPowerShot(true);
        // 15-second power shot
        setTimeout(() => {
          setHasPowerShot(false);
        }, 15000);
      }
    });

    // 8) Lightning
    if (!lightningRef.current.active && Math.random() < 0.007) {
      lightningRef.current.active = true;
      lightningRef.current.timer = 4;
    }
    if (lightningRef.current.active) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      lightningRef.current.timer--;
      if (lightningRef.current.timer <= 0) {
        lightningRef.current.active = false;
      }
    }

    // 9) Spawn timers
    if (gameStatus === 'playing') {
      spawnTimersRef.current.comet--;
      if (spawnTimersRef.current.comet <= 0) {
        spawnComet();
        spawnTimersRef.current.comet = Math.floor(Math.random() * 60) + 60;
      }
      spawnTimersRef.current.orb--;
      if (spawnTimersRef.current.orb <= 0) {
        spawnPowerOrb();
        spawnTimersRef.current.orb = Math.floor(Math.random() * 600) + 300;
      }
    }

    // 10) Pause overlay
    if (gameStatus === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
      ctx.restore();
    }

    // If game over, stop animating
    if (gameStatus === 'gameOver') {
      cancelAnimationFrame(requestIdRef.current!);
      return;
    }

    requestIdRef.current = requestAnimationFrame(draw);
  };

  // -------------------------------
  // Initialize Leaves & Rain
  // -------------------------------
  useEffect(() => {
    if (!leavesRef.current.length) {
      for (let i = 0; i < 40; i++) {
        leavesRef.current.push({
          x: Math.random() * 1280,
          y: Math.random() * 720,
          speedX: Math.random() * 1.5 + 0.8,
          speedY: Math.random() * 1.2 + 0.4,
          rotation: Math.random() * Math.PI * 2,
          color: ['#A0522D', '#CD853F', '#8B4513', '#D2691E'][Math.floor(Math.random() * 4)],
        });
      }
    }
    if (!rainRef.current.length) {
      for (let i = 0; i < 150; i++) {
        rainRef.current.push({
          x: Math.random() * 1280,
          y: Math.random() * 720,
          speed: 6 + Math.random() * 3
        });
      }
    }
  }, []);

  // -------------------------------
  // Game Control Functions
  // -------------------------------
  const startGame = () => {
    // Reset state variables
    setScore(0);
    setHasPowerShot(false);

    // Set samurai on ground at y=430
    samuraiRef.current = { x: 80, y: 430, width: 40, height: 50 };
    samuraiVelocityRef.current = 0;

    obstaclesRef.current = [];
    orbsRef.current = [];
    projectilesRef.current = [];

    spawnTimersRef.current.comet = Math.floor(Math.random() * 60) + 60;
    spawnTimersRef.current.orb = Math.floor(Math.random() * 600) + 300;

    frameCount.current = 0;
    setGameStatus('playing');

    if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
    }
    requestIdRef.current = requestAnimationFrame(draw);
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  // -------------------------------
  // Render UI & On–Screen Controls
  // -------------------------------
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Stormy Samurai Showdown</h1>
      <p className="text-gray-300 mb-4">
        A stormy night scene with falling leaves, lightning flashes, fireball obstacles, power orbs,
        and a samurai with his sword! <br />
        <strong>Controls:</strong> Space = jump/start/resume; Right Arrow = shoot (if powered up);
        Escape = pause/resume.
      </p>

      <Card className="bg-gray-800 w-full mb-3 shadow-xl">
        <CardContent className="flex flex-col items-center relative">
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="border-2 border-gray-700 rounded-lg bg-black"
          />
          {gameStatus === 'gameOver' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 font-semibold bg-black bg-opacity-75">
              <div className="text-3xl mb-2">Game Over!</div>
              <div className="mb-2">Final Score: {score}</div>
              <Button onClick={startGame} variant="default" className="flex gap-1 px-4 py-2">
                <Play size={20} /> Restart
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* On–screen control buttons (for mobile/touch devices) */}
      {gameStatus === 'playing' && (
        <div className="flex gap-3 mb-3">
          <Button onClick={handleJump} variant="default" className="flex gap-1 px-4 py-2">
            Jump
          </Button>
          {hasPowerShot && (
            <Button onClick={handleShoot} variant="default" className="flex gap-1 px-4 py-2">
              Shoot
            </Button>
          )}
          <Button
            onClick={() => setGameStatus('paused')}
            variant="outline"
            className="flex gap-1 px-4 py-2"
          >
            <Pause size={20} /> Pause
          </Button>
        </div>
      )}

      {/* Start/Resume Buttons */}
      {(gameStatus === 'start' || gameStatus === 'paused') && (
        <div className="flex gap-3 mb-3">
          <Button
            onClick={gameStatus === 'paused' ? resumeGame : startGame}
            variant="default"
            className="flex gap-1 px-4 py-2"
          >
            <Play size={20} /> {gameStatus === 'paused' ? 'Resume' : 'Start'}
          </Button>
          <Button onClick={handleClose} variant="outline" className="flex gap-1 px-4 py-2 text-red-300">
            <X size={20} /> Close
          </Button>
        </div>
      )}

      {gameStatus !== 'start' && gameStatus !== 'paused' && (
        <Button onClick={handleClose} variant="outline" className="flex gap-1 px-4 py-2 text-red-300">
          <X size={20} /> Close
        </Button>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Enjoy the unpredictability and the samurai’s sword action!
      </p>
    </div>
  );
};

export default StormySamuraiShowdown;
