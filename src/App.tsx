import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  AppShell,
  Title,
  Text,
  Button,
  ActionIcon,
  Group,
  Stack,
  NumberFormatter,
  Progress,
  Modal,
  TextInput,
  Select,
  NumberInput,
  Switch,
  Badge,
  Alert,
  Divider,
  MantineProvider,
  createTheme,
  useMantineColorScheme
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconPlus,
  IconHome,
  IconReceipt,
  IconChartBar,
  IconSettings,
  IconTrendingUp,
  IconTrendingDown,
  IconPigMoney,
  IconCategory,
  IconCalendar,
  IconCash,
  IconCreditCard,
  IconDeviceMobile,
  IconX,
  IconEdit,
  IconCheck,
  IconChevronRight,
  IconDownload,
  IconCloud,
  IconBell,
  IconMoon,
  IconHelp,
  IconShield,
  IconInfoCircle,
  IconTrash,
  IconWand,
  IconUpload,
  IconAlertTriangle
} from '@tabler/icons-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import dayjs from 'dayjs'

import type { Expense, Budget, ExpenseRange } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { ModernCard } from './components/ui/ModernCard'
import { MaterialList } from './components/MaterialList'
import { MaterialDateFilter } from './components/MaterialDateFilter'
import { AIInsightsPanel } from './components/AIInsightsPanel'

// Currency symbol
const currencySymbol = { INR: '₹', USD: '$', EUR: '€' }

// Currency labels
const currencyLabels = { INR: 'INR (₹)', USD: 'USD ($)', EUR: 'EUR (€)' }

// Categories with colors
const CATEGORIES = [
  { value: 'Food', label: 'Food', icon: '🍔', color: '#ef4444' },
  { value: 'Transport', label: 'Transport', icon: '🚗', color: '#3b82f6' },
  { value: 'Shopping', label: 'Shopping', icon: '🛍️', color: '#8b5cf6' },
  { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#f59e0b' },
  { value: 'Bills', label: 'Bills', icon: '📄', color: '#6b7280' },
  { value: 'Health', label: 'Health', icon: '❤️', color: '#ec4899' },
  { value: 'Education', label: 'Education', icon: '📚', color: '#14b8a6' },
  { value: 'Other', label: 'Other', icon: '📦', color: '#64748b' }
]

type TabType = 'home' | 'transactions' | 'analytics' | 'settings'
type Range = ExpenseRange

// Helper functions
const normalizeDate = (date: Date) =>
  dayjs(date).startOf('day').toDate()

const toSafeISO = (d: Date | null | undefined): string => {
  if (!d || isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
  return d.toISOString().split('T')[0]
}

const safeNumber = (num: any, fallback: number = 0): number => {
  if (typeof num !== 'number' || !isFinite(num) || isNaN(num)) return fallback
  if (Math.abs(num) > 999999) return fallback // Limit to 6 digits (999,999)
  return num
}

const safeAmount = (expense: any): number => {
  return safeNumber(expense?.amount, 0)
}

export default function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('home')

  // Data state
  const [range, setRange] = useState<Range>('month')
  const [activeDate, setActiveDate] = useState<Date | null>(normalizeDate(new Date()))
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', [])
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', [{ id: '1', name: 'Monthly', amount: 15000, currency: 'INR', period: 'monthly', start: new Date().toISOString(), streakDays: 0 }])

  // Modal states
  const [addOpen, setAddOpen] = useState(false)
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)

  // Settings screens state
  const [profileOpen, setProfileOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  // Settings data state
  const [selectedCurrency, setSelectedCurrency] = useState('INR')
  const [selectedTheme, setSelectedTheme] = useState('system')
  const [profileData, setProfileData] = useState({
    name: 'Bhuvan',
    email: 'bhuvan@example.com',
    avatar: ''
  })
  const [customCategories, setCustomCategories] = useState(CATEGORIES)

  // Additional state for functionality
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  const [lastBackup, setLastBackup] = useState('2 days ago')
  const [feedbackText, setFeedbackText] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')

  // Add expense form
  const [draft, setDraft] = useState<Partial<Expense>>({
    date: toSafeISO(normalizeDate(new Date())),
    amount: 0,
    currency: 'INR',
    category: 'Food'
  })
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI'>('UPI')
  const [limitExceeded, setLimitExceeded] = useState(false)

  // Budget form state
  const [budgetDraft, setBudgetDraft] = useState<Partial<Budget>>({
    name: 'Monthly',
    amount: 15000,
    currency: 'INR',
    period: 'monthly'
  })

  // Budget handlers
  const handleSaveBudget = () => {
    if (!budgetDraft.amount || budgetDraft.amount <= 0) return
    
    const updatedBudget: Budget = {
      id: budgets[0]?.id || Date.now().toString(),
      name: budgetDraft.name || 'Monthly',
      amount: safeNumber(budgetDraft.amount, 0),
      currency: budgetDraft.currency || 'INR',
      period: budgetDraft.period || 'monthly',
      start: budgets[0]?.start || new Date().toISOString(),
      streakDays: budgets[0]?.streakDays || 0
    }

    setBudgets([updatedBudget])
    setBudgetOpen(false)
  }

  const handleOpenBudgetModal = () => {
    const currentBudget = budgets[0]
    setBudgetDraft({
      name: currentBudget?.name || 'Monthly',
      amount: currentBudget?.amount || 15000,
      currency: currentBudget?.currency || 'INR',
      period: currentBudget?.period || 'monthly'
    })
    setBudgetOpen(true)
  }

  // Helper functions
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, message, onConfirm })
  }

  const handleImageUpload = () => {
    // Simulate image upload
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setProfileData({ ...profileData, avatar: result })
          localStorage.setItem('userProfile', JSON.stringify({ ...profileData, avatar: result }))
          showToastMessage('Profile image updated')
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Title', 'Category', 'Amount', 'Currency'],
      ...expenses.map(e => [e.date, e.title, e.category, e.amount.toString(), e.currency])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToastMessage('CSV exported successfully')
  }

  const exportToPDF = () => {
    // Placeholder PDF export
    showToastMessage('PDF export started')
    setTimeout(() => showToastMessage('PDF exported successfully'), 1500)
  }

  const performBackup = () => {
    const backupData = {
      expenses,
      budgets,
      categories: customCategories,
      profile: profileData,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('appBackup', JSON.stringify(backupData))
    setLastBackup('Just now')
    showToastMessage('Backup completed successfully')
  }

  const restoreBackup = () => {
    const backupData = localStorage.getItem('appBackup')
    if (backupData) {
      const data = JSON.parse(backupData)
      setExpenses(data.expenses || [])
      setBudgets(data.budgets || [])
      setCustomCategories(data.categories || CATEGORIES)
      setProfileData(data.profile || { name: 'Bhuvan', email: 'bhuvan@example.com', avatar: '' })
      showToastMessage('Backup restored successfully')
    } else {
      showToastMessage('No backup found')
    }
  }

  // Initialize data from localStorage on app startup
  useEffect(() => {
    // Load profile data
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile))
      } catch (e) {
        console.error('Failed to load profile data')
      }
    }

    // Load currency preference
    const savedCurrency = localStorage.getItem('selectedCurrency')
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency)
    }

    // Load theme preference
    const savedTheme = localStorage.getItem('selectedTheme')
    if (savedTheme) {
      setSelectedTheme(savedTheme)
      // Apply theme
      if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light')
      }
    }

    // Load custom categories
    const savedCategories = localStorage.getItem('customCategories')
    if (savedCategories) {
      try {
        setCustomCategories(JSON.parse(savedCategories))
      } catch (e) {
        console.error('Failed to load custom categories')
      }
    }

    // Load last backup time
    const savedBackup = localStorage.getItem('appBackup')
    if (savedBackup) {
      try {
        const backup = JSON.parse(savedBackup)
        if (backup.timestamp) {
          const backupDate = new Date(backup.timestamp)
          const now = new Date()
          const diffMs = now.getTime() - backupDate.getTime()
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          
          if (diffDays === 0) {
            setLastBackup('Today')
          } else if (diffDays === 1) {
            setLastBackup('Yesterday')
          } else if (diffDays < 7) {
            setLastBackup(`${diffDays} days ago`)
          } else {
            setLastBackup(backupDate.toLocaleDateString())
          }
        }
      } catch (e) {
        console.error('Failed to load backup info')
      }
    }
  }, [])

  // Convert theme to Mantine colorScheme
  const getColorScheme = () => {
    if (selectedTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return selectedTheme as 'light' | 'dark'
  }

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (!activeDate) return expenses
    return expenses.filter((e) => {
      const expenseDate = dayjs(e.date)
      const target = dayjs(activeDate)
      switch (range) {
        case 'day': return expenseDate.isSame(target, 'day')
        case 'month': return expenseDate.isSame(target, 'month')
        case 'year': return expenseDate.isSame(target, 'year')
        default: return true
      }
    })
  }, [expenses, activeDate, range])

  // Calculations
  const total = useMemo(() => {
    const sum = filteredExpenses.reduce((s, e) => s + safeAmount(e), 0)
    return safeNumber(sum, 0)
  }, [filteredExpenses])
  
  const activeBudget = budgets[0] // Use first budget
  const budgetAmount = safeNumber(activeBudget?.amount, 0)
  const budgetProgress = budgetAmount > 0 ? Math.min(safeNumber((total / budgetAmount) * 100, 0), 100) : 0
  const remaining = safeNumber(budgetAmount - total, 0)

  const dailyAvg = useMemo(() => {
    const days = range === 'day' ? 1 : range === 'month' ? dayjs(activeDate).daysInMonth() : 365
    return safeNumber(total / Math.max(days, 1), 0)
  }, [total, range, activeDate])

  const topCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    filteredExpenses.forEach(e => {
      const amount = safeAmount(e)
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amount
    })
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
    return sorted[0]?.[0] || 'N/A'
  }, [filteredExpenses])

  // Chart data
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {}
    filteredExpenses.forEach(e => {
      const key = dayjs(e.date).format('MMM DD')
      const amount = safeAmount(e)
      grouped[key] = (grouped[key] || 0) + amount
    })
    return Object.entries(grouped).map(([date, amount]) => ({ date, amount: safeNumber(amount, 0) }))
  }, [filteredExpenses])

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    filteredExpenses.forEach(e => {
      const amount = safeAmount(e)
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amount
    })
    return Object.entries(categoryTotals).map(([name, value]) => {
      const cat = CATEGORIES.find(c => c.value === name)
      return { name, value: safeNumber(value, 0), color: cat?.color || '#6b7280' }
    }).sort((a, b) => b.value - a.value)
  }, [filteredExpenses])

  // Handlers
  const MAX_EXPENSE_AMOUNT = 1000000 // ₹10 lakhs max
  
  const isValidExpenseAmount = (amount: number): boolean => {
    if (!amount || amount <= 0) return false
    if (!isFinite(amount)) return false
    if (amount > MAX_EXPENSE_AMOUNT) return false
    return true
  }

  const handleAddExpense = () => {
    const safeAmount = safeNumber(draft.amount, 0)
    if (!isValidExpenseAmount(safeAmount)) return
    const newExpense: Expense = {
      id: Date.now().toString(),
      title: draft.note || draft.category || 'Expense',
      date: draft.date || toSafeISO(normalizeDate(new Date())),
      amount: safeAmount,
      currency: 'INR',
      category: draft.category || 'Other',
      note: draft.note
    }
    setExpenses([...expenses, newExpense])
    setAddOpen(false)
    setLimitExceeded(false)
    setDraft({ date: toSafeISO(normalizeDate(new Date())), amount: 0, currency: 'INR', category: 'Food' })
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const handleEditExpense = (expense: Expense) => {
    setDraft(expense)
    setAddOpen(true)
  }

  // ============ RENDER FUNCTIONS ============

  // Bottom Navigation Bar
  const renderBottomNav = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 1000
    }}>
      {/* Home */}
      <button
        onClick={() => setActiveTab('home')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '8px 16px'
        }}
      >
        <IconHome size={24} color={activeTab === 'home' ? '#3b82f6' : '#9ca3af'} />
        <Text size="xs" c={activeTab === 'home' ? '#3b82f6' : '#9ca3af'} fw={500}>Home</Text>
      </button>

      {/* Transactions */}
      <button
        onClick={() => setActiveTab('transactions')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '8px 16px'
        }}
      >
        <IconReceipt size={24} color={activeTab === 'transactions' ? '#3b82f6' : '#9ca3af'} />
        <Text size="xs" c={activeTab === 'transactions' ? '#3b82f6' : '#9ca3af'} fw={500}>Transactions</Text>
      </button>

      {/* Add Button (FAB) */}
      <button
        onClick={() => setAddOpen(true)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginTop: '-28px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
        }}
      >
        <IconPlus size={28} color="white" />
      </button>

      {/* Analytics */}
      <button
        onClick={() => setActiveTab('analytics')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '8px 16px'
        }}
      >
        <IconChartBar size={24} color={activeTab === 'analytics' ? '#3b82f6' : '#9ca3af'} />
        <Text size="xs" c={activeTab === 'analytics' ? '#3b82f6' : '#9ca3af'} fw={500}>Analytics</Text>
      </button>

      {/* Settings */}
      <button
        onClick={() => setActiveTab('settings')}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '8px 16px'
        }}
      >
        <IconSettings size={24} color={activeTab === 'settings' ? '#3b82f6' : '#9ca3af'} />
        <Text size="xs" c={activeTab === 'settings' ? '#3b82f6' : '#9ca3af'} fw={500}>Settings</Text>
      </button>
    </div>
  )

  // HOME SCREEN
  const renderHomeScreen = () => (
    <Stack gap="lg" style={{ padding: '20px', paddingBottom: '100px' }}>
      {/* Hero Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        borderRadius: '20px',
        padding: '24px',
        color: 'white'
      }}>
        <Text size="sm" style={{ opacity: 0.9 }}>Total Balance</Text>
        <Title order={1} style={{ fontSize: '36px', fontWeight: 700, marginTop: '8px' }}>
          <NumberFormatter prefix={currencySymbol.INR} value={safeNumber(remaining, 0)} thousandSeparator />
        </Title>
        <Text size="sm" style={{ opacity: 0.8, marginTop: '4px' }}>This {range}</Text>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{
          flex: 1,
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={handleOpenBudgetModal}
            style={{ position: 'absolute', top: '8px', right: '8px' }}
          >
            <IconEdit size={14} />
          </ActionIcon>
          <IconTrendingUp size={20} color="#22c55e" style={{ marginBottom: '4px' }} />
          <Text size="xs" c="#6b7280">Budget</Text>
          <Text size="sm" fw={700} c="#166534">
            <NumberFormatter prefix={currencySymbol.INR} value={budgetAmount} thousandSeparator />
          </Text>
        </div>
        <div style={{
          flex: 1,
          backgroundColor: '#fef2f2',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <IconTrendingDown size={20} color="#ef4444" style={{ marginBottom: '4px' }} />
          <Text size="xs" c="#6b7280">Expenses</Text>
          <Text size="sm" fw={700} c="#991b1b">
            <NumberFormatter prefix={currencySymbol.INR} value={total} thousandSeparator />
          </Text>
        </div>
        <div style={{
          flex: 1,
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <IconPigMoney size={20} color="#3b82f6" style={{ marginBottom: '4px' }} />
          <Text size="xs" c="#6b7280">Savings</Text>
          <Text size="sm" fw={700} c="#1e40af">
            <NumberFormatter prefix={currencySymbol.INR} value={safeNumber(Math.max(0, remaining), 0)} thousandSeparator />
          </Text>
        </div>
      </div>

      {/* Budget Progress */}
      <ModernCard title="Budget Progress" variant="default">
        <Progress
          value={budgetProgress}
          size="lg"
          color={budgetProgress > 90 ? 'red' : budgetProgress > 70 ? 'yellow' : 'blue'}
          style={{ marginBottom: '8px' }}
        />
        <Text size="sm" c="#6b7280">
          {budgetProgress.toFixed(0)}% used • {currencySymbol.INR}{remaining.toFixed(0)} remaining
        </Text>
      </ModernCard>

      {/* Recent Transactions */}
      <div>
        <Group justify="space-between" mb="md">
          <Title order={4} c="#111827">Recent Transactions</Title>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => setActiveTab('transactions')}
            style={{ color: '#3b82f6' }}
          >
            See All
          </Button>
        </Group>
        <MaterialList
          expenses={filteredExpenses.slice(0, 5)}
          currencySymbol={currencySymbol}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
      </div>
    </Stack>
  )

  // TRANSACTIONS SCREEN
  const renderTransactionsScreen = () => (
    <Stack gap="md" style={{ padding: '20px', paddingBottom: '100px' }}>
      <Title order={2} c="#111827">Transactions</Title>

      {/* Date Filter */}
      <MaterialDateFilter
        range={range}
        activeDate={activeDate}
        onRangeChange={(v) => setRange(v as Range)}
        onDateChange={setActiveDate}
      />

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        <Badge variant="filled" color="blue" size="lg" style={{ cursor: 'pointer' }}>All</Badge>
        {CATEGORIES.slice(0, 6).map(cat => (
          <Badge key={cat.value} variant="light" color="gray" size="lg" style={{ cursor: 'pointer' }}>
            {cat.icon} {cat.label}
          </Badge>
        ))}
      </div>

      {/* Transaction List */}
      <MaterialList
        expenses={filteredExpenses}
        currencySymbol={currencySymbol}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />
    </Stack>
  )

  // ANALYTICS SCREEN
  const renderAnalyticsScreen = () => (
    <Stack gap="lg" style={{ padding: '20px', paddingBottom: '100px' }}>
      <Title order={2} c="#111827">Analytics</Title>

      {/* Summary Stats */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, backgroundColor: '#f0f9ff', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <Text size="xs" c="#6b7280">Total Spent</Text>
          <Text size="md" fw={700} c="#1e40af">₹{total.toFixed(0)}</Text>
        </div>
        <div style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <Text size="xs" c="#6b7280">Daily Avg</Text>
          <Text size="md" fw={700} c="#166534">₹{dailyAvg.toFixed(0)}</Text>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fef3c7', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <Text size="xs" c="#6b7280">Transactions</Text>
          <Text size="md" fw={700} c="#92400e">{filteredExpenses.length}</Text>
        </div>
      </div>

      {/* Pie Chart */}
      <ModernCard title="Expense Categories" variant="default">
        {categoryData.length > 0 ? (
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Text c="#6b7280" ta="center" py="xl">No data to display</Text>
        )}
      </ModernCard>

      {/* Top Categories */}
      <ModernCard title="Top Categories" variant="default">
        <Stack gap="sm">
          {categoryData.slice(0, 5).map((cat, i) => (
            <div key={cat.name}>
              <Group justify="space-between" mb={4}>
                <Text size="sm" fw={500}>{cat.name}</Text>
                <Text size="sm" c="#6b7280">₹{cat.value.toFixed(0)}</Text>
              </Group>
              <Progress value={(cat.value / total) * 100} size="sm" color={cat.color} />
            </div>
          ))}
        </Stack>
      </ModernCard>
    </Stack>
  )

  // SETTINGS SCREEN
  const renderSettingsScreen = () => (
    <Stack gap="lg" style={{ padding: '20px', paddingBottom: '100px' }}>
      <Title order={2} c="#111827">Settings</Title>

      {/* Profile */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text size="lg" fw={700} c="white">BH</Text>
        </div>
        <div style={{ flex: 1 }}>
          <Text fw={600} c="#111827">Bhuvan</Text>
          <Text size="sm" c="#6b7280">bhuvan@example.com</Text>
        </div>
        <Button variant="light" size="sm" onClick={() => setProfileOpen(true)}>Edit profile</Button>
      </div>

      {/* Preferences */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <Text size="sm" fw={600} c="#3b82f6" p="md" pb="xs">Preferences</Text>

        <SettingsRow 
          icon={<Text>{selectedCurrency === 'INR' ? '🇮🇳' : selectedCurrency === 'USD' ? '🇺🇸' : '🇪🇺'}</Text>} 
          title="Currency" 
          value={currencyLabels[selectedCurrency as keyof typeof currencyLabels]} 
          onClick={() => setCurrencyOpen(true)} 
        />
        <SettingsRow 
          icon={<IconMoon size={20} />} 
          title="Theme" 
          value={selectedTheme === 'light' ? 'Light' : selectedTheme === 'dark' ? 'Dark' : 'System default'} 
          onClick={() => setThemeOpen(true)} 
        />
        <SettingsRow icon={<IconBell size={20} />} title="Notifications" toggle />
      </div>

      {/* Data */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <Text size="sm" fw={600} c="#3b82f6" p="md" pb="xs">Data</Text>

        <SettingsRow icon={<IconDownload size={20} />} title="Export Data" subtitle="CSV, PDF" onClick={() => setExportOpen(true)} />
        <SettingsRow icon={<IconCloud size={20} />} title="Backup to Cloud" subtitle={`Last: ${lastBackup}`} onClick={() => setBackupOpen(true)} />
        <SettingsRow icon={<IconCategory size={20} />} title="Manage Categories" onClick={() => setCategoriesOpen(true)} />
      </div>

      {/* About */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <Text size="sm" fw={600} c="#3b82f6" p="md" pb="xs">About</Text>

        <SettingsRow icon={<IconHelp size={20} />} title="Help & Support" onClick={() => setHelpOpen(true)} />
        <SettingsRow icon={<IconShield size={20} />} title="Privacy Policy" onClick={() => setPrivacyOpen(true)} />
        <SettingsRow icon={<IconInfoCircle size={20} />} title="Version" value="2.0.1" />
      </div>
    </Stack>
  )

  // Settings Row Component
  const SettingsRow = ({ icon, title, subtitle, value, toggle, onClick }: {
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    value?: string,
    toggle?: boolean,
    onClick?: () => void
  }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 16px',
      borderBottom: '1px solid #f3f4f6',
      cursor: onClick ? 'pointer' : 'default'
    }} onClick={onClick}>
      <div style={{ color: '#6b7280' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <Text size="sm" fw={500} c="#111827">{title}</Text>
        {subtitle && <Text size="xs" c="#6b7280">{subtitle}</Text>}
      </div>
      {toggle ? (
        <Switch defaultChecked color="blue" />
      ) : value ? (
        <Group gap="xs">
          <Text size="sm" c="#6b7280">{value}</Text>
          <IconChevronRight size={16} color="#9ca3af" />
        </Group>
      ) : (
        <IconChevronRight size={16} color="#9ca3af" />
      )}
    </div>
  )

  // ADD EXPENSE MODAL
  const renderAddExpenseModal = () => (
    <Modal
      opened={addOpen}
      onClose={() => {
        setAddOpen(false)
        setLimitExceeded(false)
      }}
      fullScreen
      withCloseButton={false}
      styles={{ content: { backgroundColor: '#f8fafc' } }}
    >
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <ActionIcon variant="subtle" onClick={() => {
            setAddOpen(false)
            setLimitExceeded(false)
          }}>
            <IconX size={24} />
          </ActionIcon>
          <Title order={3}>Add Expense</Title>
          <ActionIcon variant="subtle" color="blue" onClick={handleAddExpense}>
            <IconCheck size={24} />
          </ActionIcon>
        </Group>

        {/* Amount Input */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <NumberInput
            value={draft.amount}
            max={999999}
            onChange={(v) => {
              const stringValue = v.toString()
              const currentValue = draft.amount.toString()
              
              // Check if user is trying to add more than 6 digits
              if (stringValue.length > 6 || currentValue.length > 6) {
                // Show notification if not already showing
                if (!limitExceeded) {
                  setLimitExceeded(true)
                  setTimeout(() => setLimitExceeded(false), 3000) // Hide after 3 seconds
                }
                // Keep value at 6 digits maximum
                const sixDigitValue = stringValue.substring(0, 6)
                const num = Number(sixDigitValue) || 0
                const clamped = safeNumber(Math.min(Math.max(num, 0), 999999), 0)
                setDraft({ ...draft, amount: clamped })
                return
              }
              
              // Allow only 6 digits or less
              setLimitExceeded(false)
              const num = Number(v) || 0
              const clamped = safeNumber(Math.min(Math.max(num, 0), 999999), 0)
              setDraft({ ...draft, amount: clamped })
            }}
            onInput={(e) => {
              const value = e.currentTarget.value
              // Remove any non-digit characters and check length
              const digitsOnly = value.replace(/\D/g, '')
              if (digitsOnly.length > 6) {
                e.currentTarget.value = digitsOnly.substring(0, 6)
                if (!limitExceeded) {
                  setLimitExceeded(true)
                  setTimeout(() => setLimitExceeded(false), 3000)
                }
              }
            }}
            onBlur={() => {
              // Double-check on blur to ensure 6-digit limit
              const currentValue = draft.amount
              if (currentValue > 999999) {
                setDraft({ ...draft, amount: 999999 })
                setLimitExceeded(true)
                setTimeout(() => setLimitExceeded(false), 3000)
              }
            }}
            prefix="₹"
            size="xl"
            hideControls
            variant="unstyled"
            styles={{
              input: {
                fontSize: '48px',
                fontWeight: 700,
                textAlign: 'center',
                color: '#111827'
              }
            }}
            placeholder="0.00"
          />
          
          {/* Limit Exceeded Notification */}
          {limitExceeded && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Text size="sm" c="#dc2626" fw={500}>
                Note: Limit Exceeded
              </Text>
            </div>
          )}
        </div>

        {/* Category Grid */}
        <Text size="sm" fw={600} mb="sm" c="#374151">Category</Text>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setDraft({ ...draft, category: cat.value })}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '12px 8px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: draft.category === cat.value ? '#3b82f6' : '#f3f4f6',
                color: draft.category === cat.value ? 'white' : '#374151',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '24px' }}>{cat.icon}</span>
              <Text size="xs" fw={500}>{cat.label}</Text>
            </button>
          ))}
        </div>

        {/* Date */}
        <DatePickerInput
          label="Date"
          value={draft.date ? new Date(draft.date) : normalizeDate(new Date())}
          onChange={(d: any) => setDraft({ ...draft, date: d ? toSafeISO(normalizeDate(d instanceof Date ? d : new Date(d))) : toSafeISO(normalizeDate(new Date())) })}
          leftSection={<IconCalendar size={16} />}
          firstDayOfWeek={0}
          mb="md"
        />

        {/* Note */}
        <TextInput
          label="Note (optional)"
          placeholder="Add a note..."
          value={draft.note || ''}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          mb="md"
        />

        {/* Payment Method */}
        <Text size="sm" fw={600} mb="sm" c="#374151">Payment Method</Text>
        <Group gap="sm" mb="xl">
          {[
            { value: 'Cash', icon: <IconCash size={16} /> },
            { value: 'Card', icon: <IconCreditCard size={16} /> },
            { value: 'UPI', icon: <IconDeviceMobile size={16} /> }
          ].map(method => (
            <Button
              key={method.value}
              variant={paymentMethod === method.value ? 'filled' : 'light'}
              leftSection={method.icon}
              onClick={() => setPaymentMethod(method.value as any)}
              style={{ flex: 1 }}
            >
              {method.value}
            </Button>
          ))}
        </Group>

        {/* Save Button */}
        <Button
          fullWidth
          size="lg"
          onClick={handleAddExpense}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            height: '56px',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          Save Expense
        </Button>
      </div>
    </Modal>
  )

  // ============ MAIN RENDER ============
  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{ width: 0, breakpoint: 0 }}
    >
        <AppShell.Main>
          {/* Header */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Title order={3} c="#111827">Expense Tracker</Title>
            <ActionIcon variant="light" onClick={() => setAiInsightsOpen(true)}>
              <IconWand size={20} />
            </ActionIcon>
          </div>

          {/* Screen Content */}
          {activeTab === 'home' && renderHomeScreen()}
          {activeTab === 'transactions' && renderTransactionsScreen()}
          {activeTab === 'analytics' && renderAnalyticsScreen()}
          {activeTab === 'settings' && renderSettingsScreen()}

          {/* Bottom Navigation */}
          {renderBottomNav()}

          {/* Modals */}
          {renderAddExpenseModal()}

        {/* BUDGET MODAL */}
        <Modal
          opened={budgetOpen}
          onClose={() => setBudgetOpen(false)}
          title="Budget Settings"
          size="md"
        >
          <Stack gap="md">
            <TextInput
              label="Budget Name"
              placeholder="Monthly Budget"
              value={budgetDraft.name || ''}
              onChange={(e) => setBudgetDraft({ ...budgetDraft, name: e.target.value })}
            />

            <NumberInput
              label="Budget Amount"
              placeholder="15000"
              prefix="₹"
              thousandSeparator
              hideControls
              value={budgetDraft.amount || 0}
              onChange={(v) => setBudgetDraft({ ...budgetDraft, amount: Number(v) || 0 })}
              max={999999}
            />

            <Select
              label="Currency"
              data={[
                { value: 'INR', label: '₹ Indian Rupee' },
                { value: 'USD', label: '$ US Dollar' },
                { value: 'EUR', label: '€ Euro' }
              ]}
              value={budgetDraft.currency || 'INR'}
              onChange={(v) => setBudgetDraft({ ...budgetDraft, currency: v as 'INR' | 'USD' | 'EUR' })}
            />

            <Select
              label="Period"
              data={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'weekly', label: 'Weekly' }
              ]}
              value={budgetDraft.period || 'monthly'}
              onChange={(v) => setBudgetDraft({ ...budgetDraft, period: v as 'monthly' | 'weekly' })}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setBudgetOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBudget} color="blue">
                Save Budget
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* PROFILE EDIT MODAL */}
        <Modal
          opened={profileOpen}
          onClose={() => setProfileOpen(false)}
          title="Edit Profile"
          size="md"
        >
          <Stack gap="md">
            <div style={{ textAlign: 'center', marginBottom: 'md' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                backgroundImage: profileData.avatar ? `url(${profileData.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!profileData.avatar && (
                  <Text size="xl" fw={700} c="white">
                    {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                )}
              </div>
              <Button variant="light" size="sm" leftSection={<IconUpload size={14} />} onClick={handleImageUpload}>
                Upload Photo
              </Button>
            </div>

            <TextInput
              label="Name"
              placeholder="Enter your name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />

            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            />

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 'md' }}>
              <Text size="sm" fw={600} mb="sm">Password</Text>
              <Button variant="outline" size="sm" fullWidth mb="xs">Change Password</Button>
              <Button 
                variant="outline" 
                color="gray" 
                size="sm" 
                fullWidth
                onClick={() => showConfirmDialog(
                  'Reset Password',
                  'A password reset link will be sent to your email.',
                  () => showToastMessage('Reset link sent to your email')
                )}
              >
                Reset Password
              </Button>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 'md' }}>
              <Button 
                variant="outline" 
                color="red" 
                size="sm" 
                fullWidth
                onClick={() => showConfirmDialog(
                  'Delete Account',
                  'Are you sure you want to delete your account? This action cannot be undone.',
                  () => {
                    localStorage.removeItem('userProfile')
                    setProfileData({ name: 'Bhuvan', email: 'bhuvan@example.com', avatar: '' })
                    setProfileOpen(false)
                    showToastMessage('Account deleted successfully')
                  }
                )}
              >
                Delete Account
              </Button>
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setProfileOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => {
                  localStorage.setItem('userProfile', JSON.stringify(profileData))
                  showToastMessage('Profile updated successfully')
                  setProfileOpen(false)
                }} 
                color="blue"
              >
                Save
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* CURRENCY SELECTION MODAL */}
        <Modal
          opened={currencyOpen}
          onClose={() => setCurrencyOpen(false)}
          title="Select Currency"
          size="sm"
        >
          <Stack gap="sm">
            {[
              { value: 'INR', label: '₹ Indian Rupee' },
              { value: 'USD', label: '$ US Dollar' },
              { value: 'EUR', label: '€ Euro' }
            ].map(currency => (
              <Button
                key={currency.value}
                variant={selectedCurrency === currency.value ? 'filled' : 'light'}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => {
                  setSelectedCurrency(currency.value)
                  localStorage.setItem('selectedCurrency', currency.value)
                  showToastMessage(`Currency changed to ${currency.label}`)
                  setCurrencyOpen(false)
                }}
              >
                {currency.label}
              </Button>
            ))}
          </Stack>
        </Modal>

        {/* THEME SELECTION MODAL */}
        <Modal
          opened={themeOpen}
          onClose={() => setThemeOpen(false)}
          title="Select Theme"
          size="sm"
        >
          <Stack gap="sm">
            {[
              { value: 'light', label: 'Light', icon: '☀️' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'system', label: 'System Default', icon: '🖥️' }
            ].map(theme => (
              <Button
                key={theme.value}
                variant={selectedTheme === theme.value ? 'filled' : 'light'}
                style={{ justifyContent: 'flex-start' }}
                leftSection={<span style={{ fontSize: '18px' }}>{theme.icon}</span>}
                onClick={() => {
                  setSelectedTheme(theme.value)
                  localStorage.setItem('selectedTheme', theme.value)
                  // Apply theme to document
                  if (theme.value === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark')
                  } else if (theme.value === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light')
                  } else {
                    document.documentElement.removeAttribute('data-theme')
                  }
                  // Dispatch event to notify global theme provider
                  window.dispatchEvent(new CustomEvent('themeChange', { detail: theme.value }))
                  showToastMessage(`Theme changed to ${theme.label}`)
                  setThemeOpen(false)
                }}
              >
                {theme.label}
              </Button>
            ))}
          </Stack>
        </Modal>

        {/* EXPORT DATA MODAL */}
        <Modal
          opened={exportOpen}
          onClose={() => setExportOpen(false)}
          title="Export Data"
          size="sm"
        >
          <Stack gap="md">
            <Text size="sm" c="#6b7280">Choose export format:</Text>
            
            <Button
              variant="outline"
              leftSection={<IconDownload size={16} />}
              onClick={exportToCSV}
            >
              Export as CSV
            </Button>

            <Button
              variant="outline"
              leftSection={<IconDownload size={16} />}
              onClick={exportToPDF}
            >
              Export as PDF
            </Button>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setExportOpen(false)}>Cancel</Button>
            </Group>
          </Stack>
        </Modal>

        {/* BACKUP TO CLOUD MODAL */}
        <Modal
          opened={backupOpen}
          onClose={() => setBackupOpen(false)}
          title="Backup to Cloud"
          size="sm"
        >
          <Stack gap="md">
            <div style={{ textAlign: 'center', padding: 'md', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
              <Text size="sm" c="#6b7280">Last backup</Text>
              <Text fw={600}>{lastBackup}</Text>
            </div>

            <Button
              fullWidth
              leftSection={<IconCloud size={16} />}
              onClick={performBackup}
            >
              Backup Now
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => showConfirmDialog(
                'Restore Backup',
                'Are you sure you want to restore from backup? Current data will be replaced.',
                restoreBackup
              )}
            >
              Restore Backup
            </Button>

            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setBackupOpen(false)}>Close</Button>
            </Group>
          </Stack>
        </Modal>

        {/* MANAGE CATEGORIES MODAL */}
        <Modal
          opened={categoriesOpen}
          onClose={() => setCategoriesOpen(false)}
          title="Manage Categories"
          size="md"
        >
          <Stack gap="md">
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {customCategories.map(category => (
                <div key={category.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  {editingCategory === category.value ? (
                    <Group style={{ flex: 1 }}>
                      <TextInput
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        size="sm"
                        style={{ flex: 1 }}
                      />
                      <ActionIcon 
                        size="sm" 
                        color="green"
                        onClick={() => {
                          setCustomCategories(customCategories.map(c => 
                            c.value === category.value 
                              ? { ...c, label: editCategoryName }
                              : c
                          ))
                          setEditingCategory(null)
                          setEditCategoryName('')
                          showToastMessage('Category updated successfully')
                        }}
                      >
                        <IconCheck size={14} />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        color="gray"
                        onClick={() => {
                          setEditingCategory(null)
                          setEditCategoryName('')
                        }}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>
                  ) : (
                    <>
                      <Group>
                        <span style={{ fontSize: '20px' }}>{category.icon}</span>
                        <Text>{category.label}</Text>
                      </Group>
                      <Group gap="xs">
                        <ActionIcon 
                          size="sm" 
                          variant="subtle"
                          onClick={() => {
                            setEditingCategory(category.value)
                            setEditCategoryName(category.label)
                          }}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon 
                          size="sm" 
                          variant="subtle" 
                          color="red"
                          onClick={() => showConfirmDialog(
                            'Delete Category',
                            `Are you sure you want to delete "${category.label}"?`,
                            () => {
                              setCustomCategories(customCategories.filter(c => c.value !== category.value))
                              showToastMessage('Category deleted successfully')
                            }
                          )}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </>
                  )}
                </div>
              ))}
            </div>

            <Divider />

            <div>
              <Text size="sm" fw={600} mb="xs">Add New Category</Text>
              <Group>
                <TextInput
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      const newCategory = {
                        value: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
                        label: newCategoryName,
                        icon: '📁',
                        color: '#6b7280'
                      }
                      setCustomCategories([...customCategories, newCategory])
                      setNewCategoryName('')
                      showToastMessage('Category added successfully')
                    }
                  }}
                >
                  Add
                </Button>
              </Group>
            </div>

            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setCategoriesOpen(false)}>Done</Button>
            </Group>
          </Stack>
        </Modal>

        {/* HELP & SUPPORT MODAL */}
        <Modal
          opened={helpOpen}
          onClose={() => setHelpOpen(false)}
          title="Help & Support"
          size="md"
        >
          <Stack gap="md">
            <div>
              <Text fw={600} mb="sm">Frequently Asked Questions</Text>
              <Stack gap="xs">
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <Text size="sm" fw={500}>How do I add an expense?</Text>
                  <Text size="xs" c="#6b7280">Tap the + button and fill in the expense details.</Text>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <Text size="sm" fw={500}>How do I set a budget?</Text>
                  <Text size="xs" c="#6b7280">Go to Settings {'>'} Budget to set your monthly budget.</Text>
                </div>
              </Stack>
            </div>

            <div>
              <Text fw={600} mb="sm">Contact Support</Text>
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => {
                  window.location.href = 'mailto:support@expensetracker.com'
                }}
              >
                support@expensetracker.com
              </Button>
            </div>

            <div>
              <Text fw={600} mb="sm">Feedback</Text>
              <TextInput 
                placeholder="Share your feedback..." 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                mb="sm"
              />
              <Button 
                fullWidth
                onClick={() => {
                  if (feedbackText.trim()) {
                    localStorage.setItem('userFeedback', JSON.stringify({
                      feedback: feedbackText,
                      timestamp: new Date().toISOString()
                    }))
                    showToastMessage('Feedback submitted successfully')
                    setFeedbackText('')
                  } else {
                    showToastMessage('Please enter your feedback')
                  }
                }}
              >
                Send Feedback
              </Button>
            </div>

            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setHelpOpen(false)}>Close</Button>
            </Group>
          </Stack>
        </Modal>

        {/* PRIVACY POLICY MODAL */}
        <Modal
          opened={privacyOpen}
          onClose={() => setPrivacyOpen(false)}
          title="Privacy Policy"
          size="lg"
        >
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Stack gap="md">
              <div>
                <Text fw={600} mb="sm">Data Collection</Text>
                <Text size="sm">
                  We collect only the data you provide for expense tracking purposes. This includes transaction amounts, 
                  categories, dates, and budget information.
                </Text>
              </div>

              <div>
                <Text fw={600} mb="sm">Data Usage</Text>
                <Text size="sm">
                  Your data is used solely to provide expense tracking services, generate insights, and manage budgets. 
                  We do not sell or share your personal data with third parties.
                </Text>
              </div>

              <div>
                <Text fw={600} mb="sm">Data Storage</Text>
                <Text size="sm">
                  All data is stored locally on your device. If you enable cloud backup, data is encrypted and stored 
                  securely in cloud storage.
                </Text>
              </div>

              <div>
                <Text fw={600} mb="sm">Data Retention</Text>
                <Text size="sm">
                  You retain full control over your data. You can export or delete all data at any time through the Settings menu.
                </Text>
              </div>

              <div>
                <Text fw={600} mb="sm">Contact</Text>
                <Text size="sm">
                  For privacy concerns, contact: privacy@expensetracker.com
                </Text>
              </div>
            </Stack>
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setPrivacyOpen(false)}>Close</Button>
          </Group>
        </Modal>

        {/* CONFIRMATION DIALOG */}
        <Modal
          opened={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          title={confirmDialog.title}
          size="sm"
        >
          <Stack gap="md">
            <Text>{confirmDialog.message}</Text>
            <Group justify="flex-end">
              <Button 
                variant="subtle" 
                onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              >
                Cancel
              </Button>
              <Button 
                color="red" 
                onClick={() => {
                  confirmDialog.onConfirm()
                  setConfirmDialog({ ...confirmDialog, open: false })
                }}
              >
                Confirm
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* TOAST NOTIFICATION */}
        {showToast && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {toastMessage}
          </div>
        )}

        <AIInsightsPanel
          opened={aiInsightsOpen}
          onClose={() => setAiInsightsOpen(false)}
          expenses={expenses}
          budgets={budgets}
        />
      </AppShell.Main>
    </AppShell>
  )
}
