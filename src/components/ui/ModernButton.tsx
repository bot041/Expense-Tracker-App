import React from 'react'
import { Button as MantineButton } from '@mantine/core'
import type { ButtonProps } from '@mantine/core'
import { cn } from './utils'

interface ModernButtonProps extends Omit<ButtonProps, 'className' | 'variant' | 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function ModernButton({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}: ModernButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary)',
          border: 'none'
        }
      case 'destructive':
        return {
          backgroundColor: 'var(--md-sys-color-error)',
          color: 'var(--md-sys-color-on-error)',
          border: 'none'
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--md-sys-color-primary)',
          borderColor: 'var(--md-sys-color-outline)'
        }
      case 'secondary':
        return {
          backgroundColor: 'var(--md-sys-color-secondary)',
          color: 'var(--md-sys-color-on-secondary)'
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--md-sys-color-on-surface-variant)'
        }
      case 'link':
        return {
          backgroundColor: 'transparent',
          color: 'var(--md-sys-color-primary)',
          textDecoration: 'underline'
        }
      default:
        return {}
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: '36px',
          fontSize: '14px',
          padding: '0 12px'
        }
      case 'lg':
        return {
          height: '48px',
          fontSize: '16px',
          padding: '0 24px'
        }
      case 'icon':
        return {
          width: '48px',
          height: '48px',
          padding: '0'
        }
      default:
        return {
          height: '40px',
          fontSize: '14px',
          padding: '0 16px'
        }
    }
  }

  return (
    <MantineButton
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        fontWeight: 500,
        textTransform: 'none',
        borderRadius: 'var(--md-radius-md)',
        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)'
      }}
    >
      {children}
    </MantineButton>
  )
}
