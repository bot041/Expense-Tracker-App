import type { Expense } from '../types'

interface CategorySuggestion {
  category: string
  tags: string[]
  confidence: number
}

const categoryKeywords: Record<string, string> = {
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
  'bigbasket': 'Groceries', 'dmart': 'Groceries',
  'vegetables': 'Groceries', 'fruits': 'Groceries',
  
  // Health & Wellness
  'gym': 'Health', 'doctor': 'Health', 'pharmacy': 'Health', 'hospital': 'Health',
  'medicine': 'Health', 'clinic': 'Health', 'dental': 'Health', 'fitness': 'Health',
  
  // Bills & Utilities
  'electricity': 'Bills', 'water': 'Bills', 'gas': 'Bills', 'internet': 'Bills',
  'phone': 'Bills', 'mobile': 'Bills', 'rent': 'Bills', 'insurance': 'Bills',
  
  // Education
  'education': 'Education', 'tuition': 'Education', 'course': 'Education',
  
  // Transportation
  'uber': 'Transportation', 'taxi': 'Transportation', 'bus': 'Transportation',
  'metro': 'Transportation', 'train': 'Transportation', 'petrol': 'Transportation',
  
  // Business & Work
  'office': 'Business', 'supplies': 'Business', 'equipment': 'Business',
}

const tagPatterns = {
  work: ['office', 'business', 'meeting', 'client', 'project'],
  personal: ['home', 'personal', 'family', 'leisure'],
  urgent: ['urgent', 'emergency', 'asap', 'critical'],
  recurring: ['monthly', 'weekly', 'daily', 'subscription'],
  travel: ['vacation', 'trip', 'holiday', 'flight', 'hotel'],
  food: ['restaurant', 'grocery', 'coffee', 'delivery'],
}

export function analyzeExpense(expense: Partial<Expense>, categories: string[]): CategorySuggestion | null {
  if (!expense || !expense.title) {
    return null
  }

  const title = expense.title.toLowerCase()
  const amount = expense.amount || 0
  const merchant = (expense.merchant || '').toLowerCase()

  // Find matching category
  let matchedCategory: string | null = null
  let maxConfidence = 0

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (title.includes(keyword) || merchant.includes(keyword)) {
        const confidence = Math.min(0.9, maxConfidence + 0.1)
        if (confidence > maxConfidence) {
          maxConfidence = confidence
          matchedCategory = category
        }
      }
    }
  }

  // Generate tags based on patterns
  const detectedTags: string[] = []
  for (const [tag, patterns] of Object.entries(tagPatterns)) {
    for (const pattern of patterns) {
      if (title.includes(pattern) || merchant.includes(pattern)) {
        detectedTags.push(tag)
        break
      }
    }
  }

  // Fallback to category if no match found
  const finalCategory = matchedCategory || 'Other'

  return {
    category: finalCategory,
    tags: detectedTags,
    confidence: maxConfidence
  }
}
