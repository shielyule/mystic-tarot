/** Canvas-drawn HAL lens favicon with a soft red pulse (Safari and others ignore SVG favicon animation). */
export function initHalFaviconPulse(): void {
  if (typeof document === "undefined") return;

  document.querySelectorAll('link[rel="icon"], link[rel="alternate icon"]').forEach((el) => el.remove());

  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  document.head.appendChild(link);

  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let frameId = 0;

  const draw = (now: number) => {
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.0026);

    ctx.clearRect(0, 0, 32, 32);

    ctx.fillStyle = "#050505";
    ctx.beginPath();
    ctx.roundRect(0, 0, 32, 32, 5);
    ctx.fill();

    const glow = ctx.createRadialGradient(16, 16, 3, 16, 16, 16);
    glow.addColorStop(0, `rgba(255, 55, 40, ${0.35 + pulse * 0.55})`);
    glow.addColorStop(0.55, `rgba(204, 0, 0, ${0.12 + pulse * 0.28})`);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    ctx.arc(16, 16, 11.5, 0, Math.PI * 2);
    ctx.stroke();

    const core = ctx.createRadialGradient(13.5, 12.5, 0.5, 16, 16, 9);
    core.addColorStop(0, "#ff8877");
    core.addColorStop(0.35, "#ee1100");
    core.addColorStop(1, "#880000");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(16, 16, 8.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 170, 150, ${0.22 + pulse * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(13.2, 12.2, 2.4, 1.6, -0.35, 0, Math.PI * 2);
    ctx.fill();

    link!.href = canvas.toDataURL("image/png");

    if (document.visibilityState === "visible") {
      frameId = requestAnimationFrame(draw);
    }
  };

  const onVisibility = () => {
    cancelAnimationFrame(frameId);
    if (document.visibilityState === "visible") {
      frameId = requestAnimationFrame(draw);
    }
  };

  document.addEventListener("visibilitychange", onVisibility);
  frameId = requestAnimationFrame(draw);
}
