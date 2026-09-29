/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0A',
        panel: '#0A0A0A',
        surface: 'rgba(255,255,255,0.03)',
        edge: '#1C1C1C',
        line: 'rgba(255,255,255,0.05)',
        fog: '#9AA7B4',
        mist: '#CBD5E1',
        pulse: '#22D3EE',
        pulseBright: '#67E8F9',
        pulseDim: '#0E9DB8',
        cyanx: '#22D3EE',
        danger: '#FB2C36',
        amberx: '#F99C00',
      },
      fontFamily: {
        sans: ['Geist Sans', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Outfit', 'Geist Sans', 'sans-serif'],
        body: ['Geist Sans', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'Noto Sans KR', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: {
        page: '1280px',
      },
      boxShadow: {
        glow: '0 0 44px rgba(34,211,238,0.16)',
        card: '0 8px 32px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
