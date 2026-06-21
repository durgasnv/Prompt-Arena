import { useEffect, useRef } from 'react';
import './LiquidEther.css';

export default function LiquidEther({
  colors = ['#1e1b4b', '#312e81', '#4338ca'],
  autoSpeed = 0.3,
  autoIntensity = 1.8,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;
    let mouseX = 0.5, mouseY = 0.5;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = e => {
      const r = canvas.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width;
      mouseY = (e.clientY - r.top) / r.height;
    };
    canvas.addEventListener('mousemove', onMouse);

    const hexAlpha = (hex, a) => {
      const n = Math.round(a * 255).toString(16).padStart(2, '0');
      return hex + n;
    };

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const blobs = [
        { x: 0.2 + Math.sin(t * 0.7) * 0.18, y: 0.5 + Math.cos(t * 0.5) * 0.22, r: 0.55, c: colors[0] },
        { x: 0.8 + Math.sin(t * 0.4 + 1) * 0.12, y: 0.25 + Math.cos(t * 0.6) * 0.2, r: 0.5, c: colors[1] ?? colors[0] },
        { x: 0.5 + Math.sin(t * 0.6 + 2) * 0.2, y: 0.75 + Math.cos(t * 0.4) * 0.15, r: 0.45, c: colors[2] ?? colors[0] },
        { x: mouseX, y: mouseY, r: 0.25 * autoIntensity, c: colors[1] ?? colors[0] },
      ];

      blobs.forEach(blob => {
        const gx = blob.x * w, gy = blob.y * h;
        const radius = Math.min(w, h) * blob.r;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
        grad.addColorStop(0, hexAlpha(blob.c, 0.7));
        grad.addColorStop(1, hexAlpha(blob.c, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      t += 0.01 * autoSpeed * 3;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return (
    <div className={`liquid-ether-container ${className}`} style={style}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
