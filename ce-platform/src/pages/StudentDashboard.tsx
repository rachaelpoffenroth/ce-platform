import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileTextIcon,
  CalendarIcon,
  PlayIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  instructor: string;
  totalHours: number;
  completedHours: number;
  status: "in_progress" | "completed" | "not_started";
  dueDate?: string;
  coverImage: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real implementation, this would be an API call
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data
        const sampleCourses: Course[] = [
          {
            id: "course1",
            title: "Insurance Regulatory Compliance",
            description: "Learn about the latest regulatory requirements for insurance providers.",
            progress: 65,
            instructor: "Dr. Sarah Johnson",
            totalHours: 10,
            completedHours: 6.5,
            status: "in_progress",
            dueDate: "2025-08-28",
            coverImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216"
          },
          {
            id: "course2",
            title: "Insurance Ethics for Professionals",
            description: "Comprehensive ethics training for insurance agents and brokers.",
            progress: 100,
            instructor: "Prof. Michael Rodriguez",
            totalHours: 8,
            completedHours: 8,
            status: "completed",
            coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa"
          },
          {
            id: "course3",
            title: "Digital Marketing for Insurance Agents",
            description: "Learn modern marketing strategies for insurance products.",
            progress: 0,
            instructor: "Emily Chen, MBA",
            totalHours: 6,
            completedHours: 0,
            status: "not_started",
            dueDate: "2025-09-15",
            coverImage: "https://images.unsplash.com/photo-1533750516457-a7f992034fec"
          },
        ];
        
        setCourses(sampleCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Get in progress courses
  const inProgressCourses = courses.filter(course => course.status === "in_progress");
  
  // Get completed courses
  const completedCourses = courses.filter(course => course.status === "completed");
  
  // Get not started courses
  const notStartedCourses = courses.filter(course => course.status === "not_started");

  // Calculate total CE hours completed
  const totalCEHoursCompleted = courses.reduce((sum, course) => sum + course.completedHours, 0);

  // Calculate courses completion percentage
  const coursesCompletionPercentage = courses.length > 0 
    ? Math.round((completedCourses.length / courses.length) * 100) 
    : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Student'}</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Enrolled Courses</p>
                <h3 className="text-3xl font-bold mt-1">{courses.length}</h3>
              </div>
              <div className="rounded-full p-3 bg-blue-100">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                  <span>{completedCourses.length} Completed</span>
                  <span>{coursesCompletionPercentage}%</span>
                </div>
                <Progress value={coursesCompletionPercentage} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">CE Hours Completed</p>
                <h3 className="text-3xl font-bold mt-1">{totalCEHoursCompleted}</h3>
              </div>
              <div className="rounded-full p-3 bg-green-100">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                  <span>Hours Earned</span>
                  <span className="text-green-600 font-medium">{totalCEHoursCompleted} / {courses.reduce((sum, course) => sum + course.totalHours, 0)}</span>
                </div>
                <Progress 
                  value={(totalCEHoursCompleted / courses.reduce((sum, course) => sum + course.totalHours, 0)) * 100} 
                  className="h-1.5" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Certificates Earned</p>
                <h3 className="text-3xl font-bold mt-1">{completedCourses.length}</h3>
              </div>
              <div className="rounded-full p-3 bg-purple-100">
                <FileTextIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              <span>Alberta Insurance Council Compliant</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Next Due Date</p>
                <h3 className="text-2xl font-bold mt-1">
                  {inProgressCourses.length > 0 
                    ? new Date(inProgressCourses[0].dueDate || '').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'None'}
                </h3>
              </div>
              <div className="rounded-full p-3 bg-amber-100">
                <CalendarIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {inProgressCourses.length > 0 ? (
                <div className="truncate">
                  {inProgressCourses[0].title}
                </div>
              ) : (
                <span>No upcoming deadlines</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* In Progress Courses */}
      <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
      {isLoading ? (
        <div className="py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : inProgressCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {inProgressCourses.map(course => (
            <Card key={course.id} className="overflow-hidden">
              <div 
                className="h-40 bg-cover bg-center" 
                style={{ backgroundImage: `url(${course.coverImage})` }}
              >
                <div className="w-full h-full bg-black bg-opacity-30 flex items-end p-4">
                  <Badge variant="secondary" className="bg-white bg-opacity-90">
                    {course.totalHours} Hours
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                  </div>
                  <div className="text-sm text-gray-500">
                    Instructor: {course.instructor}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <PlayIcon className="mr-2 h-4 w-4" /> Continue
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">You have no in-progress courses.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Upcoming & Not Started Courses */}
      {notStartedCourses.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Upcoming Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {notStartedCourses.map(course => (
              <Card key={course.id} className="overflow-hidden">
                <div 
                  className="h-40 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${course.coverImage})` }}
                >
                  <div className="w-full h-full bg-black bg-opacity-30 flex items-end p-4">
                    <Badge variant="secondary" className="bg-white bg-opacity-90">
                      {course.totalHours} Hours
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">
                      Instructor: {course.instructor}
                    </div>
                    {course.dueDate && (
                      <div className="flex items-center text-sm text-amber-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>Due: {new Date(course.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Start Course
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Completed Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {completedCourses.map(course => (
              <Card key={course.id} className="overflow-hidden border-green-200">
                <div 
                  className="h-40 bg-cover bg-center relative" 
                  style={{ backgroundImage: `url(${course.coverImage})` }}
                >
                  <div className="w-full h-full bg-black bg-opacity-30 flex items-end p-4">
                    <Badge variant="secondary" className="bg-white bg-opacity-90">
                      {course.totalHours} Hours
                    </Badge>
                    <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1.5">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completed</span>
                        <span className="text-green-600">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1.5 bg-green-100" />
                    </div>
                    <div className="text-sm text-gray-500">
                      Instructor: {course.instructor}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Review
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => navigate(`/certificate/${course.id}`)}
                  >
                    <FileTextIcon className="mr-2 h-4 w-4" /> Certificate
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Recommended Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Courses</CardTitle>
          <CardDescription>Based on your learning history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                title: "Advanced Insurance Portfolio Strategies", 
                description: "Learn sophisticated approaches to insurance portfolio management.",
                hours: 12
              },
              { 
                title: "Insurance Claims Management", 
                description: "Master the process of handling insurance claims efficiently.",
                hours: 8
              },
              { 
                title: "Legal Compliance for Insurance Professionals", 
                description: "Stay up-to-date with all legal requirements for insurance providers.",
                hours: 6
              },
            ].map((course, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-md cursor-pointer">
                <div className="rounded-md bg-blue-100 p-2 text-blue-700">
                  <BookOpenIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{course.title}</h4>
                  <p className="text-sm text-gray-500 truncate">{course.description}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{course.hours} Hours</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={() => navigate('/courses')} className="w-full">
            Browse all courses
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}