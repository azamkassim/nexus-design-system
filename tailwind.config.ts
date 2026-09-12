import type { Config } from 'tailwindcss'
import tokens from './tokens/design-tokens.json'

const colors = {
  // Primary: Deep Navy
  'navy': {
    '950': tokens.color.navy['950'],
    '900': tokens.color.navy['900'],
    '800': tokens.color.navy['800'],
    '700': tokens.color.navy['700'],
  },
  // Neutral: Graphite
  'graphite': {
    '950': tokens.color.graphite['950'],
    '900': tokens.color.graphite['900'],
    '700': tokens.color.graphite['700'],
    '500': tokens.color.graphite['500'],
    '300': tokens.color.graphite['300'],
    '100': tokens.color.graphite['100'],
  },
  // White
  'white': tokens.color.white,
  // Status Colors (restrained)
  'success': tokens.color.status.success,
  'warning': tokens.color.status.warning,
  'error': tokens.color.status.error,
  'info': tokens.color.status.info,
}

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './stories/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors,
      fontSize: {
        'xs': tokens.typography.size.xs,
        'sm': tokens.typography.size.sm,
        'base': tokens.typography.size.base,
        'lg': tokens.typography.size.lg,
        'xl': tokens.typography.size.xl,
        '2xl': tokens.typography.size['2xl'],
      },
      fontWeight: {
        'regular': tokens.typography.weight.regular,
        'medium': tokens.typography.weight.medium,
        'semibold': tokens.typography.weight.semibold,
        'bold': tokens.typography.weight.bold,
      },
      spacing: {
        'xs': tokens.spacing.xs,
        'sm': tokens.spacing.sm,
        'md': tokens.spacing.md,
        'lg': tokens.spacing.lg,
        'xl': tokens.spacing.xl,
        '2xl': tokens.spacing['2xl'],
      },
      borderRadius: {
        'none': tokens.border.radius.none,
        'sm': tokens.border.radius.sm,
        'md': tokens.border.radius.md,
        'lg': tokens.border.radius.lg,
      },
      boxShadow: {
        'sm': tokens.shadow.sm,
        'md': tokens.shadow.md,
        'lg': tokens.shadow.lg,
        'xl': tokens.shadow.xl,
      },
    },
  },
  plugins: [],
}

export default config
