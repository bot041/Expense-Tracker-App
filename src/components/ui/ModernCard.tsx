import React from 'react'
import { Card, Group, Text, Title, Badge } from '@mantine/core'
import type { CardProps } from '@mantine/core'
import { cn } from './utils'

interface ModernCardProps extends Omit<CardProps, 'children'> {
  title?: string
  subtitle?: string
  value?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
  variant?: 'default' | 'metric' | 'chart'
  className?: string
}

export function ModernCard({
  title,
  subtitle,
  value,
  icon,
  badge,
  footer,
  children,
  variant = 'default',
  className,
  ...props
}: ModernCardProps) {
  if (variant === 'metric') {
    return (
      <Card
        className={className}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #f0f0f0',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          padding: '24px',
          paddingBottom: '28px',
          transition: 'all 0.2s ease',
        }}
        {...props}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#6b7280'
          }}>
            {icon && (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {icon}
              </div>
            )}
            <div>
              <Text size="sm" style={{ color: '#6b7280', fontWeight: 500, lineHeight: '20px' }}>
                {title}
              </Text>
              {subtitle && (
                <Text size="xs" style={{ color: '#9ca3af', marginTop: '2px' }}>
                  {subtitle}
                </Text>
              )}
            </div>
          </div>
          {badge}
        </div>

        <div style={{ marginBottom: footer ? '12px' : '0' }}>
          <Text
            style={{
              color: '#111827',
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: '34px',
              letterSpacing: '-0.02em',
              fontFamily: 'inherit',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {value}
          </Text>
        </div>

        {footer && (
          <div style={{ marginTop: '20px', padding: '0 4px' }}>
            {footer}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card
      className={className}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #f0f0f0',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        padding: '24px',
        transition: 'all 0.2s ease',
      }}
      {...props}
    >
      {(title || icon) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {icon}
              </div>
            )}
            {title && (
              <Title
                order={3}
                style={{
                  color: '#111827',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '24px'
                }}
              >
                {title}
              </Title>
            )}
          </div>
          {badge}
        </div>
      )}

      {children}

      {footer && (
        <div style={{ marginTop: '20px' }}>
          {footer}
        </div>
      )}
    </Card>
  )
}
