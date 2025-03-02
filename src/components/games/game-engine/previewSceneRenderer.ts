interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
}

class PreviewSceneRenderer {
  private stars: Star[] = [];

  private initializeStars(width: number, height: number) {
    this.stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height - 100),
      speed: 0.1 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      brightness: Math.random(),
    }));
  }

  private updateStars(width: number, height: number, delta: number) {
    this.stars.forEach((star) => {
      star.x -= star.speed * (delta / 16);
      if (star.x < 0) {
        star.x = width;
        star.y = Math.random() * (height - 100);
        star.brightness = Math.random();
      }
    });
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    delta: number
  ) {
    if (this.stars.length === 0) {
      this.initializeStars(width, height);
    }

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw stars with parallax effect
    this.updateStars(width, height, delta);
    this.stars.forEach((star) => {
      const brightness =
        (Math.sin(Date.now() * 0.001 + star.brightness * 10) + 1) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + brightness * 0.8})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Ground with gradient
    const groundGradient = ctx.createLinearGradient(0, height - 100, 0, height);
    groundGradient.addColorStop(0, "#30475e");
    groundGradient.addColorStop(1, "#2c3e50");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height - 80, width, 80);

    // Player character (pixelated) with bounce animation
    const time = Date.now() * 0.005;
    const bounce = Math.sin(time) * 5;

    ctx.fillStyle = "#fff";
    const playerSize = 40;
    const playerX = width * 0.3;
    const playerY = height - 100 + bounce;

    // Body
    ctx.fillRect(playerX, playerY, playerSize, playerSize);

    // Running animation shadows
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    const shadow1Offset = Math.sin(time) * 20;
    const shadow2Offset = Math.sin(time + Math.PI) * 20;
    ctx.fillRect(
      playerX - 20 + shadow1Offset,
      playerY + 10,
      playerSize - 10,
      playerSize - 10
    );
    ctx.fillRect(
      playerX + 40 + shadow2Offset,
      playerY + 5,
      playerSize - 10,
      playerSize - 10
    );

    // Add some ambient particles
    const particleCount = 20;
    const time2 = Date.now() * 0.001;

    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time2 + i) * 0.5 + 0.5) * width;
      const y = (Math.cos(time2 + i * 0.7) * 0.3 + 0.5) * height;
      const size = (Math.sin(time2 + i * 0.5) + 1) * 3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export const previewSceneRenderer = new PreviewSceneRenderer();
