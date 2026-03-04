/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                surface: '#f8f9fc',
                primary: '#121317',
                'primary-foreground': '#ffffff',
                secondary: '#e1e6ec',
                'secondary-foreground': '#121317',
                accent: '#1a73e8',
                'brand-yellow': '#e5e5e5', // neutral-200
                'brand-orange': '#171717', // neutral-900 (Primary Black)
                'brand-green': '#737373',  // neutral-500 (Gray)
            },
            borderRadius: {
                '3xl': '36px',
                '4xl': '48px',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            keyframes: {
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-down': {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'pop': {
                    '0%': { transform: 'scale(0.95)' },
                    '40%': { transform: 'scale(1.02)' },
                    '100%': { transform: 'scale(1)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(2deg)' },
                },
                'float-slow': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-30px) rotate(8deg)' },
                },
                'float-reverse': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(30px) rotate(-8deg)' },
                },
                'dramatic-slide-up': {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'dramatic-slide-in-right': {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'slide-out-down': {
                    '0%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(100%)', opacity: '0' },
                },
            },
            animation: {
                'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-down': 'slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'pop': 'pop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fade-in 0.4s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'float-slow': 'float-slow 8s ease-in-out infinite',
                'float-reverse': 'float-reverse 9s ease-in-out infinite',
                'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                'dramatic-slide-up': 'dramatic-slide-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                'dramatic-slide-in-right': 'dramatic-slide-in-right 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                'slide-out-down': 'slide-out-down 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            }
        },
    },
    plugins: [],
}
