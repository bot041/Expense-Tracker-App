import type { Expense } from '../types'

export const majorCities = [
    'New York', 'New York, USA',
    'San Francisco', 'San Francisco, USA',
    'London', 'London, UK',
    'Paris', 'Paris, France',
    'Berlin', 'Berlin, Germany',
    'Tokyo', 'Tokyo, Japan',
    'Osaka', 'Osaka, Japan',
    'Seoul', 'Seoul, South Korea',
    'Singapore', 'Singapore, Singapore',
    'Sydney', 'Sydney, Australia',
    'Melbourne', 'Melbourne, Australia',
    'Toronto', 'Toronto, Canada',
    'Vancouver', 'Vancouver, Canada',
    'Dubai', 'Dubai, UAE',
    'Doha', 'Doha, Qatar',
    'Bangkok', 'Bangkok, Thailand',
    'Bali', 'Bali, Indonesia',
    'Hong Kong', 'Hong Kong, China',
    'Shanghai', 'Shanghai, China',
    'Mumbai', 'Mumbai, India',
    'Bengaluru', 'Bengaluru, India',
    'Delhi', 'Delhi, India',
    'Cape Town', 'Cape Town, South Africa',
    'Johannesburg', 'Johannesburg, South Africa',
    'São Paulo', 'São Paulo, Brazil',
    'Mexico City', 'Mexico City, Mexico',
]

// Enhanced keywords mapping for categorization
export const categoryKeywords: Record<string, string> = {
    // Transport
    'uber': 'Transport', 'lyft': 'Transport', 'train': 'Transport', 'bus': 'Transport', 
    'flight': 'Travel', 'taxi': 'Transport', 'metro': 'Transport', 'subway': 'Transport',
    'tram': 'Transport', 'ferry': 'Transport', 'rickshaw': 'Transport', 'auto': 'Transport',
    
    // Food & Dining
    'burger': 'Food', 'coffee': 'Food', 'starbucks': 'Food', 'mcdonalds': 'Food', 
    'pizza': 'Food', 'lunch': 'Food', 'dinner': 'Food', 'breakfast': 'Food',
    'restaurant': 'Food', 'cafe': 'Food', 'bar': 'Food', 'pub': 'Food',
    'swiggy': 'Food', 'zomato': 'Food', 'doordash': 'Food', 'ubereats': 'Food',
    
    // Entertainment
    'netflix': 'Entertainment', 'spotify': 'Entertainment', 'movie': 'Entertainment',
    'concert': 'Entertainment', 'theater': 'Entertainment', 'cinema': 'Entertainment',
    'gaming': 'Entertainment', 'steam': 'Entertainment', 'playstation': 'Entertainment',
    
    // Travel & Accommodation
    'hotel': 'Travel', 'booking': 'Travel', 'expedia': 'Travel',
    'hostel': 'Travel', 'motel': 'Travel', 'resort': 'Travel',
    
    // Shopping
    'amazon': 'Shopping', 'flipkart': 'Shopping', 'walmart': 'Shopping',
    'target': 'Shopping', 'costco': 'Shopping', 'ikea': 'Shopping',
    'clothing': 'Shopping', 'shoes': 'Shopping', 'electronics': 'Shopping',
    
    // Groceries & Household
    'groceries': 'Groceries', 'supermarket': 'Groceries',
    'bigbasket': 'Groceries', 'dmart': 'Groceries', 'vegetables': 'Groceries', 'fruits': 'Groceries',
    
    // Health & Wellness
    'gym': 'Health', 'doctor': 'Health', 'pharmacy': 'Health', 'hospital': 'Health',
    'medicine': 'Health', 'clinic': 'Health', 'dental': 'Health', 'fitness': 'Health',
    
    // Bills & Utilities
    'electricity': 'Bills', 'water': 'Bills', 'gas': 'Bills', 'internet': 'Bills',
    'phone': 'Bills', 'mobile': 'Bills', 'rent': 'Bills', 'insurance': 'Bills',
    
    // Education
    'course': 'Other', 'tuition': 'Other', 'books': 'Other', 'stationery': 'Other',
    'school': 'Other', 'college': 'Other', 'university': 'Other',
}

// Auto-tagging patterns
export const tagPatterns: Record<string, string[]> = {
    'work': ['office', 'meeting', 'client', 'business', 'team', 'colleague'],
    'personal': ['personal', 'home', 'family', 'self'],
    'urgent': ['emergency', 'urgent', 'immediate'],
    'recurring': ['monthly', 'weekly', 'subscription', 'automatic'],
    'travel': ['trip', 'vacation', 'holiday', 'flight', 'hotel'],
    'food': ['restaurant', 'dining', 'coffee', 'meal'],
}

export function analyzeExpense(draft: Partial<Expense>, defaultCategories: string[]): { category: string | null, tags: string[], confidence: number } {
    if (!draft.title && !draft.merchant) {
        return { category: null, tags: [], confidence: 0 }
    }

    const text = `${draft.title ?? ''} ${draft.merchant ?? ''}`.toLowerCase()
    let category: string | null = null
    let confidence = 0
    const tags: string[] = []

    // 1. Check for specific locations (Travel) - highest confidence
    for (const city of majorCities) {
        if (text.includes(city.toLowerCase())) {
            category = 'Travel'
            confidence = 0.9
            tags.push('travel', 'destination')
            break
        }
    }

    // 2. Check for exact category match
    if (!category) {
        const foundCategory = defaultCategories.find((c) => text.includes(c.toLowerCase()))
        if (foundCategory) {
            category = foundCategory
            confidence = 0.8
        }
    }

    // 3. Check keywords with scoring
    if (!category) {
        const keywordScores: Record<string, number> = {}
        
        for (const [key, cat] of Object.entries(categoryKeywords)) {
            if (text.includes(key)) {
                keywordScores[cat] = (keywordScores[cat] || 0) + 1
            }
        }

        if (Object.keys(keywordScores).length > 0) {
            const bestCategory = Object.entries(keywordScores).sort((a, b) => b[1] - a[1])[0]
            category = bestCategory[0]
            confidence = Math.min(0.7, bestCategory[1] * 0.3)
        }
    }

    // 4. Auto-tagging based on patterns
    for (const [tag, patterns] of Object.entries(tagPatterns)) {
        if (patterns.some(pattern => text.includes(pattern))) {
            tags.push(tag)
        }
    }

    // 5. Add amount-based tags
    if (draft.amount) {
        if (draft.amount > 10000) {
            tags.push('high-value')
        } else if (draft.amount < 100) {
            tags.push('small-expense')
        }
    }

    // 6. Add time-based tags
    const now = new Date()
    if (draft.date) {
        const expenseDate = new Date(draft.date)
        const daysDiff = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 0) {
            tags.push('today')
        } else if (daysDiff === 1) {
            tags.push('yesterday')
        } else if (daysDiff <= 7) {
            tags.push('this-week')
        }
    }

    return { 
        category: category || 'Other', 
        tags: [...new Set(tags)], // Remove duplicates
        confidence 
    }
}

// Budget prediction based on historical data
export function predictBudgetUsage(expenses: Expense[], budgetAmount: number, daysInMonth: number) {
    const today = new Date()
    const currentDay = today.getDate()
    const daysRemaining = daysInMonth - currentDay
    
    const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === today.getMonth() && 
               expenseDate.getFullYear() === today.getFullYear()
    })
    
    const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + (isFinite(e.amount) ? e.amount : 0), 0)
    const dailyAverage = currentDay > 0 ? totalSpent / currentDay : 0
    const projectedSpend = totalSpent + (dailyAverage * daysRemaining)
    
    return {
        currentSpent: totalSpent,
        dailyAverage,
        projectedSpend,
        budgetRemaining: budgetAmount - totalSpent,
        projectedOverBudget: projectedSpend > budgetAmount,
        projectedOvershoot: Math.max(0, projectedSpend - budgetAmount),
        confidence: currentDay > 15 ? 0.8 : 0.6 // Higher confidence later in the month
    }
}

// Anomaly detection
export function detectAnomalies(expenses: Expense[]): { expense: Expense, reason: string, severity: 'low' | 'medium' | 'high' }[] {
    const anomalies: { expense: Expense, reason: string, severity: 'low' | 'medium' | 'high' }[] = []
    
    if (expenses.length < 5) return anomalies // Need sufficient data
    
    const amounts = expenses.map(e => isFinite(e.amount) ? e.amount : 0).filter(a => a > 0)
    if (amounts.length === 0) return anomalies
    
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - avgAmount, 2), 0) / amounts.length)
    
    expenses.forEach(expense => {
        const amount = isFinite(expense.amount) ? expense.amount : 0
        // Statistical anomaly (2+ standard deviations)
        if (amount > avgAmount + (2 * stdDev)) {
            anomalies.push({
                expense,
                reason: `Amount (₹${amount}) is significantly higher than average (₹${avgAmount.toFixed(2)})`,
                severity: amount > avgAmount + (3 * stdDev) ? 'high' : 'medium'
            })
        }
        
        // Unusual merchant (first time large expense)
        const sameMerchantExpenses = expenses.filter(e => e.merchant === expense.merchant)
        if (sameMerchantExpenses.length === 1 && amount > avgAmount * 1.5) {
            anomalies.push({
                expense,
                reason: `First time expense at ${expense.merchant} with high amount`,
                severity: 'low'
            })
        }
    })
    
    return anomalies
}

// Generate spending insights
export function generateSpendingInsights(expenses: Expense[]): { title: string, description: string, type: 'trend' | 'recommendation' | 'warning' }[] {
    const insights: { title: string, description: string, type: 'trend' | 'recommendation' | 'warning' }[] = []
    
    if (expenses.length === 0) return insights
    
    // Category breakdown
    const categoryTotals: Record<string, number> = {}
    expenses.forEach(expense => {
        const amount = isFinite(expense.amount) ? expense.amount : 0
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + amount
    })
    
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
    if (topCategory) {
        const totalValidAmount = expenses.reduce((sum, e) => sum + (isFinite(e.amount) ? e.amount : 0), 0)
        const percentage = totalValidAmount > 0 ? ((topCategory[1] / totalValidAmount) * 100).toFixed(1) : '0'
        if (parseFloat(percentage) > 50) {
            insights.push({
                title: 'High Category Concentration',
                description: `${topCategory[0]} represents ${percentage}% of your spending. Consider diversifying expenses.`,
                type: 'warning'
            })
        }
    }
    
    // Weekend vs weekday spending
    const weekendExpenses = expenses.filter(e => {
        const date = new Date(e.date)
        return date.getDay() === 0 || date.getDay() === 6
    })
    
    const weekdayExpenses = expenses.filter(e => {
        const date = new Date(e.date)
        return date.getDay() > 0 && date.getDay() < 6
    })
    
    const weekendAvg = weekendExpenses.length > 0 ? weekendExpenses.reduce((sum, e) => sum + (isFinite(e.amount) ? e.amount : 0), 0) / weekendExpenses.length : 0
    const weekdayAvg = weekdayExpenses.length > 0 ? weekdayExpenses.reduce((sum, e) => sum + (isFinite(e.amount) ? e.amount : 0), 0) / weekdayExpenses.length : 0
    
    if (weekendAvg > weekdayAvg * 1.5) {
        insights.push({
            title: 'Weekend Spending Spike',
            description: 'Your weekend spending is significantly higher than weekdays. Consider setting weekend budgets.',
            type: 'recommendation'
        })
    }
    
    return insights
}
