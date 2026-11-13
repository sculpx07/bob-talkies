import { useEffect, useState } from 'react'

interface Props { onDone: () => void }

export function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'dark' | 'reel' | 'beam' | 'logo' | 'hold' | 'out'>('dark')

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    ts.push(setTimeout(() => setPhase('reel'),  200))
    ts.push(setTimeout(() => setPhase('beam'),  800))
    ts.push(setTimeout(() => setPhase('logo'), 1300))
    ts.push(setTimeout(() => setPhase('hold'), 1900))
    ts.push(setTimeout(() => setPhase('out'),  3000))
    ts.push(setTimeout(() => onDone(),         3700))
    return () => ts.forEach(clearTimeout)
  }, [onDone])

  const visible = phase !== 'out'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0d0612',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      transition: 'opacity 0.65s ease',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'all' : 'none',
    }}>

      <style>{`
        @keyframes reelSpin { to { transform: rotate(360deg) } }
        @keyframes reelSpinR { to { transform: rotate(-360deg) } }
        @keyframes filmStrip {
          0%   { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        @keyframes beamPulse {
          0%,100% { opacity: 0.18 }
          50%     { opacity: 0.28 }
        }
        @keyframes logoPop {
          0%   { transform: scale(0.5) translateY(20px); opacity:0; filter: brightness(3) blur(6px) }
          60%  { transform: scale(1.08) translateY(-4px); opacity:1; filter: brightness(1.2) blur(0) }
          100% { transform: scale(1) translateY(0); opacity:1; filter: brightness(1) blur(0) }
        }
        @keyframes shimmerBar {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes curtainLeft {
          0%   { transform: translateX(0) }
          100% { transform: translateX(-100%) }
        }
        @keyframes curtainRight {
          0%   { transform: translateX(0) }
          100% { transform: translateX(100%) }
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0) scale(1); opacity: 0.7 }
          100% { transform: translateY(-80px) scale(0.4); opacity: 0 }
        }
      `}</style>

      {/* Film strip top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 44,
        display: 'flex', overflow: 'hidden',
        opacity: phase === 'dark' ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}>
        <div style={{
          display: 'flex', gap: 0,
          animation: 'filmStrip 2.8s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} style={{
              width: 52, height: 44, flexShrink: 0,
              background: '#1a0f2e',
              border: '1px solid #2d1f4a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 28, height: 20, background: '#0d0612', borderRadius: 3, border: '1px solid #3d2a5a' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Film strip bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 44,
        display: 'flex', overflow: 'hidden',
        opacity: phase === 'dark' ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}>
        <div style={{
          display: 'flex', gap: 0,
          animation: 'filmStrip 2.2s linear infinite reverse',
          whiteSpace: 'nowrap',
        }}>
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} style={{
              width: 52, height: 44, flexShrink: 0,
              background: '#1a0f2e',
              border: '1px solid #2d1f4a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 28, height: 20, background: '#0d0612', borderRadius: 3, border: '1px solid #3d2a5a' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Left film reel */}
      <div style={{
        position: 'absolute', left: -40, top: '50%', marginTop: -100,
        opacity: phase === 'dark' ? 0 : 1,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        transform: phase === 'dark' ? 'translateX(-30px)' : 'translateX(0)',
      }}>
        <FilmReel size={200} dir={1} />
      </div>

      {/* Right film reel */}
      <div style={{
        position: 'absolute', right: -40, top: '50%', marginTop: -100,
        opacity: phase === 'dark' ? 0 : 1,
        transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
        transform: phase === 'dark' ? 'translateX(30px)' : 'translateX(0)',
      }}>
        <FilmReel size={200} dir={-1} />
      </div>

      {/* Projector beam */}
      {(phase === 'beam' || phase === 'logo' || phase === 'hold') && (
        <div style={{
          position: 'absolute', top: 44, left: '50%',
          width: 0, height: 0,
          borderLeft: '220px solid transparent',
          borderRight: '220px solid transparent',
          borderTop: '110vh solid rgba(201,168,76,0.07)',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          animation: 'beamPulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Dust particles in beam */}
      {(phase === 'logo' || phase === 'hold') && Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${42 + Math.sin(i * 1.3) * 10}%`,
          top: `${25 + (i % 4) * 12}%`,
          width: 3, height: 3,
          borderRadius: '50%',
          background: '#d4a94a',
          opacity: 0,
          animation: `particleFloat ${1.4 + i * 0.3}s ease-out ${i * 0.2}s infinite`,
        }} />
      ))}

      {/* Curtains — open outward on beam phase */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', pointerEvents: 'none',
        zIndex: 2,
      }}>
        <div style={{
          flex: 1, background: 'linear-gradient(to right, #1a0932, #2d1050)',
          transition: 'transform 0.7s cubic-bezier(0.76,0,0.24,1)',
          transform: (phase === 'beam' || phase === 'logo' || phase === 'hold' || phase === 'out')
            ? 'translateX(-100%)' : 'translateX(0)',
        }} />
        <div style={{
          flex: 1, background: 'linear-gradient(to left, #1a0932, #2d1050)',
          transition: 'transform 0.7s cubic-bezier(0.76,0,0.24,1)',
          transform: (phase === 'beam' || phase === 'logo' || phase === 'hold' || phase === 'out')
            ? 'translateX(100%)' : 'translateX(0)',
        }} />
      </div>

      {/* Logo center */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          animation: (phase === 'logo' || phase === 'hold') ? 'logoPop 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards' : undefined,
          opacity: (phase === 'logo' || phase === 'hold') ? undefined : 0,
          filter: 'drop-shadow(0 0 32px rgba(201,168,76,0.5))',
        }}>
          <img src="/logo.png" alt="BOB Talkies" style={{ height: 100, width: 'auto' }} />
        </div>

        {/* Gold shimmer bar */}
        {(phase === 'logo' || phase === 'hold') && (
          <div style={{
            width: 72, height: 3, borderRadius: 99,
            overflow: 'hidden', background: '#2a1a4a',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #c9a84c, #eed98a, #c9a84c)',
              backgroundSize: '200% 100%',
              animation: 'shimmerBar 1s linear infinite',
            }} />
          </div>
        )}
      </div>
    </div>
  )
}

function FilmReel({ size, dir }: { size: number; dir: 1 | -1 }) {
  const r = size / 2
  const spokes = 6
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g style={{
        transformOrigin: `${r}px ${r}px`,
        animation: `${dir === 1 ? 'reelSpin' : 'reelSpinR'} 2.5s linear infinite`,
      }}>
        {/* Outer ring */}
        <circle cx={r} cy={r} r={r - 4} fill="none" stroke="#3d2a5a" strokeWidth={8} />
        {/* Inner hub */}
        <circle cx={r} cy={r} r={r * 0.22} fill="#2a1a4a" stroke="#c9a84c" strokeWidth={2} />
        <circle cx={r} cy={r} r={r * 0.1} fill="#c9a84c" />
        {/* Spokes */}
        {Array.from({ length: spokes }).map((_, i) => {
          const angle = (i / spokes) * Math.PI * 2
          const x1 = r + Math.cos(angle) * r * 0.24
          const y1 = r + Math.sin(angle) * r * 0.24
          const x2 = r + Math.cos(angle) * (r - 14)
          const y2 = r + Math.sin(angle) * (r - 14)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3d2a5a" strokeWidth={5} />
        })}
        {/* Sprocket holes on outer ring */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const hx = r + Math.cos(angle) * (r - 10)
          const hy = r + Math.sin(angle) * (r - 10)
          return <circle key={i} cx={hx} cy={hy} r={4} fill="#0d0612" />
        })}
        {/* Middle ring */}
        <circle cx={r} cy={r} r={r * 0.52} fill="none" stroke="#2a1a4a" strokeWidth={3} />
        {/* Film frame cutouts between spokes */}
        {Array.from({ length: spokes }).map((_, i) => {
          const angle = ((i + 0.5) / spokes) * Math.PI * 2
          const fx = r + Math.cos(angle) * r * 0.62
          const fy = r + Math.sin(angle) * r * 0.62
          return (
            <rect key={i}
              x={fx - 10} y={fy - 7} width={20} height={14} rx={2}
              fill="#1a0f2e" stroke="#3d2a5a" strokeWidth={1}
              transform={`rotate(${(i + 0.5) / spokes * 360} ${r} ${r})`}
            />
          )
        })}
      </g>
    </svg>
  )
}
