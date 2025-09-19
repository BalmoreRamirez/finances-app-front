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
            fontFamily: {
                'sans': ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Colores principales minimalistas
                "primary": {
                    '500': '#5A5BFF',
                    '600': '#5050E6',
                    '700': '#5050E6',
                    DEFAULT: '#5A5BFF'
                },
                "secondary": {
                    '500': '#475259',
                    '600': '#8505A6',
                    DEFAULT: '#475259'
                },
                "background": {
                    'light': '#F5F7FA',
                    'DEFAULT': '#E3EAF1',
                    'white': '#FFFFFF',
                },
                "text": {
                    'primary': '#475259',
                    'secondary': '#8505A6',
                    'muted': '#9CA3AF'
                },
                // Colores de estado
                "success": {
                    '500': '#10B981',
                    '600': '#059669',
                },
                "danger": {
                    '500': '#EF4444',
                    '600': '#DC2626',
                },
                "warning": {
                    '500': '#F59E0B',
                    '600': '#D97706',
                },
                // Colores neutrales
                "neutral": {
                    '50': '#F9FAFB',
                    '100': '#F3F4F6',
                    '200': '#E5E7EB',
                    '300': '#D1D5DB',
                    '400': '#9CA3AF',
                    '500': '#6B7280',
                    '600': '#4B5563',
                    '700': '#374151',
                    '800': '#1F2937',
                    '900': '#111827',
                }
            },
        },
    },
    plugins: [],
}