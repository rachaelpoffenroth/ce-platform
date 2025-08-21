import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { SearchIcon, Clock, BookOpenIcon, CheckCircleIcon } from "lucide-react";

// Mock course data
const mockCourses = [
  {
    id: "course-1",
    title: "Insurance Ethics and Best Practices",
    description: "Learn the ethical standards and best practices in the insurance industry.",
    instructor: "Dr. Sarah Johnson",
    duration: "4 hours",
    progress: 75,
    enrolled: true,
    completed: false,
    category: "Insurance",
    credits: 4,
    thumbnail: "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "course-2",
    title: "Insurance Law Fundamentals",
    description: "A comprehensive overview of insurance laws and regulations.",
    instructor: "Prof. Michael Chen",
    duration: "6 hours",
    progress: 100,
    enrolled: true,
    completed: true,
    category: "Insurance",
    credits: 6,
    thumbnail: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "course-3",
    title: "Digital Marketing for Insurance Agents",
    description: "Master digital marketing strategies specifically for insurance professionals.",
    instructor: "Emma Rodriguez",
    duration: "5 hours",
    progress: 30,
    enrolled: true,
    completed: false,
    category: "Insurance",
    credits: 5,
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "course-4",
    title: "Insurance Portfolio Management",
    description: "Learn effective strategies for managing insurance portfolios and client relationships.",
    instructor: "David Wilson",
    duration: "8 hours",
    progress: 0,
    enrolled: false,
    completed: false,
    category: "Insurance",
    credits: 8,
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "course-5",
    title: "Risk Assessment and Management",
    description: "Learn how to identify, assess and manage risks in insurance contexts.",
    instructor: "Dr. Robert Lee",
    duration: "7 hours",
    progress: 0,
    enrolled: false,
    completed: false,
    category: "Insurance",
    credits: 7,
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "course-6",
    title: "Residential Real Estate Appraisal",
    description: "Master the techniques for accurately appraising residential properties.",
    instructor: "Linda Thompson",
    duration: "6 hours",
    progress: 0,
    enrolled: false,
    completed: false,
    category: "Real Estate",
    credits: 6,
    thumbnail: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=500&auto=format&fit=crop"
  }
];

export default function Courses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-courses");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);
  
  useEffect(() => {
    if (activeTab === "my-courses") {
      setFilteredCourses(mockCourses.filter(course => course.enrolled));
    } else if (activeTab === "completed") {
      setFilteredCourses(mockCourses.filter(course => course.completed));
    } else if (activeTab === "available") {
      setFilteredCourses(mockCourses.filter(course => !course.enrolled));
    } else {
      setFilteredCourses(mockCourses);
    }
    
    if (searchTerm) {
      setFilteredCourses(prev => 
        prev.filter(course => 
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [activeTab, searchTerm]);
  
  const handleEnroll = (courseId: string) => {
    // In a real app, this would make an API call to enroll the user
    console.log(`Enrolling in course: ${courseId}`);
  };
  
  const handleContinue = (courseId: string) => {
    // In a real app, this would navigate to the course content at the correct position
    console.log(`Continuing course: ${courseId}`);
  };
  
  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="my-courses" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 sm:w-[500px]">
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        {["my-courses", "completed", "available", "all"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={course.thumbnail || "https://placehold.co/600x400?text=Course"} 
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <Badge>{course.category}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                        <div>
                          <span>{course.credits} CE Credits</span>
                        </div>
                      </div>
                      
                      {course.enrolled && !course.completed && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}
                      
                      {course.completed && (
                        <div className="flex items-center text-sm text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          <span>Completed</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {!course.enrolled ? (
                        <Button onClick={() => handleEnroll(course.id)} className="w-full">
                          Enroll Now
                        </Button>
                      ) : !course.completed ? (
                        <Button onClick={() => handleContinue(course.id)} className="w-full" variant="default">
                          {course.progress > 0 ? "Continue Learning" : "Start Course"}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" onClick={() => handleContinue(course.id)}>
                          Review Course
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <BookOpenIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-1">No courses found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "my-courses" 
                      ? "You haven't enrolled in any courses yet." 
                      : activeTab === "completed"
                      ? "You haven't completed any courses yet."
                      : "Try adjusting your search or filters."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}