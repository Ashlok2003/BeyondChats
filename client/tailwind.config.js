/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#ffffff',
                    100: '#fafafa',
                    200: '#f5f5f5',
                    300: '#e5e5e5',
                    400: '#d4d4d4',
                    500: '#a3a3a3',
                    600: '#737373',
                    700: '#525252',
                    800: '#404040',
                    900: '#262626',
                    950: '#171717',
                },
                dark: {
                    50: '#f9f9f9',
                    100: '#ececec',
                    200: '#e3e3e3',
                    300: '#cdcdcd',
                    400: '#b4b4b4',
                    500: '#9b9b9b',
                    600: '#676767',
                    700: '#424242',
                    800: '#2f2f2f',
                    900: '#1a1a1a',
                    950: '#000000', // Pure black for background
                },
                border: '#333333',
                background: '#0a0a0a', // Slightly off-black for main bg
                surface: '#111111', // Card background
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'gradient': 'gradient 8s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center',
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center',
                    },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
