import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/admin/auth/AuthProvider'
import { Button, FormField, Input, LoadingBlock } from '@/admin/components/ui'
import { BRAND } from '@/admin/components/layout/nav'
import { ApiError, errorMessage } from '@/admin/lib/api/errors'

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { status, signIn, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => { document.title = 'Sign in · BOB Talkies Admin' }, [])

  if (status === 'loading') return <LoadingBlock className="min-h-screen" />
  if (status === 'authenticated') return <Navigate to={from} replace />

  const onSubmit = async (values: FormValues) => {
    setFormError('')
    try {
      await signIn(values.email, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        Object.entries(err.fieldErrors).forEach(([field, message]) => {
          if (field === 'email' || field === 'password') setError(field, { message })
        })
      } else {
        setFormError(errorMessage(err))
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={BRAND.logo} alt={BRAND.name} className="mb-4 h-14 w-auto max-w-[10rem] object-contain" />
          <h1 className="text-xl font-semibold text-slate-900">Sign in to {BRAND.name} Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Staff access only</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {(formError || sessionExpired) && (
            <div role="alert" className={formError ? 'rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700' : 'rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800'}>
              {formError || 'Your session ended. Please sign in again.'}
            </div>
          )}

          <FormField label="Email" error={errors.email?.message}>
            {(field) => (
              <Input {...field} type="email" autoComplete="username" autoFocus placeholder="you@bobtalkies.com" leading={<Mail className="h-4 w-4" />} {...register('email')} />
            )}
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            {(field) => (
              <Input
                {...field}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                leading={<Lock className="h-4 w-4" />}
                trailing={
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="focus-ring rounded text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register('password')}
              />
            )}
          </FormField>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>Sign in</Button>
        </form>
      </div>
    </div>
  )
}
