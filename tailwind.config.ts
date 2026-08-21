import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        panel: '#141414',
        panel2: '#1B1B1B',
        line: '#262626',
        muted: '#8C8C8C',
        cyan: {
          DEFAULT: '#5ECCFA',
          bright: '#7FE0FF',
          dim: '#3FB8F0',
        },
        risk: {
          high: '#F0554F',
          mid: '#F0B84F',
          ok: '#4FD98A',
        },
      },
      fontFamily: {
        display: ['var(--font-anton)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
