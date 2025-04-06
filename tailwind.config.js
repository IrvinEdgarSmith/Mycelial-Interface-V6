/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: 'var(--color-background-primary)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
        },
        secondary: {
          main: 'var(--color-secondary-main)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
        },
        tertiary: {
          main: 'var(--color-tertiary-main)',
          light: 'var(--color-tertiary-light)',
          dark: 'var(--color-tertiary-dark)',
        },
        accent: {
          main: 'var(--color-accent-main)',
          light: 'var(--color-accent-light)',
          dark: 'var(--color-accent-dark)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        border: 'var(--color-border)',
      },
    },
  },
  plugins: [],
}
