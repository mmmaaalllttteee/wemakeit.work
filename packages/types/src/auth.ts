import { z } from 'zod';

// ============================================
// USER & AUTH SCHEMAS
// ============================================

export const UserRoleSchema = z.enum(['owner', 'admin', 'editor', 'collaborator', 'viewer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(['active', 'inactive', 'invited', 'suspended']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UserPreferencesSchema = z.object({
  themeMode: z.enum(['light', 'dark', 'auto']).default('auto'),
  timezone: z.string().optional(),
  locale: z.string().default('en'),
  emailNotifications: z.boolean().default(true),
  desktopNotifications: z.boolean().default(true),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  avatar: z.string().url().nullable().optional(),
  orgId: z.string().uuid(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  preferences: UserPreferencesSchema.optional(),
  twofaEnabled: z.boolean().default(false),
  twofaSecret: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

// Auth DTOs
export const RegisterDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(255),
  organizationName: z.string().min(1).max(255),
});
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  twofaCode: z.string().length(6).optional(),
});
export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const ForgotPasswordDtoSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;

export const ResetPasswordDtoSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;
