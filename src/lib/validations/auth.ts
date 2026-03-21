import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const otpSchema = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit code')

export const enable2FASchema = z.object({
  otp: otpSchema,
})

export const verify2FASchema = z.object({
  otp: otpSchema,
})

export const acceptInviteSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    token: z.string().min(1, 'Invite token is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
})

export const verifyResetOtpSchema = z.object({
  email: z.email('Please enter a valid email address'),
  otp: otpSchema,
})

export const resetPasswordSchema = z
  .object({
    resetToken: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export type LoginSchema = z.infer<typeof loginSchema>
export type Enable2FASchema = z.infer<typeof enable2FASchema>
export type Verify2FASchema = z.infer<typeof verify2FASchema>
export type AcceptInviteSchema = z.infer<typeof acceptInviteSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type VerifyResetOtpSchema = z.infer<typeof verifyResetOtpSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
