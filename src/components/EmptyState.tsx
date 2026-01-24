import React from 'react'
import { Group, Text, Title } from '@mantine/core'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={className} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 200,
      padding: 'var(--md-space-xl)',
      textAlign: 'center'
    }}>
      {icon && (
        <div style={{ marginBottom: 'var(--md-space-md)' }}>
          {icon}
        </div>
      )}
      
      <Title order={3} c="var(--md-sys-color-on-surface-variant)" mb="md">
        {title}
      </Title>
      
      <Text c="var(--md-sys-color-on-surface-variant)" mb="lg" style={{ textAlign: 'center' }}>
        {description}
      </Text>
      
      {action && (
        <div style={{ marginTop: 'var(--md-space-lg)' }}>
          {action}
        </div>
      )}
    </div>
  )
}
