/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0d14',          // Extremely deep space dark gray/black
          card: 'rgba(17, 22, 34, 0.65)', // Semitransparent card fill
          border: 'rgba(255, 255, 255, 0.08)',
          glow: '#00F0FF',        // Electric Cyan
          purple: '#A100FF',      // Neon Purple
          success: '#10B981',     // Emerald Green
          warning: '#F59E0B',     // Amber Yellow
          danger: '#EF4444',      // Rose Red
          text: '#F3F4F6',        // Gray 100
          textMuted: '#9CA3AF'    // Gray 400
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'cyber-cyan': '0 0 15px rgba(0, 240, 255, 0.25)',
        'cyber-purple': '0 0 15px rgba(161, 0, 255, 0.25)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.25)',
      },
      backdropBlur: {
        'glass': '12px'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 2px rgba(0, 240, 255, 0.4))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.8))' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
