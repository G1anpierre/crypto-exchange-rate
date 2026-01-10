import type {Config} from 'tailwindcss'
import {heroui} from '@heroui/react' // Make sure this package is correctly installed

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'logo-light':
          "url('/cryptocurrent-high-resolution-logo-black-transparent.png')",
        'logo-dark':
          "url('/cryptocurrent-high-resolution-logo-white-transparent.png')",
      },
    },
  },
  darkMode: 'class',
  plugins: [
    // Use the heroui plugin with proper configuration
    heroui({
      themes: {
        light: {
          colors: {
            background: '#FFFFFF',
            foreground: '#11181C',
            primary: {
              foreground: '#FFFFFF',
              DEFAULT: '#006FEE',
            },
          },
        },
        dark: {
          colors: {
            background: '#000000',
            foreground: '#ECEDEE',
            primary: {
              foreground: '#FFFFFF',
              DEFAULT: '#006FEE',
            },
          },
        },
      },
    }),
  ],
}

export default config
