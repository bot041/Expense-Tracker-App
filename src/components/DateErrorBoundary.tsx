import React, { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Alert, Button, Stack, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
}

/**
 * Error Boundary for Date-Based Components
 * Prevents entire app crash when date operations fail
 */
export class DateErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[DateErrorBoundary] Caught error:', error, errorInfo)
        this.props.onError?.(error, errorInfo)

        // Log to monitoring service (Sentry, Firebase, etc.)
        if (window.analytics) {
            window.analytics.logError({
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack
            })
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Alert
                    icon={<IconAlertTriangle size={16} />}
                    title="Data Load Error"
                    color="red"
                    variant="light"
                    mt="md"
                >
                    <Stack gap="sm">
                        <Text size="sm">
                            Unable to load data for this date. Please try selecting a different date or refreshing the app.
                        </Text>
                        {this.state.error && (
                            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                {this.state.error.message}
                            </Text>
                        )}
                        <Button size="xs" variant="light" onClick={this.handleReset}>
                            Try Again
                        </Button>
                    </Stack>
                </Alert>
            )
        }

        return this.props.children
    }
}

// Declare global analytics type
declare global {
    interface Window {
        analytics?: {
            logError: (data: {
                error: string
                stack?: string
                componentStack?: string
            }) => void
        }
    }
}
