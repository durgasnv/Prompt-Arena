import { useEffect, useRef, useState } from 'react';

export default function BlurText({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', margin: 0 }}>
      {elements.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: inView ? 1 : 0,
            filter: inView ? 'blur(0px)' : 'blur(8px)',
            transform: inView ? 'translateY(0)' : `translateY(${direction === 'top' ? '-15px' : '15px'})`,
            transition: `opacity 0.6s ease ${i * delay}ms, filter 0.6s ease ${i * delay}ms, transform 0.6s ease ${i * delay}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}
