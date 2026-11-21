import type { Config } from 'tailwindcss'

/**
 * Tailwind config for the admin panel only (used by src/admin/styles/admin.css via @config).
 * It scans admin files only, so the admin CSS carries no customer-site styles and vice versa.
 */
const config: Config = {
  content: ['./admin/index.html', './src/admin/**/*.{ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')({ strategy: 'class' })],
}

export default config
