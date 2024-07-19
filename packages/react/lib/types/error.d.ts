export type ErrorConfig = Record<string, unknown>

export type ErrorState = Record<string, unknown> & { error?: Error }

export type ErrorContext = ErrorState & { setError: (error: Error) => void; clearError: () => void }
