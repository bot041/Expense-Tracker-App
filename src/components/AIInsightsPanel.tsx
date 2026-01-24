import React, { useMemo } from 'react'
import {
  Modal,
  Stack,
  Title,
  Text,
  Card,
  Group,
  Badge,
  Progress,
  SimpleGrid
} from '@mantine/core'
import {
  IconTrendingUp,
  IconAlertTriangle,
  IconPigMoney,
  IconChartBar,
  IconReceipt,
  IconCalendar,
  IconWallet
} from '@tabler/icons-react'
import type { Expense, Budget } from '../types'

// Safe number functions
const safeNumber = (num: any, fallback: number = 0): number => {
  if (typeof num !== 'number' || !isFinite(num) || isNaN(num)) return fallback
  if (Math.abs(num) > 999999) return fallback // Limit to 6 digits (999,999)
  return num
}

const safeAmount = (expense: any): number => {
  return safeNumber(expense?.amount, 0)
}

interface AIInsightsPanelProps {
  opened: boolean
  onClose: () => void
  expenses: Expense[]
  budgets: Budget[]
  isLoading?: boolean
}

export function AIInsightsPanel({
  opened,
  onClose,
  expenses,
  budgets,
  isLoading = false
}: AIInsightsPanelProps) {

  const analysis = useMemo(() => {
    const currentBudget = safeNumber(budgets[0]?.amount, 0)
    const totalSpent = expenses.reduce((sum, e) => sum + safeAmount(e), 0)
    const budgetUsedPercent = currentBudget > 0 ? safeNumber((totalSpent / currentBudget) * 100, 0) : 0
    const remaining = safeNumber(currentBudget - totalSpent, 0)

    // Calculate daily average and project end of month spending
    const today = new Date()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const dayOfMonth = today.getDate()
    const dailyAverage = dayOfMonth > 0 ? safeNumber(totalSpent / dayOfMonth, 0) : 0
    const projectedMonthEnd = safeNumber(dailyAverage * daysInMonth, 0)
    const projectedOvershoot = safeNumber(projectedMonthEnd - currentBudget, 0)

    return {
      currentBudget,
      totalSpent,
      budgetUsedPercent: Math.min(budgetUsedPercent, 100),
      remaining,
      dailyAverage,
      projectedMonthEnd,
      projectedOvershoot,
      isOverBudget: totalSpent > currentBudget,
      willExceedBudget: projectedMonthEnd > currentBudget,
      isUnderBudget: totalSpent < currentBudget * 0.7,
      potentialSavings: remaining > 0 ? remaining * 0.5 : 0,
      transactionCount: expenses.length
    }
  }, [expenses, budgets])

  // Category Analysis
  const categoryAnalysis = useMemo(() => {
    const categoryTotals: Record<string, number> = {}

    expenses.forEach(expense => {
      const category = expense.category || 'Other'
      const amount = safeAmount(expense)
      categoryTotals[category] = (categoryTotals[category] || 0) + amount
    })

    const sorted = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: analysis.totalSpent > 0 ? (amount / analysis.totalSpent) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5 categories

    return sorted
  }, [expenses, analysis.totalSpent])

  const getCategoryColor = (index: number) => {
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']
    return colors[index] || '#6b7280'
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="AI Budget Insights"
      size="md"
      centered
      styles={{
        content: {
          backgroundColor: '#ffffff'
        },
        title: {
          fontWeight: 600,
          fontSize: '18px'
        }
      }}
    >
      <Stack gap="lg">

        {/* Summary Stats Cards */}
        <SimpleGrid cols={3} spacing="sm">
          <Card
            p="sm"
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <IconWallet size={20} color="#3b82f6" style={{ margin: '0 auto 4px' }} />
            <Text size="xs" c="#64748b">Total Spent</Text>
            <Text size="sm" fw={700} c="#1e40af">
              ₹{analysis.totalSpent.toFixed(0)}
            </Text>
          </Card>

          <Card
            p="sm"
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <IconCalendar size={20} color="#22c55e" style={{ margin: '0 auto 4px' }} />
            <Text size="xs" c="#64748b">Daily Avg</Text>
            <Text size="sm" fw={700} c="#166534">
              ₹{analysis.dailyAverage.toFixed(0)}
            </Text>
          </Card>

          <Card
            p="sm"
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <IconReceipt size={20} color="#f59e0b" style={{ margin: '0 auto 4px' }} />
            <Text size="xs" c="#64748b">Transactions</Text>
            <Text size="sm" fw={700} c="#92400e">
              {analysis.transactionCount}
            </Text>
          </Card>
        </SimpleGrid>

        {/* 1. Budget Prediction */}
        <Card
          p="lg"
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px'
          }}
        >
          <Group gap="md" align="flex-start">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconChartBar size={24} color="white" />
            </div>

            <div style={{ flex: 1 }}>
              <Group gap="xs" mb="xs">
                <Text size="sm" fw={700} c="#1e40af">
                  📊 Budget Prediction
                </Text>
                <Badge size="xs" color="blue" variant="light">
                  AI
                </Badge>
              </Group>

              <Text size="sm" c="#1e3a8a" mb="sm">
                Based on your spending pattern, you are projected to spend{' '}
                <Text span fw={700} c="#3b82f6">
                  ₹{analysis.projectedMonthEnd.toFixed(0)}
                </Text>{' '}
                by end of this month.
              </Text>

              <Progress
                value={analysis.budgetUsedPercent}
                size="md"
                color={analysis.budgetUsedPercent > 90 ? 'red' : analysis.budgetUsedPercent > 70 ? 'yellow' : 'blue'}
                style={{ backgroundColor: '#dbeafe' }}
              />
              <Text size="xs" c="#64748b" mt="xs">
                {analysis.budgetUsedPercent.toFixed(0)}% of ₹{analysis.currentBudget} budget used
              </Text>
            </div>
          </Group>
        </Card>

        {/* 2. Budget Warning (if overspending) */}
        {(analysis.isOverBudget || analysis.willExceedBudget) && (
          <Card
            p="lg"
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px'
            }}
          >
            <Group gap="md" align="flex-start">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconAlertTriangle size={24} color="white" />
              </div>

              <div style={{ flex: 1 }}>
                <Group gap="xs" mb="xs">
                  <Text size="sm" fw={700} c="#991b1b">
                    ⚠️ Budget Warning
                  </Text>
                  <Badge size="xs" color="red" variant="light">
                    ALERT
                  </Badge>
                </Group>

                {analysis.isOverBudget ? (
                  <Text size="sm" c="#7f1d1d">
                    You have <Text span fw={700} c="#ef4444">exceeded your budget</Text> by{' '}
                    <Text span fw={700} c="#ef4444">
                      ₹{Math.abs(analysis.remaining).toFixed(0)}
                    </Text>
                    . Consider reducing expenses immediately.
                  </Text>
                ) : (
                  <Text size="sm" c="#7f1d1d">
                    At your current pace, you will exceed your budget by{' '}
                    <Text span fw={700} c="#ef4444">
                      ₹{analysis.projectedOvershoot.toFixed(0)}
                    </Text>{' '}
                    this month. Try to reduce daily spending by{' '}
                    <Text span fw={700}>
                      ₹{(analysis.projectedOvershoot / 15).toFixed(0)}/day
                    </Text>.
                  </Text>
                )}
              </div>
            </Group>
          </Card>
        )}

        {/* 3. Savings Suggestion (if underspending) */}
        {analysis.isUnderBudget && !analysis.isOverBudget && (
          <Card
            p="lg"
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px'
            }}
          >
            <Group gap="md" align="flex-start">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconPigMoney size={24} color="white" />
              </div>

              <div style={{ flex: 1 }}>
                <Group gap="xs" mb="xs">
                  <Text size="sm" fw={700} c="#166534">
                    💰 Savings Opportunity
                  </Text>
                  <Badge size="xs" color="green" variant="light">
                    GOOD
                  </Badge>
                </Group>

                <Text size="sm" c="#14532d">
                  Great job! You're spending less than expected. You could save up to{' '}
                  <Text span fw={700} c="#22c55e">
                    ₹{analysis.potentialSavings.toFixed(0)}
                  </Text>{' '}
                  this month! Consider transferring this to your savings account.
                </Text>

                <Text size="xs" c="#64748b" mt="sm">
                  Remaining budget: ₹{analysis.remaining.toFixed(0)}
                </Text>
              </div>
            </Group>
          </Card>
        )}

        {/* On Track Message */}
        {!analysis.isOverBudget && !analysis.willExceedBudget && !analysis.isUnderBudget && (
          <Card
            p="lg"
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '12px'
            }}
          >
            <Group gap="md" align="flex-start">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconTrendingUp size={24} color="white" />
              </div>

              <div style={{ flex: 1 }}>
                <Text size="sm" fw={700} c="#92400e" mb="xs">
                  📈 On Track
                </Text>
                <Text size="sm" c="#78350f">
                  Your spending is within a normal range. Keep monitoring to stay on budget!
                </Text>
              </div>
            </Group>
          </Card>
        )}

        {/* 5. Category Analysis */}
        {categoryAnalysis.length > 0 && (
          <Card
            p="lg"
            style={{
              backgroundColor: '#faf5ff',
              border: '1px solid #e9d5ff',
              borderRadius: '12px'
            }}
          >
            <Text size="sm" fw={700} c="#6b21a8" mb="md">
              📂 Spending by Category
            </Text>

            <Stack gap="sm">
              {categoryAnalysis.map((category, index) => (
                <div key={category.name}>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" fw={500} c="#374151">
                      {category.name}
                    </Text>
                    <Text size="xs" fw={600} c="#6b7280">
                      ₹{safeNumber(category.amount, 0).toFixed(0)} ({safeNumber(category.percent, 0).toFixed(0)}%)
                    </Text>
                  </Group>
                  <Progress
                    value={category.percent}
                    size="sm"
                    color={getCategoryColor(index)}
                    style={{ backgroundColor: '#e5e7eb' }}
                  />
                </div>
              ))}
            </Stack>

            {categoryAnalysis.length > 0 && (
              <Text size="xs" c="#64748b" mt="md">
                💡 Top category: <Text span fw={600}>{categoryAnalysis[0]?.name}</Text> - Consider reducing if overspending.
              </Text>
            )}
          </Card>
        )}

        {/* No Budget Set */}
        {analysis.currentBudget === 0 && (
          <Card
            p="lg"
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              textAlign: 'center'
            }}
          >
            <Text size="sm" c="#6b7280">
              Set a monthly budget to get AI-powered predictions and savings suggestions.
            </Text>
          </Card>
        )}

      </Stack>
    </Modal>
  )
}
