/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-hover': 'var(--bg-hover)',
        'border-theme': 'var(--border)',
        'color-primary': 'var(--color-primary)',
        'color-secondary': 'var(--color-secondary)',
        'color-success': 'var(--color-success)',
        'color-warning': 'var(--color-warning)',
        'color-danger': 'var(--color-danger)',
        'surface-success': 'var(--surface-success)',
        'surface-danger': 'var(--surface-danger)',
        'surface-warning': 'var(--surface-warning)',
        'surface-info': 'var(--surface-info)',
        /* Brand aliases (available in minor-hotels theme) */
        'brand-navy': 'var(--brand-navy, var(--text-primary))',
        'brand-dark-blue': 'var(--brand-dark-blue, var(--color-primary))',
        'brand-sky': 'var(--brand-sky, var(--color-secondary))',
        'brand-sand': 'var(--brand-sand, var(--bg-hover))',
        'brand-gold': 'var(--brand-gold, var(--color-warning))',
        'brand-yellow': 'var(--brand-yellow, var(--color-warning))',
        'brand-white': 'var(--brand-white, var(--bg-primary))',
        'brand-danger': 'var(--brand-danger, var(--color-danger))',
      },
      borderRadius: {
        'theme': 'var(--radius)',
        'theme-sm': 'var(--radius-sm)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        script: 'var(--font-script)',
        sans: 'var(--font-sans)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
    },
  },
  plugins: [],
}
