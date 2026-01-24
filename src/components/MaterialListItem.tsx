import React from 'react'
import { Group, Text, Badge, ActionIcon, Box } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import type { Expense } from '../types'

interface MaterialListItemProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  currencySymbol: Record<string, string>
}

export function MaterialListItem({ expense, onEdit, onDelete, currencySymbol }: MaterialListItemProps) {
  return (
    <Box
      p="md"
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface-variant)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--md-sys-color-surface)'
      }}
    >
      <Group justify="space-between" align="center" w="100%">
        <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
          {/* Icon/Avatar area */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--md-radius-md)',
              backgroundColor: 'var(--md-sys-color-primary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--md-sys-color-on-primary-container)',
              fontSize: '20px',
              fontWeight: 500
            }}
          >
            {expense.category.charAt(0).toUpperCase()}
          </div>
          
          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Group gap="xs" mb={4} style={{ flexWrap: 'nowrap' }}>
              <Text
                size="md"
                fw={500}
                c="var(--md-sys-color-on-surface)"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}
              >
                {expense.title}
              </Text>
              {expense.isTravel && (
                <Badge
                  size="xs"
                  variant="filled"
                  style={{
                    backgroundColor: 'var(--md-sys-color-tertiary-container)',
                    color: 'var(--md-sys-color-on-tertiary-container)'
                  }}
                >
                  Travel
                </Badge>
              )}
            </Group>
            
            <Group gap="sm">
              <Badge
                size="sm"
                variant="outline"
                style={{
                  borderColor: 'var(--md-sys-color-outline)',
                  color: 'var(--md-sys-color-on-surface-variant)'
                }}
              >
                {expense.category}
              </Badge>
              <Text
                size="sm"
                c="var(--md-sys-color-on-surface-variant)"
              >
                {new Date(expense.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </Group>
          </div>
        </Group>
        
        {/* Amount and actions */}
        <Group gap="md" align="center">
          <Text
            size="lg"
            fw={600}
            c="var(--md-sys-color-primary)"
            style={{
              textAlign: 'right',
              minWidth: '80px'
            }}
          >
            {currencySymbol[expense.currency] ?? expense.currency} {isFinite(expense.amount) ? expense.amount : 0}
          </Text>
          
          <Group gap="xs">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => onEdit(expense)}
              style={{
                color: 'var(--md-sys-color-on-surface-variant)'
              }}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => onDelete(expense.id)}
              style={{
                color: 'var(--md-sys-color-error)'
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Group>
    </Box>
  )
}

interface MaterialListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  currencySymbol: Record<string, string>
  isLoading?: boolean
}

export function MaterialList({ expenses, onEdit, onDelete, currencySymbol, isLoading = false }: MaterialListProps) {
  if (isLoading) {
    return (
      <Box style={{ backgroundColor: 'var(--md-sys-color-surface)', borderRadius: 'var(--md-radius-lg)' }}>
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            p="md"
            style={{
              borderBottom: i < 2 ? '1px solid var(--md-sys-color-outline-variant)' : 'none'
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap="md">
                <Box
                  w={40}
                  h={40}
                  style={{
                    borderRadius: 'var(--md-radius-md)',
                    backgroundColor: 'var(--md-sys-color-surface-variant)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Box h={20} w="60%" mb={4} style={{ backgroundColor: 'var(--md-sys-color-surface-variant)', borderRadius: '4px' }} />
                  <Box h={16} w="40%" style={{ backgroundColor: 'var(--md-sys-color-surface-variant)', borderRadius: '4px' }} />
                </div>
              </Group>
              <Box h={24} w={80} style={{ backgroundColor: 'var(--md-sys-color-surface-variant)', borderRadius: '4px' }} />
            </Group>
          </Box>
        ))}
      </Box>
    )
  }

  if (expenses.length === 0) {
    return (
      <Box
        p="xl"
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderRadius: 'var(--md-radius-lg)',
          textAlign: 'center',
          border: '1px solid var(--md-sys-color-outline-variant)'
        }}
      >
        <Text
          size="lg"
          fw={500}
          c="var(--md-sys-color-on-surface-variant)"
          mb="sm"
        >
          No Transactions
        </Text>
        <Text
          size="sm"
          c="var(--md-sys-color-on-surface-variant)"
        >
          You haven't recorded any expenses for this selected period.
        </Text>
      </Box>
    )
  }

  return (
    <Box style={{ backgroundColor: 'var(--md-sys-color-surface)', borderRadius: 'var(--md-radius-lg)' }}>
      {expenses.map((expense, index) => (
        <MaterialListItem
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
          currencySymbol={currencySymbol}
        />
      ))}
    </Box>
  )
}
