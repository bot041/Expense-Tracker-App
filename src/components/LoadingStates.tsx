import React from 'react'
import type { ReactNode } from 'react'
import { Card, Skeleton, Stack, Text, Center, ThemeIcon, Box, Group } from '@mantine/core'
import { IconInbox } from '@tabler/icons-react'

/**
 * Material Design Dashboard Card Skeleton Loader
 * Shows while date-based data is loading
 */
export function DashboardCardSkeleton() {
    return (
        <Box
            p="lg"
            style={{
                backgroundColor: 'var(--md-sys-color-surface)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: 'var(--md-radius-lg)',
                boxShadow: 'var(--md-elevation-level1)',
                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)'
            }}
        >
            <Group justify="space-between" mb="md">
                <Box
                    w={40}
                    h={40}
                    style={{
                        borderRadius: 'var(--md-radius-md)',
                        backgroundColor: 'var(--md-sys-color-surface-variant)'
                    }}
                />
                <Skeleton height={20} width={60} radius="sm" />
            </Group>
            
            <Skeleton height={12} width="40%" mb="sm" />
            <Skeleton height={32} width="60%" mt="sm" />
            <Skeleton height={8} width="30%" mt="md" />
            
            <Box mt="md">
                <Skeleton height={8} width="100%" radius="sm" />
            </Box>
        </Box>
    )
}

/**
 * Material Design Chart Skeleton Loader
 */
export function ChartSkeleton() {
    return (
        <Box
            p="lg"
            style={{
                backgroundColor: 'var(--md-sys-color-surface)',
                border: '1px solid var(--md-sys-color-outline-variant)',
                borderRadius: 'var(--md-radius-lg)',
                boxShadow: 'var(--md-elevation-level1)'
            }}
        >
            <Skeleton height={16} width="30%" mb="md" />
            <Box style={{ height: 300 }}>
                <Stack gap="xs">
                    {[...Array(6)].map((_, i) => (
                        <Group key={i} gap="sm">
                            <Skeleton height={40} width="20%" radius="sm" />
                            <Skeleton height={40} style={{ flex: 1 }} radius="sm" />
                        </Group>
                    ))}
                </Stack>
            </Box>
        </Box>
    )
}

/**
 * Material Design List Item Skeleton
 */
export function ListItemSkeleton() {
    return (
        <Box
            p="md"
            style={{
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor: 'var(--md-sys-color-surface)',
                transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)'
            }}
        >
            <Group justify="space-between" align="center" w="100%">
                <Group gap="md" style={{ flex: 1, minWidth: 0 }}>
                    <Box
                        w={40}
                        h={40}
                        style={{
                            borderRadius: 'var(--md-radius-md)',
                            backgroundColor: 'var(--md-sys-color-surface-variant)',
                            flexShrink: 0
                        }}
                    />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Box mb={4}>
                            <Skeleton height={20} width="60%" radius="sm" />
                        </Box>
                        
                        <Group gap="sm">
                            <Skeleton height={16} width={80} radius="sm" />
                            <Skeleton height={16} width={100} radius="sm" />
                        </Group>
                    </div>
                </Group>
                
                <Group gap="md" align="center">
                    <Skeleton height={24} width={80} radius="sm" />
                    <Group gap="xs">
                        <Skeleton height={32} width={32} radius="sm" />
                        <Skeleton height={32} width={32} radius="sm" />
                    </Group>
                </Group>
            </Group>
        </Box>
    )
}

/**
 * Empty State Component with Material Design styling
 * Shows when no data exists for selected date
 */
interface EmptyStateProps {
    title?: string
    description?: string
    action?: ReactNode
    icon?: ReactNode
}

export function EmptyState({
    title = 'No Data Found',
    description = 'Try selecting a different date or add some expenses to get started.',
    action,
    icon
}: EmptyStateProps) {
    return (
        <Center py="xl">
            <Stack align="center" gap="md">
                <ThemeIcon 
                    size={80} 
                    radius="xl" 
                    variant="light" 
                    style={{
                        backgroundColor: 'var(--md-sys-color-surface-variant)',
                        color: 'var(--md-sys-color-on-surface-variant)'
                    }}
                >
                    {icon || <IconInbox size={40} />}
                </ThemeIcon>
                <Stack align="center" gap="xs">
                    <Text 
                        size="lg" 
                        fw={500} 
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    >
                        {title}
                    </Text>
                    <Text 
                        size="sm" 
                        style={{ 
                            color: 'var(--md-sys-color-on-surface-variant)',
                            maxWidth: 400,
                            textAlign: 'center'
                        }}
                    >
                        {description}
                    </Text>
                </Stack>
                {action}
            </Stack>
        </Center>
    )
}

/**
 * Loading Spinner with Material Design styling
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeMap = {
        sm: 20,
        md: 32,
        lg: 48
    }
    
    return (
        <Center>
            <Box
                w={sizeMap[size]}
                h={sizeMap[size]}
                style={{
                    border: '3px solid var(--md-sys-color-surface-variant)',
                    borderTop: '3px solid var(--md-sys-color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}
            />
        </Center>
    )
}

/**
 * Material Design Pulse Skeleton for interactive elements
 */
export function PulseSkeleton({ width = '100%', height = 40 }: { width?: string | number; height?: number }) {
    return (
        <Box
            w={width}
            h={height}
            style={{
                backgroundColor: 'var(--md-sys-color-surface-variant)',
                borderRadius: 'var(--md-radius-md)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
        />
    )
}

/**
 * Date Error Boundary
 */
export function DateErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <div>
            {children}
        </div>
    )
}

// Add CSS animations to the global styles
const style = document.createElement('style')
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
`
document.head.appendChild(style)
