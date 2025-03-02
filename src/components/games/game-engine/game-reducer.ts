import { GameState, GameAction, Obstacle, PowerUp } from "./types";

const GROUND_HEIGHT = 80;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const BASE_SPEED = 5;

export const createInitialState = (
  width: number,
  height: number
): GameState => ({
  player: {
    x: width * 0.2,
    y: height - GROUND_HEIGHT - 40,
    width: 40,
    height: 40,
    velocity: { x: 0, y: 0 },
    isJumping: false,
    isSliding: false,
    jumpForce: JUMP_FORCE,
    gravity: GRAVITY,
  },
  obstacles: [],
  powerUps: [],
  score: 0,
  speed: BASE_SPEED,
  isGameOver: false,
});

const checkCollision = (
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

const generateObstacle = (width: number, height: number): Obstacle => {
  const type = Math.random() > 0.5 ? "high" : "low";
  return {
    type,
    x: width + 50,
    y: height - GROUND_HEIGHT - (type === "high" ? 100 : 40),
    width: 40,
    height: type === "high" ? 60 : 40,
    velocity: { x: 0, y: 0 },
  };
};

const generatePowerUp = (width: number, height: number): PowerUp => {
  const types: PowerUp["type"][] = ["speed", "shield", "points"];
  return {
    type: types[Math.floor(Math.random() * types.length)],
    x: width + 50,
    y: height - GROUND_HEIGHT - 100 - Math.random() * 100,
    width: 30,
    height: 30,
    velocity: { x: 0, y: 0 },
    active: true,
  };
};

export const gameReducer = (
  state: GameState,
  action: GameAction
): GameState => {
  switch (action.type) {
    case "JUMP":
      if (!state.player.isJumping) {
        return {
          ...state,
          player: {
            ...state.player,
            isJumping: true,
            velocity: { ...state.player.velocity, y: state.player.jumpForce },
          },
        };
      }
      return state;

    case "SLIDE":
      if (!state.player.isSliding) {
        return {
          ...state,
          player: {
            ...state.player,
            isSliding: true,
            height: state.player.height / 2,
            y: state.player.y + state.player.height / 2,
          },
        };
      }
      return state;

    case "STOP_SLIDE":
      if (state.player.isSliding) {
        return {
          ...state,
          player: {
            ...state.player,
            isSliding: false,
            height: state.player.height * 2,
            y: state.player.y - state.player.height,
          },
        };
      }
      return state;

    case "UPDATE":
      // Update player physics
      let newY = state.player.y + state.player.velocity.y;
      let newVelocityY = state.player.velocity.y;

      // Apply gravity
      newVelocityY += state.player.gravity;

      // Ground collision
      const groundY = window.innerHeight - GROUND_HEIGHT - state.player.height;
      if (newY > groundY) {
        newY = groundY;
        newVelocityY = 0;
        state.player.isJumping = false;
      }

      // Update obstacles
      const updatedObstacles = state.obstacles
        .map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - state.speed,
        }))
        .filter((obstacle) => obstacle.x > -obstacle.width);

      // Update power-ups
      const updatedPowerUps = state.powerUps
        .map((powerUp) => ({
          ...powerUp,
          x: powerUp.x - state.speed,
        }))
        .filter((powerUp) => powerUp.x > -powerUp.width && powerUp.active);

      // Generate new obstacles
      if (Math.random() < 0.02) {
        updatedObstacles.push(
          generateObstacle(window.innerWidth, window.innerHeight)
        );
      }

      // Generate new power-ups
      if (Math.random() < 0.005) {
        updatedPowerUps.push(
          generatePowerUp(window.innerWidth, window.innerHeight)
        );
      }

      // Check collisions
      const playerHitbox = {
        x: state.player.x,
        y: newY,
        width: state.player.width,
        height: state.player.height,
      };

      // Check obstacle collisions
      const collision = updatedObstacles.some((obstacle) =>
        checkCollision(playerHitbox, obstacle)
      );
      if (collision) {
        return { ...state, isGameOver: true };
      }

      return {
        ...state,
        player: {
          ...state.player,
          y: newY,
          velocity: { ...state.player.velocity, y: newVelocityY },
        },
        obstacles: updatedObstacles,
        powerUps: updatedPowerUps,
        score: state.score + 1,
      };

    case "COLLECT_POWER_UP":
      return {
        ...state,
        powerUps: state.powerUps.map((powerUp, index) =>
          index === action.powerUpId ? { ...powerUp, active: false } : powerUp
        ),
        score: state.score + 100, // Bonus points for collecting power-up
      };

    case "GAME_OVER":
      return {
        ...state,
        isGameOver: true,
      };

    case "RESET":
      return createInitialState(window.innerWidth, window.innerHeight);

    default:
      return state;
  }
};
