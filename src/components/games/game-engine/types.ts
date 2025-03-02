export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: {
    x: number;
    y: number;
  };
}

export interface Player extends GameObject {
  isJumping: boolean;
  isSliding: boolean;
  jumpForce: number;
  gravity: number;
}

export interface Obstacle extends GameObject {
  type: "low" | "high";
}

export interface PowerUp extends GameObject {
  type: "speed" | "shield" | "points";
  active: boolean;
}

export interface GameState {
  player: Player;
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  score: number;
  speed: number;
  isGameOver: boolean;
}

export type GameAction =
  | { type: "JUMP" }
  | { type: "SLIDE" }
  | { type: "STOP_SLIDE" }
  | { type: "UPDATE" }
  | { type: "RESET" }
  | { type: "COLLECT_POWER_UP"; powerUpId: number }
  | { type: "GAME_OVER" };
