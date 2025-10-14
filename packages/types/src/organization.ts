import { z } from 'zod';

// ============================================
// ORGANIZATION SCHEMAS
// ============================================

export const BillingPlanSchema = z.enum(['free', 'pro', 'business', 'enterprise']);
export type BillingPlan = z.infer<typeof BillingPlanSchema>;

export const OrgSettingsSchema = z.object({
  logo: z.string().url().nullable().optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  domains: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});
export type OrgSettings = z.infer<typeof OrgSettingsSchema>;

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  billingPlan: BillingPlanSchema,
  seatsMax: z.number().int().positive(),
  seatsUsed: z.number().int().nonnegative(),
  settings: OrgSettingsSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const CreateOrgDtoSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
});
export type CreateOrgDto = z.infer<typeof CreateOrgDtoSchema>;

export const UpdateOrgDtoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  settings: OrgSettingsSchema.optional(),
});
export type UpdateOrgDto = z.infer<typeof UpdateOrgDtoSchema>;

// ============================================
// TEAM & INVITATIONS
// ============================================

export const InvitationStatusSchema = z.enum(['pending', 'accepted', 'expired', 'cancelled']);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

export const InvitationSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'collaborator', 'viewer']),
  invitedBy: z.string().uuid(),
  status: InvitationStatusSchema,
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
});
export type Invitation = z.infer<typeof InvitationSchema>;

export const InviteMemberDtoSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'collaborator', 'viewer']),
});
export type InviteMemberDto = z.infer<typeof InviteMemberDtoSchema>;
