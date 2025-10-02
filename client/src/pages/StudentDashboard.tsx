import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  Play,
  CheckCircle,
  Calendar,
  Trophy,
  TrendingUp,
  Tag,
  Eye,
  ShoppingCart
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Course, Enrollment, Certificate as CertificateType } from "@shared/schema";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments/my"],
  });

  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ["/api/certificates/my"],
  });

  const { data: availableCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest("POST", "/api/enrollments", { courseId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in the course!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/my"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter and sort courses
  const filteredCourses = availableCourses
    .filter((course: Course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || 
        course.accreditationClass?.toLowerCase() === filterCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a: Course, b: Course) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "duration":
          return (a.duration || 0) - (b.duration || 0);
        default:
          return 0;
      }
    });

  const stats = {
    totalEnrollments: enrollments.length,
    completedCourses: enrollments.filter((e: Enrollment) => e.status === "completed").length,
    certificates: certificates.length,
    totalHours: enrollments.reduce((sum: number, enrollment: Enrollment) => {
      return sum + (enrollment.course?.duration || 0);
    }, 0) / 60,
    averageProgress: enrollments.length > 0 
      ? enrollments.reduce((sum: number, e: Enrollment) => sum + (e.progress || 0), 0) / enrollments.length
      : 0
  };

  if (enrollmentsLoading || certificatesLoading || coursesLoading) {
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
              Continue your learning journey and earn valuable certifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Trophy className="h-4 w-4 mr-1" />
              {stats.certificates} Certificates
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card data-testid="stat-enrollments">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                  <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-completed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedCourses}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-hours">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Learning Hours</p>
                  <p className="text-2xl font-bold">{Math.round(stats.totalHours)}</p>
                </div>
                <Clock className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-progress">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-courses" data-testid="tab-my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="browse" data-testid="tab-browse">Browse Courses</TabsTrigger>
            <TabsTrigger value="certificates" data-testid="tab-certificates">Certificates</TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="my-courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Courses */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Continue Learning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enrollments.slice(0, 3).map((enrollment: Enrollment) => {
                        const course = enrollment.course as Course;
                        if (!course) return null;

                        return (
                          <div key={enrollment.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{course.title}</h4>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant={enrollment.status === "completed" ? "default" : "secondary"}>
                                  {enrollment.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {course.duration} min
                                </span>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-muted-foreground">Progress</span>
                                  <span className="text-xs font-medium">{Math.round(enrollment.progress || 0)}%</span>
                                </div>
                                <Progress value={enrollment.progress || 0} className="h-2" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Link href={`/course/${course.id}`}>
                                <Button size="sm" data-testid={`button-continue-${course.id}`}>
                                  {enrollment.status === "completed" ? "Review" : "Continue"}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                      
                      {enrollments.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No courses enrolled yet</p>
                          <Button variant="outline" className="mt-4" onClick={() => {
                            const browseCourses = document.querySelector('[data-testid="tab-browse"]') as HTMLElement;
                            browseCourses?.click();
                          }}>
                            Browse Courses
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hours Learned</span>
                        <span className="font-medium">2.5h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Modules Completed</span>
                        <span className="font-medium">7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Quiz Average</span>
                        <span className="font-medium flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          87%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Achievement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                      <h4 className="font-semibold">Course Completed!</h4>
                      <p className="text-sm text-muted-foreground">Risk Management Fundamentals</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Browse Courses Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-courses"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[200px]" data-testid="select-filter-category">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General Insurance</SelectItem>
                      <SelectItem value="life">Life Insurance</SelectItem>
                      <SelectItem value="a&s">Accident & Sickness</SelectItem>
                      <SelectItem value="adjusters">Adjusters</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px]" data-testid="select-sort-by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course: Course) => {
                const isEnrolled = enrollments.some((e: Enrollment) => e.courseId === course.id);
                
                return (
                  <Card key={course.id} className="hover:shadow-md transition-shadow" data-testid={`course-card-${course.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant={course.accreditationType === "AIC" ? "default" : "secondary"}>
                          {course.accreditationType}
                        </Badge>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">${course.price}</p>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration} min
                        </span>
                        <span>{course.accreditationClass}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEnrolled ? (
                          <Link href={`/course/${course.id}`} className="flex-1">
                            <Button variant="outline" className="w-full" data-testid={`button-view-enrolled-${course.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Course
                            </Button>
                          </Link>
                        ) : (
                          <>
                            <Link href={`/course/${course.id}`} className="flex-1">
                              <Button variant="outline" className="w-full" data-testid={`button-preview-${course.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                            </Link>
                            <Button
                              onClick={() => enrollMutation.mutate(course.id)}
                              disabled={enrollMutation.isPending}
                              data-testid={`button-enroll-${course.id}`}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Enroll
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredCourses.length === 0 && (
              <Card className="text-center p-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No Courses Found</h2>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse all available courses.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Your Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate: CertificateType) => (
                    <div
                      key={certificate.id}
                      className="p-6 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`certificate-${certificate.id}`}
                    >
                      <div className="text-center">
                        <Tag className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                        <h4 className="font-semibold text-foreground mb-2">
                          {certificate.course?.title || "Course Tag"}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {certificate.aicCompliant && (
                            <Badge variant="default">AIC Compliant</Badge>
                          )}
                          <Badge variant="outline">
                            {certificate.course?.accreditationHours || 1}h Credit
                          </Badge>
                        </div>
                        <Button variant="outline" className="w-full" data-testid={`button-download-cert-${certificate.id}`}>
                          Download Tag
                        </Button>
                      </div>
                    </div>
                  ))}

                  {certificates.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Tag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No certificates earned yet</p>
                      <p className="text-xs mt-1">Complete courses to earn certificates</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
