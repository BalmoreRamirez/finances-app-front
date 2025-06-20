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
        // Gris - Neutral
        neutral: {
          100: '#DFDCD9', // Fondos claros, bordes suaves
          300: '#ABA8A5', // Textos secundarios, iconos inactivos
          500: '#6E6B68', // Color base, textos normales
          700: '#4A4744', // Elementos destacados, cabeceras
          900: '#262422', // Textos de alto contraste
        },
        // Naranja/marrón - Acento
        accent: {
          100: '#F5DABE', // Fondos suaves, alertas leves
          300: '#E8B991', // Botones secundarios, iconos destacados
          500: '#DF9B6A', // Color base, botones principales
          700: '#B47849', // Elementos interactivos, hover
          900: '#8A5834', // Textos de contraste sobre claros
        },
        // Blanco hueso - Fondo
        background: {
          light: '#FFFFFF', // Fondo totalmente blanco
          DEFAULT: '#FCFBFA', // Color base para fondos
          subtle: '#F5F4F3', // Fondos alternos, tarjetas
        },
        // Verde - Finanzas
        finance: {
          100: '#A7C2B5', // Indicadores positivos suaves
          300: '#5E8470', // Elementos secundarios, gráficos
          500: '#1D4634', // Color base, botones de acción
          700: '#143025', // Elementos destacados, cabeceras
          900: '#0B1A15', // Fondos oscuros especiales
        },
        // Negro - Oscuro
        dark: {
          DEFAULT: '#020102', // Negro base
          soft: '#1A1A1A', // Negro suavizado para fondos oscuros
        }
      },
    },
  },
  plugins: [],
}