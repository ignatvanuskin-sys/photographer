import type { Config } from 'tailwindcss';

/**
 * Дизайн-система «галерея в тёмной комнате».
 * Палитра и типографическая шкала вынесены сюда как единственный источник правды
 * для утилит. CSS-переменные (app/globals.css) дублируют те же значения для
 * инлайновых стилей и градиентов.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Фон
        graphite: '#0E0E0F',
        'graphite-soft': '#151517',
        'graphite-line': '#242427',
        bone: '#F4F0EA',
        'bone-dim': '#E7E1D8',
        // Текст на светлом
        ink: '#161616',
        'ink-soft': '#4A4741',
        // Единственный акцент — приглушённая латунь.
        brass: '#C9A96A',
        'brass-deep': '#A98545',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Шкала из ТЗ: 15/17/22/32/48/72/104 с clamp для адаптива
        'step-0': ['clamp(0.875rem, 0.85rem + 0.15vw, 0.9375rem)', { lineHeight: '1.55' }],
        'step-1': ['clamp(0.9375rem, 0.9rem + 0.2vw, 1.0625rem)', { lineHeight: '1.6' }],
        'step-2': ['clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)', { lineHeight: '1.5' }],
        'step-3': ['clamp(1.375rem, 1.2rem + 0.8vw, 2rem)', { lineHeight: '1.3' }],
        'step-4': ['clamp(1.75rem, 1.4rem + 1.6vw, 3rem)', { lineHeight: '1.15' }],
        'step-5': ['clamp(2.25rem, 1.5rem + 3.4vw, 4.5rem)', { lineHeight: '1.08' }],
        'step-6': ['clamp(2.75rem, 1.4rem + 6vw, 6.5rem)', { lineHeight: '1.05' }],
      },
      letterSpacing: {
        caps: '0.18em',
        tight2: '-0.02em',
      },
      maxWidth: {
        site: '1440px',
        prose2: '62ch',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1.00)' },
          '100%': { transform: 'scale(1.06)' },
        },
      },
      animation: {
        kenburns: 'kenburns 22s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
