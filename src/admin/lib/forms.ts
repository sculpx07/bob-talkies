import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './api/errors'

type FieldMap = Record<string, string> | ((apiField: string) => string)

/**
 * Puts backend validation errors under the matching form fields.
 * `fieldMap` renames API fields to form fields, either as a table
 * ({ weekdayPricePaise: 'weekdayPrice' }) or a function (for nested paths such as
 * "variants.0.pricePaise" -> "variants.0.price"). A field matches when its first
 * segment is one of `knownFields`.
 * Returns the messages that matched no field, to show at the top of the form.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: ReadonlyArray<string>,
  fieldMap: FieldMap = {},
): string[] {
  if (!(error instanceof ApiError)) return [error instanceof Error ? error.message : 'Something went wrong']

  const rename = typeof fieldMap === 'function' ? fieldMap : (f: string) => fieldMap[f] ?? f
  const unmatched: string[] = []
  for (const [apiField, message] of Object.entries(error.fieldErrors)) {
    const field = rename(apiField)
    if (knownFields.includes(field.split('.')[0])) setError(field as Path<T>, { type: 'server', message })
    else unmatched.push(message)
  }
  if (!Object.keys(error.fieldErrors).length) unmatched.push(error.message)
  return unmatched
}
