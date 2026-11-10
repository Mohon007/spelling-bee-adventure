import { useEffect, useState } from 'react';

const COLORS = ['#FFC93C', '#4D9DE0', '#3BB273', '#E84C8B', '#7B61FF', '#FF8A3D'];

export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return undefined;
    setPieces(
      Array.from({ length: 36 }, (_, i) => ({
        id: `${trigger}-${i}`,
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.2 + Math.random() * 0.9,
        color: COLORS[i % COLORS.length],
        spin: Math.round(Math.random() * 720 - 360),
        shape: i % 3,
      })),
    );
    const t = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i
          key={p.id}
          className={`cf cf-${p.shape}`}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
