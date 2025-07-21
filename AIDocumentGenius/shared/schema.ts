import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const processedResults = pgTable("processed_results", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => files.id).notNull(),
  type: text("type").notNull(), // 'summary', 'qa', 'math'
  question: text("question"), // for Q&A type
  result: text("result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

export const insertProcessedResultSchema = createInsertSchema(processedResults).omit({
  id: true,
  createdAt: true,
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertProcessedResult = z.infer<typeof insertProcessedResultSchema>;
export type ProcessedResult = typeof processedResults.$inferSelect;

// API request/response schemas
export const uploadFileSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  content: z.string(),
});

export const processDocumentSchema = z.object({
  fileId: z.number(),
  type: z.enum(['summary', 'qa', 'math']),
  question: z.string().optional(),
});

export const qaRequestSchema = z.object({
  fileId: z.number(),
  question: z.string().min(1),
});

export type UploadFileRequest = z.infer<typeof uploadFileSchema>;
export type ProcessDocumentRequest = z.infer<typeof processDocumentSchema>;
export type QARequest = z.infer<typeof qaRequestSchema>;

// AI Service Response Interfaces
export interface SummaryResult {
  summary: string;
}

export interface QAResult {
  answer: string;
  pageReference?: string;
}

export interface MathResult {
  mathSolution: string;
}
