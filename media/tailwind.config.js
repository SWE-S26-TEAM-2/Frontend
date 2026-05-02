    /** @type {import('tailwindcss').Config} */
    module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
        colors: {
            'sc-bg': 'var(--sc-bg)',
            'sc-surface': 'var(--sc-surface)',
            'sc-text': 'var(--sc-text)',
            'sc-muted': 'var(--sc-muted)',
            'sc-accent': 'var(--sc-accent)',
            'sc-accent-2': 'var(--sc-accent-2)',
            'sc-border': 'var(--sc-border)'
        },
        fontFamily: {
            // Use CSS variable fallback via body for cross-environment safety
            sans: ['Inter', 'system-ui', 'sans-serif'],
        }
        },
    },
    plugins: [],
    };
