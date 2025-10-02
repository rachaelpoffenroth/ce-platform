import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { Plus, BookOpen, Users, TrendingUp, Clock, Star, BarChart, Eye } from "lucide-react";
import { Link } from "wouter";
import type { Course, Enrollment } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses/my"],
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments/my"],
  });

  const isInstructor = user?.role === "instructor" || user?.role === "admin";
  
  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum: number, course: Course) => sum + (course.enrollments?.length || 0), 0),
    completionRate: enrollments.length > 0 ? 
      Math.round((enrollments.filter((e: Enrollment) => e.status === "completed").length / enrollments.length) * 100) : 0,
    avgRating: 4.8
  };

  if (coursesLoading || enrollmentsLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.firstName || user?.email}
            </h1>
            <p className="text-muted-foreground">
              {isInstructor ? "Manage your courses and track student progress" : "Continue your learning journey"}
            </p>
          </div>
          {isInstructor && (
            <Link href="/create-course">
              <Button size="lg" data-testid="button-create-course">
                <Plus className="mr-2 h-5 w-5" />
                Create New Course
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="stat-courses">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isInstructor ? "Total Courses" : "Enrolled Courses"}
                  </p>
                  <p className="text-2xl font-bold">{isInstructor ? stats.totalCourses : enrollments.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-students">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isInstructor ? "Total Students" : "Certificates Earned"}
                  </p>
                  <p className="text-2xl font-bold">
                    {isInstructor ? stats.totalStudents : enrollments.filter((e: Enrollment) => e.status === "completed").length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completion">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-rating">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">{stats.avgRating}</p>
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                </div>
                <BarChart className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity / Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {isInstructor ? "Recent Courses" : "My Courses"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isInstructor ? courses : enrollments).slice(0, 5).map((item: Course | Enrollment) => {
                  const course = 'course' in item ? item.course : item;
                  const enrollment = 'course' in item ? item : undefined;
                  
                  return (
                    <div key={course?.id || item.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{course?.title || 'Untitled Course'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={course?.status === "published" ? "default" : "secondary"}>
                            {course?.status || enrollment?.status || "draft"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {course?.duration || 60} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {enrollment && (
                          <div className="text-right">
                            <div className="text-sm font-medium">{Math.round(enrollment.progress || 0)}%</div>
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all" 
                                style={{ width: `${enrollment.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <Link href={`/course/${course?.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-view-course-${course?.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
                
                {(isInstructor ? courses : enrollments).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {isInstructor ? "No courses created yet" : "No courses enrolled yet"}
                    </p>
                    {isInstructor && (
                      <Link href="/create-course">
                        <Button variant="outline" className="mt-2" data-testid="button-create-first-course">
                          Create Your First Course
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isInstructor ? (
                  <>
                    <Link href="/create-course">
                      <Button variant="outline" className="w-full justify-start" data-testid="button-quick-create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Course
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-view-analytics">
                      <BarChart className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-manage-students">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Students
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/student">
                      <Button variant="outline" className="w-full justify-start" data-testid="button-browse-courses">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Browse Courses
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-view-certificates">
                      <Star className="mr-2 h-4 w-4" />
                      View Certificates
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-track-progress">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Track Progress
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AIC Compliance Status (for instructors) */}
        {isInstructor && (
          <Card>
            <CardHeader>
              <CardTitle>AIC Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.filter((course: Course) => course.accreditationType === "AIC").map((course: Course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Accreditation Class: {course.accreditationClass || "General"}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        course.aicSubmissionStatus === "approved" ? "default" :
                        course.aicSubmissionStatus === "submitted" ? "secondary" :
                        course.aicSubmissionStatus === "rejected" ? "destructive" :
                        "outline"
                      }
                    >
                      {course.aicSubmissionStatus || "pending"}
                    </Badge>
                  </div>
                ))}
                
                {courses.filter((course: Course) => course.accreditationType === "AIC").length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No AIC courses created yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
