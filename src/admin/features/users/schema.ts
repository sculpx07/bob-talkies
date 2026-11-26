import { z } from 'zod'

// Same rules as the backend (bob-admin src/validators/auth.validator.js).
export const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number')

export const staffSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  role: z.string().min(1, 'Choose a role'),
})
export type StaffFormValues = z.infer<typeof staffSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ['newPassword'], message: 'Choose a password different from the current one' })
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
