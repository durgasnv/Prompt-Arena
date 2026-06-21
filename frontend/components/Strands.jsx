import { useEffect, useRef } from 'react';
import './Strands.css';

export default function Strands({
  colors = ['#6366f1', '#8b5cf6', '#06b6d4'],
  count = 3,
  speed = 0.4,
  amplitude = 0.7,
  opacity = 0.75,
  glow = 2,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const propsRef = useRef({});
  propsRef.current = { colors, count, speed, amplitude, opacity, glow };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { colors, count, speed, amplitude, opacity, glow } = propsRef.current;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < count; i++) {
        const color = colors[i % colors.length];
        const phase = (i / count) * Math.PI * 2;
        const freq = 1.5 + i * 0.4;
        const amp = h * amplitude * 0.22;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = opacity;
        ctx.shadowColor = color;
        ctx.shadowBlur = glow * 10;

        for (let x = 0; x <= w; x += 2) {
          const n = x / w;
          const y = h / 2
            + Math.sin(n * freq * Math.PI * 2 + t * speed * 3 + phase) * amp
            + Math.sin(n * freq * 1.5 * Math.PI * 2 - t * speed * 2 + phase) * amp * 0.35;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      t += 0.016;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={`strands-container ${className}`} style={style}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
