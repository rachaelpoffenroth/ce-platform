import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Mail, Calendar, BookOpen, Trophy } from "lucide-react";
import { useState } from "react";
import type { User, Enrollment } from "@shared/schema";

export default function Students() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["/api/enrollments/instructor"],
  });

  const enrollmentsTyped = enrollments as (Enrollment & { user: User; course: { title: string } })[];

  // Filter enrollments based on search term
  const filteredEnrollments = enrollmentsTyped.filter((enrollment) => 
    enrollment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
            <h1 className="text-3xl font-bold" data-testid="heading-students">Students</h1>
            <p className="text-muted-foreground">View and manage your enrolled students</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{filteredEnrollments.length}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-students"
          />
        </div>

        {filteredEnrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No students found" : "No students enrolled yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : "Students will appear here when they enroll in your courses"
                }
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment: Enrollment & { user: User; course: { title: string } }) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow" data-testid={`card-student-${enrollment.id}`}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={enrollment.user?.profileImageUrl} />
                      <AvatarFallback data-testid={`avatar-${enrollment.user?.id}`}>
                        {enrollment.user?.firstName?.[0]}{enrollment.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`text-student-name-${enrollment.id}`}>
                        {enrollment.user?.firstName} {enrollment.user?.lastName}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        {enrollment.user?.email}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Course Enrolled
                      </div>
                      <Badge variant="outline" data-testid={`badge-course-${enrollment.id}`}>
                        {enrollment.course?.title || 'Course'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        Enrolled
                      </div>
                      <span className="text-sm">
                        {new Date(enrollment.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    {enrollment.completedAt && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Trophy className="mr-2 h-4 w-4" />
                          Completed
                        </div>
                        <span className="text-sm">
                          {new Date(enrollment.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-semibold">{enrollment.progress || 0}%</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
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