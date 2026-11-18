export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', surface: 'var(--surface)', ink: 'var(--text)',
        muted: 'var(--muted)', line: 'var(--border)',
        brand: 'rgb(var(--brand) / <alpha-value>)', amber: '#FBBF24', leaf: '#22C55E',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '6px', lg: '8px' },
    },
  },
};
