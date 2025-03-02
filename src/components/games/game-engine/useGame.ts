import { useReducer, useEffect, useCallback } from "react";
import { gameReducer, createInitialState } from "./game-reducer";
import { GameState } from "./types";
import { useTouchControls } from "./useTouchControls";

export const useGame = (width: number, height: number) => {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    createInitialState(width, height)
  );

  const handleJump = useCallback(() => {
    if (!gameState.isGameOver) {
      dispatch({ type: "JUMP" });
    }
  }, [gameState.isGameOver]);

  const handleSlideStart = useCallback(() => {
    if (!gameState.isGameOver) {
      dispatch({ type: "SLIDE" });
    }
  }, [gameState.isGameOver]);

  const handleSlideEnd = useCallback(() => {
    if (!gameState.isGameOver) {
      dispatch({ type: "STOP_SLIDE" });
    }
  }, [gameState.isGameOver]);

  // Set up touch controls
  useTouchControls(handleJump, handleSlideStart, handleSlideEnd);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (gameState.isGameOver && event.code === "Space") {
        dispatch({ type: "RESET" });
        return;
      }

      if (!gameState.isGameOver) {
        switch (event.code) {
          case "Space":
            event.preventDefault();
            dispatch({ type: "JUMP" });
            break;
          case "ArrowDown":
            event.preventDefault();
            dispatch({ type: "SLIDE" });
            break;
        }
      }
    },
    [gameState.isGameOver]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!gameState.isGameOver && event.code === "ArrowDown") {
        event.preventDefault();
        dispatch({ type: "STOP_SLIDE" });
      }
    },
    [gameState.isGameOver]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Game loop
  useEffect(() => {
    if (!gameState.isGameOver) {
      const gameLoop = setInterval(() => {
        dispatch({ type: "UPDATE" });
      }, 1000 / 60); // 60 FPS

      return () => clearInterval(gameLoop);
    }
  }, [gameState.isGameOver]);

  // Drawing functions
  const drawGame = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { player, obstacles, powerUps } = gameState;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, width, height);

      // Draw ground
      const groundGradient = ctx.createLinearGradient(
        0,
        height - 80,
        0,
        height
      );
      groundGradient.addColorStop(0, "#30475e");
      groundGradient.addColorStop(1, "#2c3e50");
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, height - 80, width, 80);

      // Draw player with slight tilt based on velocity
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      ctx.rotate(Math.min(Math.max(player.velocity.y * 0.05, -0.3), 0.3));
      ctx.fillStyle = "#fff";
      ctx.fillRect(
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height
      );
      ctx.restore();

      // Draw obstacles with glow effect
      obstacles.forEach((obstacle) => {
        ctx.shadowColor = "#ff4757";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#ff4757";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.shadowBlur = 0;
      });

      // Draw power-ups with pulsing effect
      powerUps.forEach((powerUp) => {
        if (!powerUp.active) return;

        const pulse = (Math.sin(Date.now() * 0.01) + 1) * 0.2;
        ctx.fillStyle =
          powerUp.type === "speed"
            ? "#ffd32a"
            : powerUp.type === "shield"
            ? "#2ed573"
            : "#ff7f50";

        ctx.beginPath();
        ctx.arc(
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
          (powerUp.width / 2) * (1 + pulse),
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      // Draw score with shadow
      ctx.fillStyle = "#fff";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "left";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText(`Score: ${gameState.score}`, 20, 40);
      ctx.shadowBlur = 0;

      if (gameState.isGameOver) {
        // Draw game over overlay with blur effect
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 8;

        // Game Over text with glow
        ctx.font = "bold 48px Arial";
        ctx.fillText("Game Over!", width / 2, height / 2);

        // Score and restart instructions
        ctx.font = "bold 24px Arial";
        ctx.fillText(
          `Final Score: ${gameState.score}`,
          width / 2,
          height / 2 + 50
        );
        ctx.fillText("Press SPACE to restart", width / 2, height / 2 + 100);
        ctx.shadowBlur = 0;
      }
    },
    [gameState, width, height]
  );

  return {
    gameState,
    dispatch,
    drawGame,
  };
};
