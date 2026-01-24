/**
 * SAFE DATE UTILITIES FOR CAPACITOR ANDROID
 * Prevents crashes from invalid dates, timezone issues, and parsing errors
 */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Safely parse any date input to ISO string
 * Returns current date if input is invalid
 */
export function toSafeISO(input: Date | string | null | undefined): string {
    if (!input) return new Date().toISOString()

    try {
        const parsed = dayjs(input)
        if (!parsed.isValid()) {
            console.warn('[DateUtils] Invalid date input, using current date:', input)
            return new Date().toISOString()
        }
        return parsed.toISOString()
    } catch (err) {
        console.error('[DateUtils] Date parsing error:', err)
        return new Date().toISOString()
    }
}

/**
 * Safely parse to Date object with fallback
 */
export function toSafeDate(input: Date | string | null | undefined): Date {
    if (!input) return new Date()

    try {
        const parsed = input instanceof Date ? input : new Date(input)
        if (isNaN(parsed.getTime())) {
            console.warn('[DateUtils] Invalid Date object, using current date')
            return new Date()
        }
        return parsed
    } catch (err) {
        console.error('[DateUtils] Date object creation error:', err)
        return new Date()
    }
}

/**
 * Safely check if two dates are in the same period
 */
export function isSamePeriod(
    date1: string | Date | null,
    date2: string | Date | null,
    period: 'day' | 'month' | 'year'
): boolean {
    try {
        const d1 = dayjs(date1)
        const d2 = dayjs(date2)

        if (!d1.isValid() || !d2.isValid()) return false

        return d1.isSame(d2, period)
    } catch {
        return false
    }
}

/**
 * Format date safely with fallback
 */
export function formatDateSafe(
    date: string | Date | null | undefined,
    format: string = 'MMM D, YYYY'
): string {
    try {
        const parsed = dayjs(date)
        if (!parsed.isValid()) return '—'
        return parsed.format(format)
    } catch {
        return '—'
    }
}

/**
 * Get days in month safely
 */
export function getDaysInMonth(date: string | Date | null | undefined): number {
    try {
        const parsed = dayjs(date)
        if (!parsed.isValid()) return 30
        return parsed.daysInMonth()
    } catch {
        return 30
    }
}

/**
 * Create date range with bounds checking
 */
export function createDateRange(
    start: string | Date,
    end: string | Date
): { start: string; end: string; isValid: boolean } {
    try {
        const startDate = dayjs(start)
        const endDate = dayjs(end)

        if (!startDate.isValid() || !endDate.isValid()) {
            return {
                start: new Date().toISOString(),
                end: new Date().toISOString(),
                isValid: false
            }
        }

        if (endDate.isBefore(startDate)) {
            return {
                start: endDate.toISOString(),
                end: startDate.toISOString(),
                isValid: true
            }
        }

        return {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            isValid: true
        }
    } catch {
        const now = new Date().toISOString()
        return { start: now, end: now, isValid: false }
    }
}

/**
 * Debounced date change handler to prevent rapid switching crashes
 */
export function createDebouncedDateHandler<T>(
    handler: (value: T) => void,
    delay: number = 300
): (value: T) => void {
    let timeoutId: any = null

    return (value: T) => {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            handler(value)
            timeoutId = null
        }, delay)
    }
}
