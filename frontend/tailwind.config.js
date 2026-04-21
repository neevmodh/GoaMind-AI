/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'body': ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        'sunset-gold': '#F4A443',
        'deep-amber': '#E07B2A',
        'ocean-deep': '#0A3D5C',
        'ocean-mid': '#1A6A8A',
        'ocean-light': '#4FB3CE',
        'seafoam': '#7ECEC4',
        'sand-light': '#FFF3E0',
        'sand-warm': '#FFE0B2',
        'coral-glow': '#FF6B6B',
        'palm-green': '#2D6A4F',
        'foam-white': '#F0FFFE',
        'dusk-purple': '#6B4C8A',
        'night-sky': '#0D1B2A',
        // Legacy aliases
        'goa-blue': '#0A3D5C',
        'goa-teal': '#7ECEC4',
        'goa-amber': '#F4A443',
        'goa-coral': '#FF6B6B',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-up-slow': 'slideUp 1s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'wave1': 'waveShift 8s linear infinite',
        'wave2': 'waveShift 6s linear infinite reverse',
        'wave3': 'waveShift 4s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 60px 20px rgba(244,164,67,0.4)' },
          '50%': { boxShadow: '0 0 80px 30px rgba(244,164,67,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        waveShift: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-sunset': 'linear-gradient(180deg, #1A3A5C 0%, #2E6B8A 40%, #F4A443 85%, #E07B2A 100%)',
        'gradient-ocean': 'linear-gradient(180deg, #0A3D5C 0%, #0D1B2A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F4A443, #E07B2A)',
        'gradient-sea': 'linear-gradient(135deg, #0A3D5C, #1A6A8A)',
      },
      boxShadow: {
        'gold': '0 8px 32px rgba(244,164,67,0.4)',
        'gold-lg': '0 20px 60px rgba(244,164,67,0.3)',
        'ocean': '0 8px 32px rgba(10,61,92,0.4)',
        'card': '0 4px 24px rgba(10,61,92,0.08)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(244,164,67,0.1)',
      }
    },
  },
  plugins: [],
}
