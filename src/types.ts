export type ExpenseRange = 'day' | 'month' | 'year'

export type Category = {
  id: string
  name: string
  emoji?: string
  color?: string
}

export type Expense = {
  id: string
  title: string
  amount: number
  currency: 'INR' | 'USD' | 'EUR'
  category: string
  date: string
  merchant?: string
  note?: string
  tags?: string[]
  isTravel?: boolean
  tripId?: string
  splitWith?: string[]
}

export type Budget = {
  id: string
  name: string
  amount: number
  currency: 'INR' | 'USD' | 'EUR'
  period: 'monthly' | 'weekly'
  start: string
  streakDays: number
}

export type Bill = {
  id: string
  title: string
  amount: number
  currency: 'INR' | 'USD' | 'EUR'
  dueDate: string
  recurring: 'monthly' | 'quarterly' | 'yearly'
}

export type Trip = {
  id: string
  name: string
  startDate: string
  endDate: string
  baseCurrency: 'INR' | 'USD' | 'EUR'
  participants: string[]
  budget: number
  city?: string
}

export type Split = {
  expenseId: string
  participants: { name: string; share: number }[]
}

export type Investment = {
  id: string
  asset: string
  type: string
  invested: number
  current: number
}

export const defaultCategories = [
  'Food',
  'Transport',
  'Shopping',
  'Travel',
  'Groceries',
  'Bills',
  'Health',
  'Entertainment',
  'Other',
]

export function createSeedData() {
  const today = new Date()
  const iso = (d: Date) => d.toISOString()
  const expenses: Expense[] = [
    {
      id: crypto.randomUUID(),
      title: 'Coffee with team',
      amount: 320,
      currency: 'INR',
      category: 'Food',
      date: iso(today),
      merchant: 'Blue Tokai',
      tags: ['team', 'work'],
    },
    {
      id: crypto.randomUUID(),
      title: 'Groceries',
      amount: 2400,
      currency: 'INR',
      category: 'Groceries',
      date: iso(new Date(today.getTime() - 86400000 * 2)),
      merchant: 'BigBasket',
    },
    {
      id: crypto.randomUUID(),
      title: 'Metro recharge',
      amount: 500,
      currency: 'INR',
      category: 'Transport',
      date: iso(new Date(today.getTime() - 86400000 * 6)),
    },
  ]

  const budgets: Budget[] = [
    {
      id: crypto.randomUUID(),
      name: 'Monthly budget',
      amount: 15000,
      currency: 'INR',
      period: 'monthly',
      start: iso(new Date(today.getFullYear(), today.getMonth(), 1)),
      streakDays: 5,
    },
  ]

  const bills: Bill[] = [
    {
      id: crypto.randomUUID(),
      title: 'Internet',
      amount: 899,
      currency: 'INR',
      dueDate: iso(new Date(today.getTime() + 86400000 * 3)),
      recurring: 'monthly',
    },
    {
      id: crypto.randomUUID(),
      title: 'Credit card',
      amount: 4500,
      currency: 'INR',
      dueDate: iso(new Date(today.getTime() + 86400000 * 10)),
      recurring: 'monthly',
    },
  ]

  const trips: Trip[] = [
    {
      id: crypto.randomUUID(),
      name: 'Singapore work trip',
      startDate: iso(today),
      endDate: iso(new Date(today.getTime() + 86400000 * 5)),
      baseCurrency: 'USD',
      participants: ['You', 'Alex'],
      budget: 5000,
      city: 'Singapore',
    },
  ]

  const splits: Split[] = [
    {
      expenseId: expenses[0].id,
      participants: [
        { name: 'You', share: 160 },
        { name: 'Alex', share: 160 },
      ],
    },
  ]

  const investments: Investment[] = [
    {
      id: crypto.randomUUID(),
      asset: 'Index Fund',
      type: 'Mutual Fund',
      invested: 50000,
      current: 56500,
    },
  ]

  return { expenses, budgets, bills, trips, splits, investments }
}

