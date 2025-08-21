import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusIcon,
  BookOpenIcon,
  UsersIcon,
  BarChart3Icon,
  FileTextIcon,
  DollarSignIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Course, getAllCourses } from "@/lib/course-storage";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay for UI feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get courses from local storage
        let storedCourses = getAllCourses();
        
        // If no courses found in storage, use sample data
        if (!storedCourses || storedCourses.length === 0) {
          const sampleCourses: Course[] = [
            {
              id: "course1",
              title: "Insurance Regulatory Compliance",
              description: "Learn about the latest regulatory requirements for insurance providers.",
              students: 124,
              completion: 78,
              status: "published",
              lastUpdated: "2025-07-28",
              slides: []
            },
            {
              id: "course2",
              title: "Insurance Ethics for Professionals",
              description: "Comprehensive ethics training for insurance agents and brokers.",
              students: 86,
              completion: 92,
              status: "published",
              lastUpdated: "2025-07-15",
              slides: []
            },
            {
              id: "course3",
              title: "Digital Marketing for Insurance Agents",
              description: "Learn modern marketing strategies for insurance products.",
              students: 0,
              completion: 0,
              status: "draft",
              lastUpdated: "2025-08-01",
              slides: []
            },
          ];
          
          storedCourses = sampleCourses;
        }
        
        setCourses(storedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Instructor'}</p>
        </div>
        
        <Button onClick={() => navigate('/course-creator')}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>
      
      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Courses</p>
                <h3 className="text-3xl font-bold mt-1">{courses.length}</h3>
              </div>
              <div className="rounded-full p-3 bg-blue-100">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <div className="flex-1">
                <span className="font-medium text-green-600">{courses.filter(c => c.status === "published").length}</span> Published
              </div>
              <div>
                <span className="font-medium text-amber-600">{courses.filter(c => c.status === "draft").length}</span> Draft
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Students</p>
                <h3 className="text-3xl font-bold mt-1">{courses.reduce((sum, course) => sum + course.students, 0)}</h3>
              </div>
              <div className="rounded-full p-3 bg-green-100">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-600 h-1.5 rounded-full" 
                  style={{ width: '65%' }}
                ></div>
              </div>
              <div className="mt-1">
                <span className="font-medium">65%</span> completion rate
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Certificates Issued</p>
                <h3 className="text-3xl font-bold mt-1">512</h3>
              </div>
              <div className="rounded-full p-3 bg-purple-100">
                <FileTextIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <ArrowRightIcon className="h-4 w-4 mr-1" />
              <span className="font-medium">47</span> new this month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Revenue</p>
                <h3 className="text-3xl font-bold mt-1">$24,358</h3>
              </div>
              <div className="rounded-full p-3 bg-amber-100">
                <DollarSignIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <div className="flex-1 flex items-center text-green-600">
                <ArrowRightIcon className="h-4 w-4 mr-1" />
                <span className="font-medium">12%</span> increase
              </div>
              <div>
                vs last month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Course List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            Manage your continuing education courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : courses.length > 0 ? (
            <div className="divide-y">
              {courses.map((course) => (
                <div key={course.id} className="py-4 px-2 rounded-md">
                  <div className="flex items-center justify-between hover:bg-gray-50 cursor-pointer rounded-md p-2"
                    onClick={() => navigate(`/course-creator`, { state: { courseId: course.id } })}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="bg-blue-100 text-blue-700 p-2 rounded-md overflow-hidden">
                          {/* Course thumbnail image or default icon */}
                          {course.thumbnail ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="h-16 w-16 object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 flex items-center justify-center">
                              <BookOpenIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-gray-500 max-w-md truncate">{course.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            course.status === "published" ? "bg-green-100 text-green-800" : 
                            course.status === "draft" ? "bg-amber-100 text-amber-800" : 
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            Updated: {new Date(course.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{course.students}</p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium">{course.completion}%</p>
                        <p className="text-xs text-gray-500">Completion</p>
                      </div>
                      
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Thumbnail upload option */}
                  <div className="mt-2 flex justify-end pr-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        // This would normally open a file picker
                        alert("In a production app, this would open a file picker to update the course thumbnail.");
                      }}
                    >
                      Update Thumbnail
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first course
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/course-creator')}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Analytics Preview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
            <CardDescription>Course completion statistics for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3Icon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Analytics visualization would appear here</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={() => navigate('/analytics')}>
              View detailed analytics
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Certificates</CardTitle>
            <CardDescription>Certificates issued to students in the past 30 days</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { name: "Sarah Johnson", course: "Insurance Regulatory Compliance", date: "Aug 2, 2025" },
                { name: "Michael Chen", course: "Real Estate Ethics for Professionals", date: "July 28, 2025" },
                { name: "Jessica Rodriguez", course: "Insurance Regulatory Compliance", date: "July 25, 2025" },
              ].map((cert, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-sm text-gray-500">{cert.course}</p>
                  </div>
                  <div className="text-sm text-gray-500">{cert.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={() => navigate('/certificates')}>
              View all certificates
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}