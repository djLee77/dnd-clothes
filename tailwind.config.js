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
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
            animation: {
                'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-down': 'slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'pop': 'pop 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fade-in 0.4s ease-out',
                'float': 'float 6s ease-in-out infinite',
            }
        },
    },
    plugins: [],
}
