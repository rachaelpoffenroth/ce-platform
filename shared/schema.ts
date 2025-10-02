import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Additional fields for course creators
  companyName: varchar("company_name"),
  ciprNumber: varchar("cipr_number"),
  address: text("address"),
  city: varchar("city"),
  province: varchar("province"),
  postalCode: varchar("postal_code"),
  country: varchar("country").default("Canada"),
  // Payment fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  role: varchar("role").default("student"), // student, instructor, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructorId: varchar("instructor_id").notNull().references(() => users.id),
  content: jsonb("content"), // Course structure, slides, etc.
  duration: integer("duration"), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }),
  accreditationType: varchar("accreditation_type"), // AIC, General, etc.
  accreditationHours: decimal("accreditation_hours", { precision: 3, scale: 1 }),
  accreditationClass: varchar("accreditation_class"), // Life, A&S, General, Adjusters
  passPercentage: integer("pass_percentage").default(75),
  status: varchar("status").default("draft"), // draft, published, archived
  voiceCloneUrl: varchar("voice_clone_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  aicCourseId: varchar("aic_course_id"), // AIC assigned course ID
  aicSubmissionStatus: varchar("aic_submission_status").default("pending"), // pending, submitted, approved, rejected
  aicSubmissionPdfUrl: varchar("aic_submission_pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course modules/sections
export const courseModules = pgTable("course_modules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: jsonb("content"), // Module content, slides, etc.
  order: integer("order").notNull(),
  duration: integer("duration"), // in minutes
  videoUrl: varchar("video_url"),
  audioUrl: varchar("audio_url"),
  materialUrls: jsonb("material_urls"), // Array of file URLs
  createdAt: timestamp("created_at").defaultNow(),
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").references(() => courseModules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  questions: jsonb("questions").notNull(), // Array of question objects
  type: varchar("type").default("module"), // module, final, live_poll
  passingScore: integer("passing_score").default(75),
  order: integer("order"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student enrollments
export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  status: varchar("status").default("active"), // active, completed, expired
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"), // percentage
  purchaseAmount: decimal("purchase_amount", { precision: 10, scale: 2 }),
  expiresAt: timestamp("expires_at"), // 6-month expiry
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
  certificateUrl: varchar("certificate_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: uuid("enrollment_id").notNull().references(() => enrollments.id),
  quizId: uuid("quiz_id").notNull().references(() => quizzes.id),
  answers: jsonb("answers").notNull(), // Array of answer objects
  score: decimal("score", { precision: 5, scale: 2 }),
  passed: boolean("passed").default(false),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Module progress tracking
export const moduleProgress = pgTable("module_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: uuid("enrollment_id").notNull().references(() => enrollments.id),
  moduleId: uuid("module_id").notNull().references(() => courseModules.id),
  completed: boolean("completed").default(false),
  timeSpent: integer("time_spent").default(0), // in seconds
  lastPosition: integer("last_position").default(0), // video/audio position
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Certificates
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: uuid("enrollment_id").notNull().references(() => enrollments.id),
  studentId: varchar("student_id").notNull().references(() => users.id),
  courseId: uuid("course_id").notNull().references(() => courses.id),
  certificateNumber: varchar("certificate_number").notNull().unique(),
  certificateUrl: varchar("certificate_url").notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
  validUntil: timestamp("valid_until"),
  aicCompliant: boolean("aic_compliant").default(false),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  certificates: many(certificates),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  modules: many(courseModules),
  quizzes: many(quizzes),
  enrollments: many(enrollments),
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  quizzes: many(quizzes),
  progress: many(moduleProgress),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
  module: one(courseModules, {
    fields: [quizzes.moduleId],
    references: [courseModules.id],
  }),
  attempts: many(quizAttempts),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  quizAttempts: many(quizAttempts),
  moduleProgress: many(moduleProgress),
  certificates: many(certificates),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [quizAttempts.enrollmentId],
    references: [enrollments.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
}));

export const moduleProgressRelations = relations(moduleProgress, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [moduleProgress.enrollmentId],
    references: [enrollments.id],
  }),
  module: one(courseModules, {
    fields: [moduleProgress.moduleId],
    references: [courseModules.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [certificates.enrollmentId],
    references: [enrollments.id],
  }),
  student: one(users, {
    fields: [certificates.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = typeof courseModules.$inferInsert;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;
export type ModuleProgress = typeof moduleProgress.$inferSelect;

// ===============================
// Security Validation Schemas
// ===============================

// Voice cloning validation schema
export const voiceCloneRequestSchema = z.object({
  videoUrl: z.string()
    .min(1, "Video URL is required")
    .refine((url) => {
      // Allow local file paths for development
      if (!url.startsWith('http')) {
        return true;
      }
      
      // Allow any valid HTTP(S) URL for flexibility
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, "Must be a valid URL or file path")
});

// Slide generation validation schema
export const slideGenerationRequestSchema = z.object({
  text: z.string()
    .min(20, "Text content must be at least 20 characters")
    .max(10000, "Text content cannot exceed 10,000 characters")
    .trim(),
  slideCount: z.number()
    .int("Slide count must be a whole number")
    .min(3, "Must generate at least 3 slides")
    .max(25, "Cannot generate more than 25 slides")
    .default(8)
});

// Export validation types
export type VoiceCloneRequest = z.infer<typeof voiceCloneRequestSchema>;
export type SlideGenerationRequest = z.infer<typeof slideGenerationRequestSchema>;
export type InsertModuleProgress = typeof moduleProgress.$inferInsert;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Convert number to string for decimal fields
  price: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  accreditationHours: z.union([z.string(), z.number()]).transform((val) => val.toString()),
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  createdAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
});

export const insertModuleProgressSchema = createInsertSchema(moduleProgress).omit({
  id: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
});
