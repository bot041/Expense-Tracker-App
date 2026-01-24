import React from 'react'
import { Card, Group, Text, Title } from '@mantine/core'
import type { CardProps } from '@mantine/core'

interface MaterialCardProps extends Omit<CardProps, 'children'> {
  title?: string
  subtitle?: string
  value?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
  variant?: 'default' | 'metric' | 'chart'
}

export function MaterialCard({
  title,
  subtitle,
  value,
  icon,
  badge,
  footer,
  children,
  variant = 'default',
  ...props
}: MaterialCardProps) {
  if (variant === 'metric') {
    return (
      <Card
        p="lg"
        radius="lg"
        shadow="sm"
        withBorder={false}
        {...props}
        style={{
          background: 'var(--md-sys-color-surface)',
          border: '1px solid var(--md-sys-color-outline-variant)',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          overflow: 'hidden',
          minHeight: '160px',
          width: '100%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          ...props.style,
        }}
      >
        <Group justify="space-between" mb="md" align="flex-start">
          {icon && (
            <div style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--md-sys-color-primary-container)',
              borderRadius: 'var(--md-radius-md)',
              color: 'var(--md-sys-color-on-primary-container)',
              flexShrink: 0
            }}>
              {icon}
            </div>
          )}
          {badge && (
            <div style={{ flexShrink: 0 }}>
              {badge}
            </div>
          )}
        </Group>

        <Text
          size="xs"
          c="var(--md-sys-color-on-surface-variant)"
          fw={500}
          tt="uppercase"
          mb="xs"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '16px'
          }}
        >
          {title}
        </Text>

        {value && (
          <Title
            order={2}
            c="var(--md-sys-color-on-surface)"
            style={{
              fontSize: '28px',
              fontWeight: 400,
              lineHeight: '36px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {value}
          </Title>
        )}

        {subtitle && (
          <Text
            size="sm"
            c="var(--md-sys-color-on-surface-variant)"
            mt="xs"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: '20px'
            }}
          >
            {subtitle}
          </Text>
        )}

        {footer && (
          <div style={{ marginTop: 'var(--md-space-md)' }}>
            {footer}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card
      p="lg"
      radius="lg"
      shadow="sm"
      withBorder={false}
      {...props}
      style={{
        background: 'var(--md-sys-color-surface)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        overflow: 'hidden',
        width: '100%',
        ...props.style,
      }}
    >
      {title && (
        <Title
          order={4}
          c="var(--md-sys-color-on-surface)"
          mb="md"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '24px'
          }}
        >
          {title}
        </Title>
      )}

      {children}
    </Card>
  )
}
