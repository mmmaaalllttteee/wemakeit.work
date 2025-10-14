import { z } from 'zod';

// ============================================
// PROJECT SCHEMAS
// ============================================

export const ProjectStatusSchema = z.enum(['active', 'archived', 'completed']);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  status: ProjectStatusSchema,
  coverImage: z.string().url().nullable().optional(),
  ownerId: z.string().uuid(),
  settings: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectDtoSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});
export type CreateProjectDto = z.infer<typeof CreateProjectDtoSchema>;

export const UpdateProjectDtoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: ProjectStatusSchema.optional(),
  coverImage: z.string().url().nullable().optional(),
});
export type UpdateProjectDto = z.infer<typeof UpdateProjectDtoSchema>;

// ============================================
// BOARD SCHEMAS (Kanban)
// ============================================

export const BoardVisibilitySchema = z.enum(['private', 'team', 'public']);
export type BoardVisibility = z.infer<typeof BoardVisibilitySchema>;

export const BoardColumnSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  position: z.number(),
  color: z.string().optional(),
  wipLimit: z.number().int().positive().nullable().optional(),
});
export type BoardColumn = z.infer<typeof BoardColumnSchema>;

export const BoardSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  visibility: BoardVisibilitySchema,
  columns: z.array(BoardColumnSchema),
  templateId: z.string().uuid().nullable().optional(),
  shareToken: z.string().nullable().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Board = z.infer<typeof BoardSchema>;

export const CreateBoardDtoSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  visibility: BoardVisibilitySchema.optional(),
  templateId: z.string().uuid().optional(),
});
export type CreateBoardDto = z.infer<typeof CreateBoardDtoSchema>;

// ============================================
// TASK SCHEMAS
// ============================================

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'review', 'done']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const ChecklistItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  completed: z.boolean(),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  boardId: z.string().uuid(),
  columnId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  priority: TaskPrioritySchema,
  status: TaskStatusSchema,
  position: z.number(),
  labels: z.array(z.string()).optional(),
  checklist: z.array(ChecklistItemSchema).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskDtoSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  columnId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  priority: TaskPrioritySchema.optional(),
  labels: z.array(z.string()).optional(),
});
export type CreateTaskDto = z.infer<typeof CreateTaskDtoSchema>;

export const UpdateTaskDtoSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  priority: TaskPrioritySchema.optional(),
  labels: z.array(z.string()).optional(),
});
export type UpdateTaskDto = z.infer<typeof UpdateTaskDtoSchema>;

export const MoveTaskDtoSchema = z.object({
  columnId: z.string().uuid(),
  position: z.number(),
});
export type MoveTaskDto = z.infer<typeof MoveTaskDtoSchema>;

// ============================================
// COMMENT SCHEMAS
// ============================================

export const CommentSchema = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['task', 'project', 'file', 'moodboard_item']),
  entityId: z.string().uuid(),
  userId: z.string().uuid(),
  body: z.string().min(1),
  mentions: z.array(z.string().uuid()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Comment = z.infer<typeof CommentSchema>;

export const CreateCommentDtoSchema = z.object({
  body: z.string().min(1),
  mentions: z.array(z.string().uuid()).optional(),
});
export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;
