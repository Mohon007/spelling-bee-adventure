import { useId } from 'react';

export default function Bee({ size = 96, cheer = false, className = '' }) {
  const clip = `bee${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      className={`bee ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clip}>
          <ellipse cx="60" cy="74" rx="38" ry="31" />
        </clipPath>
      </defs>
      <g className="bee-wings">
        <ellipse cx="40" cy="38" rx="17" ry="24" transform="rotate(-28 40 38)" fill="#E6F6FF" stroke="#2B2D42" strokeWidth="3.5" />
        <ellipse cx="80" cy="38" rx="17" ry="24" transform="rotate(28 80 38)" fill="#E6F6FF" stroke="#2B2D42" strokeWidth="3.5" />
      </g>
      <path d="M50 46 Q44 26 34 22" fill="none" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M70 46 Q76 26 86 22" fill="none" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="34" cy="22" r="5" fill="#2B2D42" />
      <circle cx="86" cy="22" r="5" fill="#2B2D42" />
      <ellipse cx="60" cy="74" rx="38" ry="31" fill="#FFC93C" />
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="85" width="120" height="9" fill="#2B2D42" />
        <rect x="0" y="99" width="120" height="9" fill="#2B2D42" />
      </g>
      <ellipse cx="60" cy="74" rx="38" ry="31" fill="none" stroke="#2B2D42" strokeWidth="4" />
      <circle cx="47" cy="65" r="6" fill="#2B2D42" />
      <circle cx="49" cy="63" r="2" fill="#fff" />
      <circle cx="73" cy="65" r="6" fill="#2B2D42" />
      <circle cx="75" cy="63" r="2" fill="#fff" />
      <circle cx="37" cy="75" r="5" fill="#FF8FA3" opacity="0.75" />
      <circle cx="83" cy="75" r="5" fill="#FF8FA3" opacity="0.75" />
      {cheer ? (
        <path d="M50 73 Q60 88 70 73 Z" fill="#2B2D42" />
      ) : (
        <path d="M51 74 Q60 82 69 74" fill="none" stroke="#2B2D42" strokeWidth="3.5" strokeLinecap="round" />
      )}
    </svg>
  );
}
