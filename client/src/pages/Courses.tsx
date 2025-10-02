import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { BookOpen, Users, Clock, DollarSign, Eye, Edit, Trash2 } from "lucide-react";
import type { Course } from "@shared/schema";

export default function Courses() {
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses/my"],
  });

  const coursesTyped = courses as Course[];

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardHeader>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-courses">My Courses</h1>
            <p className="text-muted-foreground">Manage and view all your courses</p>
          </div>
          <Link href="/create-course">
            <Button data-testid="button-create-course">
              <BookOpen className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>

        {coursesTyped.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Create your first course to get started with EduFlow AI
              </p>
              <Link href="/create-course">
                <Button data-testid="button-create-first-course">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesTyped.map((course: Course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow" data-testid={`card-course-${course.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2" data-testid={`text-course-title-${course.id}`}>
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {course.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={course.status === 'published' ? 'default' : 'secondary'}
                      data-testid={`badge-status-${course.id}`}
                    >
                      {course.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {course.duration} min
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        ${course.price}
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        0 enrolled
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t">
                      <Link href={`/course/${course.id}`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-${course.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <div className="flex space-x-2">
                        <Link href={`/create-course?edit=${course.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-${course.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-${course.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}