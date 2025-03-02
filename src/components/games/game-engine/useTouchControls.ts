import { useEffect, useCallback } from "react";

export const useTouchControls = (
  onJump: () => void,
  onSlideStart: () => void,
  onSlideEnd: () => void
) => {
  // Handle touch gestures for jump and slide
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      const screenHeight = window.innerHeight;
      const touchY = touch.clientY;

      // Upper half of screen triggers jump, lower half triggers slide
      if (touchY < screenHeight / 2) {
        onJump();
      } else {
        onSlideStart();
      }
    },
    [onJump, onSlideStart]
  );

  const handleTouchEnd = useCallback(() => {
    onSlideEnd();
  }, [onSlideEnd]);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
};
