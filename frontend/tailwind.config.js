/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                charcoal: '#272d2d',
                'lilac-ash': '#a39ba8',
                'pale-slate': '#b8c5d6',
                'alice-blue': '#edf5fc',
                emerald: '#23ce6b',
            },
        },
    },
    plugins: [],
}
