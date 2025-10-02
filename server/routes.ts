import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { generateCourseWithAI, generateSlidesFromText } from "./services/openai";
import { extractAndCloneVoice } from "./services/voiceCloning";
import { generateCertificate } from "./services/certificateGenerator";
import { generateAICSubmissionPDF } from "./services/aicSubmission";
import { insertCourseSchema, insertCourseModuleSchema, insertQuizSchema, insertEnrollmentSchema, insertQuizAttemptSchema, insertModuleProgressSchema, voiceCloneRequestSchema, slideGenerationRequestSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course routes
  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseData = insertCourseSchema.parse({
        ...req.body,
        instructorId: userId
      });
      
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error: any) {
      console.error("Error creating course:", error);
      res.status(400).json({ message: error.message || "Failed to create course" });
    }
  });

  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getPublishedCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getCoursesByInstructor(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.put('/api/courses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const course = await storage.getCourse(req.params.id);
      
      if (!course || course.instructorId !== userId) {
        return res.status(404).json({ message: "Course not found or access denied" });
      }

      const updates = insertCourseSchema.partial().parse(req.body);
      const updatedCourse = await storage.updateCourse(req.params.id, updates);
      res.json(updatedCourse);
    } catch (error: any) {
      console.error("Error updating course:", error);
      res.status(400).json({ message: error.message || "Failed to update course" });
    }
  });

  // AI Course Generation
  app.post('/api/courses/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, courseTitle, courseDescription, duration, accreditationType, accreditationClass } = req.body;

      console.log('=== COURSE GENERATION REQUEST ===');
      console.log('courseTitle:', courseTitle);
      console.log('courseDescription:', courseDescription);
      console.log('content length:', content?.length);

      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }

      const generatedCourse = await generateCourseWithAI({
        content,
        courseTitle,
        courseDescription,
        duration: duration || 60,
        accreditationType: accreditationType || "AIC",
        accreditationClass: accreditationClass || "General"
      });

      const courseData = insertCourseSchema.parse({
        ...generatedCourse,
        instructorId: userId,
        status: "draft"
      });

      const course = await storage.createCourse(courseData);
      
      // Create modules and quizzes
      if (generatedCourse.modules) {
        for (let i = 0; i < generatedCourse.modules.length; i++) {
          const moduleData = insertCourseModuleSchema.parse({
            ...generatedCourse.modules[i],
            courseId: course.id,
            order: i + 1
          });
          const module = await storage.createCourseModule(moduleData);

          // Create quiz for each module
          if (generatedCourse.modules[i].quiz) {
            const quizData = insertQuizSchema.parse({
              ...generatedCourse.modules[i].quiz,
              courseId: course.id,
              moduleId: module.id,
              order: i + 1
            });
            await storage.createQuiz(quizData);
          }
        }
      }

      res.json(course);
    } catch (error: any) {
      console.error("Error generating course:", error);
      res.status(500).json({ message: error.message || "Failed to generate course" });
    }
  });

  // Voice Cloning - SECURITY FIXED: Added URL validation to prevent SSRF attacks
  app.post('/api/voice/clone', isAuthenticated, async (req: any, res) => {
    try {
      // Validate request using Zod schema to prevent SSRF attacks
      const validation = voiceCloneRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessages = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: errorMessages 
        });
      }

      const { videoUrl } = validation.data;
      
      // Additional runtime security check for URLs
      if (videoUrl.startsWith('http')) {
        const url = new URL(videoUrl);
        
        // Block private IP ranges to prevent internal network access
        const hostname = url.hostname;
        if (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.') ||
          hostname === '0.0.0.0'
        ) {
          return res.status(400).json({ message: "Access to private networks is not allowed" });
        }
        
        // Only allow googleapis.com for object storage
        if (hostname !== 'storage.googleapis.com') {
          return res.status(400).json({ message: "Only object storage URLs are allowed" });
        }
      }

      const voiceCloneUrl = await extractAndCloneVoice(videoUrl);
      res.json({ voiceCloneUrl });
    } catch (error: any) {
      console.error("Error cloning voice:", error);
      res.status(500).json({ message: error.message || "Failed to clone voice" });
    }
  });

  // Enrollments
  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.body;

      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const enrollmentData = insertEnrollmentSchema.parse({
        studentId: userId,
        courseId,
        purchaseAmount: course.price,
        expiresAt: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
      });

      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error: any) {
      console.error("Error creating enrollment:", error);
      res.status(400).json({ message: error.message || "Failed to enroll" });
    }
  });

  app.get('/api/enrollments/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getEnrollmentsByStudent(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.get('/api/enrollments/instructor', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getCoursesByInstructor(userId);
      const allEnrollments = [];
      
      for (const course of courses) {
        const enrollments = await storage.getEnrollmentsByCourse(course.id);
        // Add course and user data to enrollments
        for (const enrollment of enrollments) {
          const student = await storage.getUser(enrollment.studentId);
          allEnrollments.push({
            ...enrollment,
            course: { title: course.title },
            user: student
          });
        }
      }
      
      res.json(allEnrollments);
    } catch (error) {
      console.error("Error fetching instructor enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Quiz Attempts
  app.post('/api/quiz-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { enrollmentId, quizId, answers } = req.body;

      // Verify enrollment belongs to user
      const enrollment = await storage.getEnrollment(userId, req.body.courseId);
      if (!enrollment || enrollment.id !== enrollmentId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Calculate score
      const questions = quiz.questions as any[];
      let correctAnswers = 0;
      
      questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / questions.length) * 100;
      const passed = score >= (quiz.passingScore || 75);

      const attemptData = insertQuizAttemptSchema.parse({
        enrollmentId,
        quizId,
        answers,
        score,
        passed
      });

      const attempt = await storage.createQuizAttempt(attemptData);
      res.json(attempt);
    } catch (error: any) {
      console.error("Error creating quiz attempt:", error);
      res.status(400).json({ message: error.message || "Failed to submit quiz" });
    }
  });

  // Module Progress
  app.post('/api/module-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { enrollmentId, moduleId, completed, timeSpent, lastPosition } = req.body;

      // Verify enrollment belongs to user
      const enrollment = await storage.getEnrollment(userId, req.body.courseId);
      if (!enrollment || enrollment.id !== enrollmentId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const progressData = insertModuleProgressSchema.parse({
        enrollmentId,
        moduleId,
        completed,
        timeSpent,
        lastPosition,
        completedAt: completed ? new Date() : undefined
      });

      const progress = await storage.createOrUpdateModuleProgress(progressData);
      res.json(progress);
    } catch (error: any) {
      console.error("Error updating module progress:", error);
      res.status(400).json({ message: error.message || "Failed to update progress" });
    }
  });

  // Certificates
  app.post('/api/certificates/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { enrollmentId } = req.body;

      // Verify enrollment and completion
      const enrollment = await storage.getEnrollment(userId, req.body.courseId);
      if (!enrollment || enrollment.id !== enrollmentId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (enrollment.status !== "completed") {
        return res.status(400).json({ message: "Course not completed" });
      }

      // Check if certificate already exists
      const existingCertificate = await storage.getCertificateByEnrollment(enrollmentId);
      if (existingCertificate) {
        return res.json(existingCertificate);
      }

      const course = await storage.getCourse(enrollment.courseId);
      const user = await storage.getUser(userId);

      if (!course || !user) {
        return res.status(404).json({ message: "Course or user not found" });
      }

      const certificateUrl = await generateCertificate({
        user,
        course,
        enrollment,
        isAICCompliant: course.accreditationType === "AIC"
      });

      const certificateData = {
        enrollmentId,
        studentId: userId,
        courseId: enrollment.courseId,
        certificateNumber: `CERT-${Date.now()}`,
        certificateUrl,
        aicCompliant: course.accreditationType === "AIC",
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      };

      const certificate = await storage.createCertificate(certificateData);
      res.json(certificate);
    } catch (error: any) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ message: error.message || "Failed to generate certificate" });
    }
  });

  app.get('/api/certificates/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const certificates = await storage.getCertificatesByStudent(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // AIC Submission PDF Generation
  app.post('/api/aic-submission', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.body;

      const course = await storage.getCourse(courseId);
      if (!course || course.instructorId !== userId) {
        return res.status(404).json({ message: "Course not found or access denied" });
      }

      const modules = await storage.getCourseModules(courseId);
      const quizzes = await storage.getQuizzesByCourse(courseId);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const submissionPdfUrl = await generateAICSubmissionPDF({
        course,
        modules,
        quizzes,
        instructor: user
      });

      await storage.updateCourse(courseId, {
        aicSubmissionPdfUrl: submissionPdfUrl,
        aicSubmissionStatus: "submitted"
      });

      res.json({ submissionPdfUrl });
    } catch (error: any) {
      console.error("Error generating AIC submission:", error);
      res.status(500).json({ message: error.message || "Failed to generate AIC submission" });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, courseId } = req.body;
      
      if (!amount || amount < 50) { // Minimum 50 cents
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "cad", // Canadian dollars for Alberta
        metadata: {
          courseId: courseId || ""
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Object storage routes for course materials
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(403);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/course-materials", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { materialUrl, courseId } = req.body;

      if (!materialUrl || !courseId) {
        return res.status(400).json({ error: "materialUrl and courseId are required" });
      }

      // Verify course ownership
      const course = await storage.getCourse(courseId);
      if (!course || course.instructorId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        materialUrl,
        {
          owner: userId,
          visibility: "private", // Course materials are private
        },
      );

      res.json({ objectPath });
    } catch (error) {
      console.error("Error setting course material:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Slide Generation - SECURITY IMPROVED: Added proper validation with bounds checking
  app.post('/api/slides/generate', isAuthenticated, async (req: any, res) => {
    try {
      // Validate request using Zod schema with proper bounds checking
      const validation = slideGenerationRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        const errorMessages = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: errorMessages 
        });
      }

      const { text, slideCount } = validation.data;
      
      const slides = await generateSlidesFromText(text, slideCount);
      res.json({ slides });
    } catch (error: any) {
      console.error("Error generating slides:", error);
      res.status(500).json({ message: error.message || "Failed to generate slides" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/instructor', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getCoursesByInstructor(userId);
      
      let totalStudents = 0;
      let totalRevenue = 0;
      let totalCompletions = 0;
      let totalEnrollments = 0;
      
      const monthlyData = Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'short' }),
        enrollments: 0,
        revenue: 0
      }));

      for (const course of courses) {
        const enrollments = await storage.getEnrollmentsByCourse(course.id);
        totalEnrollments += enrollments.length;
        
        for (const enrollment of enrollments) {
          totalStudents++;
          if (enrollment.purchaseAmount) {
            totalRevenue += parseFloat(enrollment.purchaseAmount);
          }
          if (enrollment.status === 'completed') {
            totalCompletions++;
          }
          
          // Add to monthly data (simplified - random distribution for demo)
          const monthIndex = Math.floor(Math.random() * 6);
          monthlyData[monthIndex].enrollments += 1;
          if (enrollment.purchaseAmount) {
            monthlyData[monthIndex].revenue += parseFloat(enrollment.purchaseAmount);
          }
        }
      }
      
      const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
      
      const analyticsData = {
        totalCourses: courses.length,
        totalStudents,
        totalRevenue,
        completionRate,
        monthlyEnrollments: monthlyData,
        revenueByMonth: monthlyData.map(item => ({
          month: item.month,
          revenue: item.revenue
        })),
        coursePerformance: courses.slice(0, 4).map(course => ({
          name: course.title,
          students: Math.floor(Math.random() * 50) + 10,
          completion: Math.floor(Math.random() * 30) + 70
        })),
        coursesStatus: [
          { name: 'Published', value: courses.filter(c => c.status === 'published').length, color: '#10b981' },
          { name: 'Draft', value: courses.filter(c => c.status === 'draft').length, color: '#f59e0b' }
        ]
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching instructor analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
