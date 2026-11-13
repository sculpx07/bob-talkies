import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-navy': 'var(--bg-navy)',
        'border-subtle': 'var(--border-subtle)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        gold: {
          400: 'var(--gold-400)',
          500: 'var(--gold-500)',
          600: 'var(--gold-600)',
        },
        'champagne-200': 'var(--champagne-200)',
        'crimson-500': 'var(--crimson-500)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Jost', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        pill: '999px',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(201, 162, 75, 0.3)',
        'gold-glow-lg': '0 0 40px rgba(201, 162, 75, 0.4)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D8B867, #A8832F)',
        'dark-gradient': 'linear-gradient(180deg, transparent 0%, #0A0A0F 100%)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        marquee: 'marquee 60s linear infinite',
        'plan-pulse': 'planPulse 1.1s ease-out 2',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        planPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(217,70,239,0.55), 0 24px 60px rgba(107,35,152,0.22)', transform: 'scale(1)' },
          '50%': { transform: 'scale(1.025)' },
          '100%': { boxShadow: '0 0 0 26px rgba(217,70,239,0), 0 24px 60px rgba(107,35,152,0.22)', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(var(--marquee-distance))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('@tailwindcss/typography'),
  ],
}

export default config
