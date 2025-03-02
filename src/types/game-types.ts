export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  collected?: boolean;
  hasPowerUp?: boolean;
  hitPoints?: number;
}

export interface Projectile {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Level {
  name: string;
  background: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    frameCount: number
  ) => void;
  spawnItem: () => void;
  spawnObstacle: () => void;
  spawnPowerUp: () => void;
  itemsNeeded?: number;
}
