/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./node_modules/primevue/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "neutral": {
                    '50': '#F7F6F6',
                    '100': '#DFDCD9',
                    '200': '#C7C5C2',
                    '300': '#ABA8A5',
                    '400': '#8D8A87',
                    '500': '#6E6B68',
                    '600': '#595654',
                    '700': '#4A4744',
                    '800': '#383533',
                    '900': '#262422',
                },
                "primary": {
                    '50': '#F0F9FF',
                    '100': '#E0F2FE',
                    '200': '#BAE6FD',
                    '300': '#7DD3FC',
                    '400': '#38BDF8',
                    '500': '#0EA5E9',
                    '600': '#0284C7',
                    '700': '#0369A1',
                    '800': '#075985',
                    '900': '#0C4A6E',
                },
                "accent": {
                    '50': '#FDF6EF',
                    '100': '#F5DABE',
                    '300': '#E8B991',
                    '500': '#DF9B6A',
                    '700': '#B47849',
                    '800': '#9A633A',
                    '900': '#8A5834',
                },
                "danger": {
                    '50': '#FEF2F2',
                    '100': '#FEE2E2',
                    '300': '#FCA5A5',
                    '500': '#EF4444',
                    '600': '#DC2626',
                    '700': '#B91C1C',
                    '800': '#991B1B',
                    '900': '#7F1D1D',
                },
                "finance": {
                    '50': '#ECFDF5',
                    '100': '#D1FAE5',
                    '300': '#6EE7B7',
                    '500': '#10B981',
                    '700': '#047857',
                    '800': '#065F46',
                    '900': '#064E3B',
                },
                "background": {
                    'light': '#FFFFFF', 'DEFAULT': '#FCFBFA', 'subtle': '#F5F4F3',
                },
                "dark": {
                    'DEFAULT': '#020102', 'soft': '#1A1A1A',
                }
            },
        },
    },
    plugins: [],
}