/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // design tokens mapped to CSS variables defined in src/index.css
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        destructive: 'hsl(var(--destructive))',
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // brand / provider colors
        'tmobile-pink': 'hsl(var(--tmobile-pink))',
        'tmobile-magenta': 'hsl(var(--tmobile-magenta))',
        'verizon-red': 'hsl(var(--verizon-red))',
        'att-blue': 'hsl(var(--att-blue))',
        // status colors
        critical: 'hsl(var(--critical))',
        warning: 'hsl(var(--warning))',
        moderate: 'hsl(var(--moderate))',
      },
      borderRadius: {
        lg: '0.75rem',
      },
    },
  },
  plugins: [],
}

