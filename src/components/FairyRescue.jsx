// Rescue Twinkle: a fairy locked in a cage. Each right answer breaks one bar.

const HAPPY = ['Snap! One bar is gone!', 'Hehe, that tickles!', 'Yay! You are so smart!', 'My wings are wiggling!', 'Crack! Keep going!'];
const OOPS = ['Oopsie! Next one!', 'Boing! That bar is bouncy!', 'No worries, we can do it!', 'Hmm, let us try the next one!'];
const FREE = ['Wheee! I am FREE! Thank you!', 'Look, I can fly!', 'Extra sparkles for you! ✨', 'You are my hero!'];

// How many bars to break: about 6 in 10 answers right, between 1 and 8 bars.
export function rescueNeed(scored) {
  return scored > 0 ? Math.min(8, Math.max(1, Math.ceil(scored * 0.6))) : 0;
}

function message({ need, got, wrong, mood, ended }) {
  const left = Math.max(0, need - got);
  const free = left === 0;
  if (ended) {
    return free ? 'You set me free! Thank you, hero! 💖' : `So close! Just ${left} more! Play again to set me free!`;
  }
  if (free) return FREE[(got - need) % FREE.length];
  const more = left === 1 ? 'Just 1 more!' : `${left} more to go!`;
  if (mood === 'happy') return `${HAPPY[got % HAPPY.length]} ${more}`;
  if (mood === 'oops') return OOPS[wrong % OOPS.length];
  return `Help! I'm stuck! Get ${left} right to set me free!`;
}

const STAR = '92,38 94.2,43.5 100,44 95.5,47.8 97,53.5 92,50.5 87,53.5 88.5,47.8 84,44 89.8,43.5';

function FairyCage({ need, got, free, mood }) {
  const xs = Array.from({ length: need }, (_, i) => (need === 1 ? 60 : 22 + (i * 76) / (need - 1)));
  const face = free ? 'free' : mood;
  return (
    <svg className="fairy-svg" viewBox="0 0 120 140" aria-hidden="true">
      {free && (
        <g className="sparkles">
          <text x="6" y="34">✨</text>
          <text x="98" y="24">⭐</text>
          <text x="102" y="84">✨</text>
          <text x="2" y="96">⭐</text>
        </g>
      )}

      <g className={`fairy ${free ? 'flying' : ''} ${mood === 'oops' && !free ? 'wobble' : ''}`}>
        <g className="f-wing">
          <ellipse cx="44" cy="70" rx="15" ry="24" transform="rotate(-32 44 70)" fill="#C9F1FF" stroke="#7FD3F7" strokeWidth="2" opacity="0.95" />
          <ellipse cx="76" cy="70" rx="15" ry="24" transform="rotate(32 76 70)" fill="#C9F1FF" stroke="#7FD3F7" strokeWidth="2" opacity="0.95" />
        </g>
        {/* legs + shoes */}
        <rect x="53" y="104" width="5" height="12" rx="2" fill="#FFD8B5" />
        <rect x="62" y="104" width="5" height="12" rx="2" fill="#FFD8B5" />
        <ellipse cx="55" cy="117" rx="5" ry="3" fill="#E0559A" />
        <ellipse cx="65" cy="117" rx="5" ry="3" fill="#E0559A" />
        {/* dress */}
        <path d="M60 68 L39 108 Q60 115 81 108 Z" fill="#FF7EB6" stroke="#E0559A" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="52" cy="98" r="2" fill="#fff" />
        <circle cx="62" cy="92" r="2" fill="#fff" />
        <circle cx="70" cy="101" r="2" fill="#fff" />
        {/* arms + wand */}
        <path d="M49 79 Q39 85 35 77" stroke="#FFD8B5" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M71 79 Q83 77 86 66" stroke="#FFD8B5" strokeWidth="5" fill="none" strokeLinecap="round" />
        <line x1="86" y1="66" x2="92" y2="50" stroke="#8B5E3C" strokeWidth="3" strokeLinecap="round" />
        <polygon className="wand-star" points={STAR} fill="#FFC93C" stroke="#E0A800" strokeWidth="1.5" />
        {/* head */}
        <circle cx="60" cy="49" r="20" fill="#8B4A2B" />
        <circle cx="60" cy="27" r="8" fill="#8B4A2B" />
        <circle cx="60" cy="54" r="15" fill="#FFD8B5" />
        <path d="M45 50 Q51 35 60 40 Q69 35 75 50 Q68 43 60 46 Q52 43 45 50 Z" fill="#8B4A2B" />
        <circle cx="73" cy="37" r="4" fill="#FFC93C" />
        <circle cx="73" cy="37" r="1.6" fill="#E0559A" />
        {/* eyes */}
        {face === 'oops' ? (
          <>
            <path d="M51 53 l5 2 l-5 2" stroke="#2B2D42" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M69 53 l-5 2 l5 2" stroke="#2B2D42" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ) : face === 'happy' || face === 'free' ? (
          <>
            <path d="M51 55 q3 -4 6 0" stroke="#2B2D42" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M63 55 q3 -4 6 0" stroke="#2B2D42" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="54" cy="54" r="2.4" fill="#2B2D42" />
            <circle cx="66" cy="54" r="2.4" fill="#2B2D42" />
          </>
        )}
        <circle cx="49" cy="60" r="3" fill="#FF9EC0" opacity="0.8" />
        <circle cx="71" cy="60" r="3" fill="#FF9EC0" opacity="0.8" />
        {/* mouth */}
        {face === 'oops' ? (
          <ellipse cx="60" cy="63" rx="2.6" ry="3" fill="#B03A60" />
        ) : face === 'happy' || face === 'free' ? (
          <path d="M54 60 Q60 68 66 60 Z" fill="#B03A60" />
        ) : (
          <path d="M56 61 Q60 64 64 61" stroke="#B03A60" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
      </g>

      <g className={`cage ${free ? 'open' : ''}`}>
        <circle cx="60" cy="8" r="5" fill="none" stroke="#9AA0B5" strokeWidth="3.5" />
        <path d="M12 42 Q60 -8 108 42" fill="none" stroke="#7C829A" strokeWidth="5" strokeLinecap="round" />
        <rect x="9" y="40" width="102" height="6" rx="3" fill="#7C829A" />
        {xs.map((x, i) => (
          <rect key={i} className={`bar ${i < got ? 'gone' : ''}`} x={x - 2.5} y="44" width="5" height="80" rx="2.5" fill="#7C829A" />
        ))}
        <rect x="7" y="122" width="106" height="10" rx="5" fill="#7C829A" />
        {!free && (
          <g className="lock">
            <path d="M55 96 v-5 a5 5 0 0 1 10 0 v5" fill="none" stroke="#E0A800" strokeWidth="3" />
            <rect x="51" y="95" width="18" height="14" rx="3" fill="#FFC93C" stroke="#E0A800" strokeWidth="2" />
            <circle cx="60" cy="101" r="2" fill="#7A5A00" />
          </g>
        )}
      </g>
    </svg>
  );
}

export default function FairyRescue({ need, got, wrong = 0, mood = null, big = false, ended = false }) {
  if (!need) return null;
  const free = got >= need;
  const text = message({ need, got, wrong, mood, ended });
  return (
    <div className={`rescue ${big ? 'rescue-big' : ''} ${free ? 'is-free' : ''}`}>
      <FairyCage need={need} got={got} free={free} mood={mood} />
      <div className="rescue-bubble" key={`${got}-${wrong}-${ended}`} aria-live="polite">
        <span className="rescue-name">🧚 Twinkle</span>
        <p>{text}</p>
        {!free && (
          <div className="rescue-bars" aria-label={`${Math.min(got, need)} of ${need} bars broken`}>
            {Array.from({ length: need }, (_, i) => (
              <span key={i} className={i < got ? 'broken' : ''} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
