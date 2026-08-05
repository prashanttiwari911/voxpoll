/**
 * src/lib/validations.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Central Zod schema library for VoTI.
 * All server actions and API routes import from here — no ad-hoc validation.
 * Written for Zod v4 API.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------
export const VALID_CATEGORIES = [
  "EDUCATION",
  "SPORTS",
  "POLITICS",
  "BOOKS",
  "TECHNOLOGY",
  "HEALTH",
  "OTHER",
] as const;

export const VALID_POLL_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED"] as const;
export const VALID_ROLES = ["USER", "ADMIN", "MODERATOR"] as const;
export const VALID_NOTIFICATION_TYPES = [
  "VOTE",
  "COMMENT",
  "REPLY",
  "LIKE",
  "SYSTEM",
] as const;

// ---------------------------------------------------------------------------
// User / Profile
// ---------------------------------------------------------------------------
export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer.")
    .regex(
      /^[\p{L}\p{M} '.,\-]{1,100}$/u,
      "Name may only contain letters, spaces, apostrophes, hyphens, and dots."
    )
    .optional()
    .or(z.literal("")),
  age: z
    .number({ message: "Age must be a number." })
    .int("Age must be a whole number.")
    .min(1, "Age must be at least 1.")
    .max(120, "Age must be 120 or fewer.")
    .nullable()
    .optional(),
  address: z
    .string()
    .max(200, "Address must be 200 characters or fewer.")
    .nullable()
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required.")
    .max(30, "Tag must be 30 characters or fewer.")
    .toLowerCase()
    .regex(
      /^[a-z0-9\-]+$/,
      "Tags may only contain lowercase letters, numbers, and hyphens."
    ),
});

export type TagInput = z.infer<typeof tagSchema>;

// ---------------------------------------------------------------------------
// Poll
// ---------------------------------------------------------------------------
export const pollSchema = z.object({
  question: z
    .string()
    .min(5, "Question must be at least 5 characters long.")
    .max(300, "Question must be 300 characters or fewer."),
  description: z
    .string()
    .max(1000, "Description must be 1 000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  category: z.enum(VALID_CATEGORIES, {
    message: "Please select a valid category.",
  }),
  options: z
    .array(z.string().min(1).max(150, "Each option must be 150 characters or fewer."))
    .min(2, "You must provide at least 2 voting choices.")
    .max(10, "A poll may have at most 10 options."),
  closesAt: z
    .string()
    .datetime({ message: "Closing date must be a valid ISO date-time." })
    .refine((v) => new Date(v) > new Date(), {
      message: "Closing date must be in the future.",
    })
    .optional()
    .or(z.literal("")),
  scheduledAt: z
    .string()
    .datetime({ message: "Scheduled date must be a valid ISO date-time." })
    .refine((v) => new Date(v) > new Date(), {
      message: "Scheduled date must be in the future.",
    })
    .optional()
    .or(z.literal("")),
  isMultipleChoice: z.boolean().default(false),
  maxChoices: z.number()
    .int()
    .min(2, "Max choices must be at least 2.")
    .max(10, "Max choices cannot exceed 10.")
    .optional(),
  imageUrl: z
    .string()
    .url("Image URL must be a valid URL.")
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string().max(30)).max(5, "A poll may have at most 5 tags.").optional(),
  status: z.enum(VALID_POLL_STATUSES).default("PUBLISHED"),
});

export type PollInput = z.infer<typeof pollSchema>;

// Partial version for updates (edit form)
export const pollUpdateSchema = pollSchema
  .pick({ question: true, description: true, closesAt: true, imageUrl: true })
  .partial();

export type PollUpdateInput = z.infer<typeof pollUpdateSchema>;

// ---------------------------------------------------------------------------
// Vote
// ---------------------------------------------------------------------------
export const voteSchema = z.object({
  pollId: z.string().min(1, "Invalid poll ID."),
  optionIds: z
    .array(z.string().min(1, "Invalid option ID."))
    .min(1, "You must select at least one option.")
    .max(10, "You cannot select more than 10 options."),
});

export type VoteInput = z.infer<typeof voteSchema>;

// ---------------------------------------------------------------------------
// Comment
// ---------------------------------------------------------------------------
export const commentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(500, "Comment must be 500 characters or fewer."),
  parentId: z.string().min(1).optional(),
});

export type CommentInput = z.infer<typeof commentSchema>;

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------
export const notificationSchema = z.object({
  userId: z.string().min(1, "Invalid user ID."),
  type: z.enum(VALID_NOTIFICATION_TYPES),
  message: z.string().min(1).max(300),
  pollId: z.string().min(1).optional(),
});

export type NotificationInput = z.infer<typeof notificationSchema>;

// ---------------------------------------------------------------------------
// AuditLog
// ---------------------------------------------------------------------------
export const auditLogSchema = z.object({
  userId: z.string().min(1).optional(),
  action: z.string().min(1).max(80),
  entity: z.string().min(1).max(50),
  entityId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
});

export type AuditLogInput = z.infer<typeof auditLogSchema>;
