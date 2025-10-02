import {
  users,
  courses,
  courseModules,
  quizzes,
  enrollments,
  quizAttempts,
  moduleProgress,
  certificates,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type CourseModule,
  type InsertCourseModule,
  type Quiz,
  type InsertQuiz,
  type Enrollment,
  type InsertEnrollment,
  type QuizAttempt,
  type InsertQuizAttempt,
  type ModuleProgress,
  type InsertModuleProgress,
  type Certificate,
  type InsertCertificate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: string, info: { customerId: string; subscriptionId: string }): Promise<User>;

  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;

  // Course module operations
  createCourseModule(module: InsertCourseModule): Promise<CourseModule>;
  getCourseModules(courseId: string): Promise<CourseModule[]>;
  getCourseModule(id: string): Promise<CourseModule | undefined>;
  updateCourseModule(id: string, updates: Partial<InsertCourseModule>): Promise<CourseModule>;
  deleteCourseModule(id: string): Promise<void>;

  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuizzesByCourse(courseId: string): Promise<Quiz[]>;
  getQuizzesByModule(moduleId: string): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz>;
  deleteQuiz(id: string): Promise<void>;

  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollment(studentId: string, courseId: string): Promise<Enrollment | undefined>;
  getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  updateEnrollment(id: string, updates: Partial<InsertEnrollment>): Promise<Enrollment>;

  // Quiz attempt operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttempts(enrollmentId: string, quizId: string): Promise<QuizAttempt[]>;
  getBestQuizAttempt(enrollmentId: string, quizId: string): Promise<QuizAttempt | undefined>;

  // Module progress operations
  createOrUpdateModuleProgress(progress: InsertModuleProgress): Promise<ModuleProgress>;
  getModuleProgress(enrollmentId: string, moduleId: string): Promise<ModuleProgress | undefined>;
  getEnrollmentProgress(enrollmentId: string): Promise<ModuleProgress[]>;

  // Certificate operations
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificatesByStudent(studentId: string): Promise<Certificate[]>;
  getCertificateByEnrollment(enrollmentId: string): Promise<Certificate | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, info: { customerId: string; subscriptionId: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: info.customerId,
        stripeSubscriptionId: info.subscriptionId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Course operations
  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.instructorId, instructorId)).orderBy(desc(courses.createdAt));
  }

  async getPublishedCourses(): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.status, "published")).orderBy(desc(courses.createdAt));
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Course module operations
  async createCourseModule(module: InsertCourseModule): Promise<CourseModule> {
    const [newModule] = await db.insert(courseModules).values(module).returning();
    return newModule;
  }

  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    return db.select().from(courseModules).where(eq(courseModules.courseId, courseId)).orderBy(courseModules.order);
  }

  async getCourseModule(id: string): Promise<CourseModule | undefined> {
    const [module] = await db.select().from(courseModules).where(eq(courseModules.id, id));
    return module;
  }

  async updateCourseModule(id: string, updates: Partial<InsertCourseModule>): Promise<CourseModule> {
    const [module] = await db
      .update(courseModules)
      .set(updates)
      .where(eq(courseModules.id, id))
      .returning();
    return module;
  }

  async deleteCourseModule(id: string): Promise<void> {
    await db.delete(courseModules).where(eq(courseModules.id, id));
  }

  // Quiz operations
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.courseId, courseId)).orderBy(quizzes.order);
  }

  async getQuizzesByModule(moduleId: string): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.moduleId, moduleId)).orderBy(quizzes.order);
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz> {
    const [quiz] = await db
      .update(quizzes)
      .set(updates)
      .where(eq(quizzes.id, id))
      .returning();
    return quiz;
  }

  async deleteQuiz(id: string): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  // Enrollment operations
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getEnrollment(studentId: string, courseId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));
    return enrollment;
  }

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.studentId, studentId)).orderBy(desc(enrollments.createdAt));
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.courseId, courseId)).orderBy(desc(enrollments.createdAt));
  }

  async updateEnrollment(id: string, updates: Partial<InsertEnrollment>): Promise<Enrollment> {
    const [enrollment] = await db
      .update(enrollments)
      .set(updates)
      .where(eq(enrollments.id, id))
      .returning();
    return enrollment;
  }

  // Quiz attempt operations
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getQuizAttempts(enrollmentId: string, quizId: string): Promise<QuizAttempt[]> {
    return db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.enrollmentId, enrollmentId), eq(quizAttempts.quizId, quizId)))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async getBestQuizAttempt(enrollmentId: string, quizId: string): Promise<QuizAttempt | undefined> {
    const [attempt] = await db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.enrollmentId, enrollmentId), eq(quizAttempts.quizId, quizId)))
      .orderBy(desc(quizAttempts.score))
      .limit(1);
    return attempt;
  }

  // Module progress operations
  async createOrUpdateModuleProgress(progress: InsertModuleProgress): Promise<ModuleProgress> {
    const [existingProgress] = await db
      .select()
      .from(moduleProgress)
      .where(
        and(
          eq(moduleProgress.enrollmentId, progress.enrollmentId),
          eq(moduleProgress.moduleId, progress.moduleId)
        )
      );

    if (existingProgress) {
      const [updated] = await db
        .update(moduleProgress)
        .set(progress)
        .where(eq(moduleProgress.id, existingProgress.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(moduleProgress).values(progress).returning();
      return created;
    }
  }

  async getModuleProgress(enrollmentId: string, moduleId: string): Promise<ModuleProgress | undefined> {
    const [progress] = await db
      .select()
      .from(moduleProgress)
      .where(
        and(
          eq(moduleProgress.enrollmentId, enrollmentId),
          eq(moduleProgress.moduleId, moduleId)
        )
      );
    return progress;
  }

  async getEnrollmentProgress(enrollmentId: string): Promise<ModuleProgress[]> {
    return db.select().from(moduleProgress).where(eq(moduleProgress.enrollmentId, enrollmentId));
  }

  // Certificate operations
  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const [newCertificate] = await db.insert(certificates).values(certificate).returning();
    return newCertificate;
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate;
  }

  async getCertificatesByStudent(studentId: string): Promise<Certificate[]> {
    return db.select().from(certificates).where(eq(certificates.studentId, studentId)).orderBy(desc(certificates.issuedAt));
  }

  async getCertificateByEnrollment(enrollmentId: string): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.enrollmentId, enrollmentId));
    return certificate;
  }
}

export const storage = new DatabaseStorage();
