import type { MantineTheme } from '@mantine/core'

export const materialTheme: Partial<MantineTheme> = {
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontFamilyMonospace: 'Roboto Mono, Consolas, Monaco, monospace',
  headings: {
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    fontWeight: '500',
    textWrap: 'balance',
    sizes: {
      h1: { fontSize: '57px', fontWeight: '400', lineHeight: '64px' },
      h2: { fontSize: '45px', fontWeight: '400', lineHeight: '52px' },
      h3: { fontSize: '36px', fontWeight: '400', lineHeight: '44px' },
      h4: { fontSize: '24px', fontWeight: '400', lineHeight: '32px' },
      h5: { fontSize: '20px', fontWeight: '500', lineHeight: '28px' },
      h6: { fontSize: '16px', fontWeight: '500', lineHeight: '24px' },
    },
  },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadows: {
    xs: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
  },
  components: {
    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: false,
        p: 'md',
      },
      styles: {
        root: {
          backgroundColor: 'var(--md-sys-color-surface)',
          borderRadius: 'var(--md-radius-lg)',
          transition: 'all 0.2s ease',
          border: '1px solid var(--md-sys-color-outline-variant)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: '500',
          textTransform: 'none',
          transition: 'all 0.2s ease',
        },
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          minHeight: '56px',
          fontSize: '16px',
        },
        label: {
          fontWeight: '500',
          marginBottom: '8px',
        },
      },
    },
    Select: {
      defaultProps: {
        size: 'md',
        radius: 'md',
      },
      styles: {
        input: {
          minHeight: '56px',
          fontSize: '16px',
        },
        label: {
          fontWeight: '500',
          marginBottom: '8px',
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        size: 'md',
      },
      styles: {
        content: {
          borderRadius: 'var(--md-radius-xl)',
        },
      },
    },
  },
}

export const materialColors = {
  primary: '#4caf50',
  primaryContainer: '#e8f5e9',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#1b5e20',
  surface: '#ffffff',
  surfaceVariant: '#f5f5f5',
  onSurface: '#1c1b1f',
  onSurfaceVariant: '#49454f',
  background: '#fefefe',
  onBackground: '#1c1b1f',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#410002',
  outline: '#79747e',
  shadow: 'rgba(0, 0, 0, 0.12)',
}
