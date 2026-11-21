/** Error body sent by the bob-admin backend. */
interface ErrorBody {
  success?: false
  code?: string
  message?: string
  details?: unknown
  fieldErrors?: Record<string, string>
}

/** Every failed API call is thrown as an ApiError. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromResponse(status: number, body: ErrorBody | null): ApiError {
    return new ApiError(
      status,
      body?.code ?? 'UNKNOWN_ERROR',
      body?.message ?? `Request failed (${status})`,
      body?.fieldErrors ?? {},
      body?.details,
    )
  }

  get isNetwork() {
    return this.status === 0
  }
}

/** A readable message for any thrown value. */
export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}
