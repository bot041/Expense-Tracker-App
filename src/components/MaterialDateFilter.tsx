import React from 'react'
import { Group, SegmentedControl, Button, ActionIcon, Tooltip, Text } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react'
import dayjs from 'dayjs'
import type { ExpenseRange } from '../types'

// Normalize date to start of day
const normalizeDate = (date: Date) =>
  dayjs(date).startOf('day').toDate()

interface MaterialDateFilterProps {
  range: ExpenseRange
  activeDate: Date | null
  onRangeChange: (range: ExpenseRange) => void
  onDateChange: (date: Date | null) => void
  disabled?: boolean
}

export function MaterialDateFilter({
  range,
  activeDate,
  onRangeChange,
  onDateChange,
  disabled = false
}: MaterialDateFilterProps) {
  const navigateDate = (direction: 'prev' | 'next') => {
    if (!activeDate || disabled) return

    const updatedDate =
      direction === 'prev'
        ? dayjs(activeDate).subtract(1, 'day')
        : dayjs(activeDate).add(1, 'day')

    onDateChange(updatedDate.startOf('day').toDate())
  }

  const getDateLabel = () => {
    if (!activeDate) return 'Select date'

    // Single source of truth for today's date
    const today = dayjs().startOf('day')
    const selectedDate = dayjs(activeDate).startOf('day')
    
    // Calculate days difference using epoch time for consistency
    const daysBetween = Math.round((selectedDate.valueOf() - today.valueOf()) / (24 * 60 * 60 * 1000))

    // Handle special cases
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
    return selectedDate.format('dddd')
  }

  return (
    <div style={{
      padding: 'var(--md-space-md)',
      backgroundColor: 'var(--md-sys-color-surface)',
      borderRadius: 'var(--md-radius-lg)',
      border: '1px solid var(--md-sys-color-outline-variant)',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Range Selector */}
      <div style={{
        marginBottom: 'var(--md-space-md)',
        width: '100%'
      }}>
        <SegmentedControl
          value={range}
          onChange={(v) => onRangeChange(v as ExpenseRange)}
          data={[
            { label: 'Day', value: 'day' },
            { label: 'Month', value: 'month' },
            { label: 'Year', value: 'year' },
          ]}
          size="md"
          radius="md"
          fullWidth
          disabled={disabled}
          styles={{
            root: {
              width: '100%'
            }
          }}
        />
      </div>

      {/* Date Navigation Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--md-space-sm)',
        width: '100%'
      }}>
        {/* Previous Button */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => navigateDate('prev')}
          disabled={disabled || !activeDate}
          style={{
            color: 'var(--md-sys-color-on-surface-variant)',
            width: '48px',
            height: '48px',
            flexShrink: 0
          }}
        >
          <IconChevronLeft size={20} />
        </ActionIcon>

        {/* Date Input */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--md-space-xs)'
        }}>
          <DatePickerInput
            value={activeDate}
            onChange={(date: any) => {
              if (date) onDateChange(normalizeDate(date))
            }}
            disabled={disabled}
            clearable={false}
            size="md"
            radius="md"
            firstDayOfWeek={0}
            styles={{
              input: {
                width: '100%',
                maxWidth: '240px'
              }
            }}
            popoverProps={{
              withinPortal: true,
              position: 'bottom',
              offset: 8
            }}
            valueFormat="YYYY-MM-DD"
          />
          <Text
            size="sm"
            c="var(--md-sys-color-on-surface-variant)"
            fw={500}
            style={{ textAlign: 'center' }}
          >
            {getDateLabel()}
          </Text>
        </div>

        {/* Next Button */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => navigateDate('next')}
          disabled={disabled || !activeDate}
          style={{
            color: 'var(--md-sys-color-on-surface-variant)',
            width: '48px',
            height: '48px',
            flexShrink: 0
          }}
        >
          <IconChevronRight size={20} />
        </ActionIcon>
      </div>

      {/* Today Button */}
      <div style={{
        marginTop: 'var(--md-space-md)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Button
          variant="outline"
          size="md"
          leftSection={<IconCalendar size={16} />}
          onClick={() => onDateChange(normalizeDate(new Date()))}
          disabled={disabled}
          style={{
            color: '#3b82f6',
            borderColor: '#3b82f6',
            fontWeight: 500,
            height: '48px',
            paddingHorizontal: 'var(--md-space-lg)'
          }}
        >
          Today
        </Button>
      </div>
    </div>
  )
}
