import React from 'react'
import { Group, Text, Badge, ActionIcon, Button } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import type { Expense } from '../types'
import { cn } from '../components/ui/utils'

interface MaterialListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string | undefined) => void
  currencySymbol: Record<string, string>
  isLoading?: boolean
  className?: string
}

// Helper function to get date label for transaction
const getTransactionDateLabel = (dateStr: string): string => {
  try {
    // Single source of truth for today's date
    const today = dayjs().startOf('day')
    const expenseDate = dayjs(dateStr).startOf('day')
    
    // Calculate days difference using epoch time for consistency
    const daysBetween = Math.round((expenseDate.valueOf() - today.valueOf()) / (24 * 60 * 60 * 1000))

    if (daysBetween === -1) {
      return 'Yesterday'
    }
    if (daysBetween === 0) {
      return 'Today'
    }
    if (daysBetween === 1) {
      return 'Tomorrow'
    }

    // For all other dates, show weekday name only
    return expenseDate.format('dddd')
  } catch {
    return ''
  }
}

// Category colors matching Figma design
const categoryColors: Record<string, { bg: string; color: string }> = {
  'Food': { bg: '#fef3c7', color: '#d97706' },
  'Transport': { bg: '#dbeafe', color: '#2563eb' },
  'Shopping': { bg: '#fce7f3', color: '#db2777' },
  'Entertainment': { bg: '#f3e8ff', color: '#9333ea' },
  'Bills': { bg: '#fee2e2', color: '#dc2626' },
  'Health': { bg: '#d1fae5', color: '#059669' },
  'Other': { bg: '#f3f4f6', color: '#6b7280' }
}

export function MaterialList({
  expenses,
  onEdit,
  onDelete,
  currencySymbol,
  isLoading = false,
  className
}: MaterialListProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {[...Array(3)].map((_, index) => (
          <div key={index} style={{
            backgroundColor: '#ffffff',
            border: '1px solid #f0f0f0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#f3f4f6',
                animation: 'pulse 2s infinite'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  height: '16px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  width: '60%'
                }} />
                <div style={{
                  height: '12px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  width: '40%'
                }} />
              </div>
              <div style={{
                height: '20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                width: '80px'
              }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {expenses.map((expense) => {
        const categoryColor = categoryColors[expense.category] || categoryColors['Other']

        return (
          <div
            key={expense.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #f0f0f0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Category Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: categoryColor.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Text
                  size="sm"
                  fw={600}
                  style={{ color: categoryColor.color }}
                >
                  {expense.category?.charAt(0).toUpperCase()}
                </Text>
              </div>

              {/* Transaction Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{
                    color: '#111827',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {expense.title}
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                    <Text
                      size="xs"
                      style={{
                        color: '#6b7280'
                      }}
                    >
                      {expense.date && new Date(expense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        color: '#9ca3af',
                        fontSize: '11px'
                      }}
                    >
                      {getTransactionDateLabel(expense.date)}
                    </Text>
                  </div>
                  <Text
                    size="xs"
                    style={{
                      backgroundColor: categoryColor.bg,
                      color: categoryColor.color,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 500
                    }}
                  >
                    {expense.category}
                  </Text>
                </div>
              </div>

              {/* Amount */}
              <Text
                size="sm"
                fw={600}
                style={{
                  color: '#dc2626',
                  fontSize: '16px',
                  flexShrink: 0
                }}
              >
                -{currencySymbol[expense.currency || 'INR']}{Math.abs(isFinite(expense.amount) ? expense.amount : 0).toFixed(2)}
              </Text>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onEdit(expense)}
                  title="Edit"
                  style={{ color: '#3b82f6' }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  size="sm"
                  color="red"
                  onClick={() => onDelete(expense.id)}
                  title="Delete"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
