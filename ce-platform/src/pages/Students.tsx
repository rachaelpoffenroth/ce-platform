import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { SearchIcon, UserPlus, UserIcon, MailIcon, ChevronDownIcon, DownloadIcon, RefreshCwIcon } from "lucide-react";

// Mock student data
const mockStudents = [
  {
    id: "student-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    enrollmentDate: "2025-03-15",
    coursesEnrolled: 3,
    coursesCompleted: 2,
    lastActive: "2025-08-01",
    status: "active"
  },
  {
    id: "student-2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    enrollmentDate: "2025-04-22",
    coursesEnrolled: 2,
    coursesCompleted: 1,
    lastActive: "2025-07-28",
    status: "active"
  },
  {
    id: "student-3",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@example.com",
    enrollmentDate: "2025-05-10",
    coursesEnrolled: 5,
    coursesCompleted: 4,
    lastActive: "2025-08-02",
    status: "active"
  },
  {
    id: "student-4",
    name: "David Wilson",
    email: "david.wilson@example.com",
    enrollmentDate: "2025-02-18",
    coursesEnrolled: 1,
    coursesCompleted: 0,
    lastActive: "2025-06-15",
    status: "inactive"
  },
  {
    id: "student-5",
    name: "Olivia Smith",
    email: "olivia.smith@example.com",
    enrollmentDate: "2025-07-05",
    coursesEnrolled: 2,
    coursesCompleted: 0,
    lastActive: "2025-08-02",
    status: "active"
  }
];

// Mock course enrollment data for a student
const mockEnrollments = [
  {
    courseId: "course-1",
    courseTitle: "Insurance Ethics and Best Practices",
    enrollmentDate: "2025-03-16",
    progress: 100,
    completed: true,
    completionDate: "2025-04-10",
    certificateId: "cert-123"
  },
  {
    courseId: "course-3",
    courseTitle: "Digital Marketing for Insurance Agents",
    enrollmentDate: "2025-05-22",
    progress: 75,
    completed: false,
    completionDate: null,
    certificateId: null
  },
  {
    courseId: "course-5",
    courseTitle: "Risk Assessment and Management",
    enrollmentDate: "2025-07-01",
    progress: 25,
    completed: false,
    completionDate: null,
    certificateId: null
  }
];

export default function Students() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState(mockStudents);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  
  // Apply filters
  const applyFilters = () => {
    let filtered = [...mockStudents];
    
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(student => student.status === statusFilter);
    }
    
    setFilteredStudents(filtered);
  };
  
  // Handler for search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setTimeout(() => applyFilters(), 300);
  };
  
  // Handler for status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setTimeout(() => applyFilters(), 100);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  // Handler for student invitation
  const handleInviteStudent = () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Invitation Sent",
      description: `An invitation has been sent to ${inviteEmail}`
    });
    
    setInviteEmail("");
    setIsInviteModalOpen(false);
  };
  
  // Handler for exporting student data
  const handleExportData = () => {
    toast({
      title: "Exporting Data",
      description: "Student data export has started"
    });
  };
  
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };
  
  return (
    <div className="container py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Students</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Student
          </Button>
        </div>
      </div>
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              {filteredStudents.length} students found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-8 gap-2 p-4 font-medium border-b">
              <div className="col-span-2">Name</div>
              <div className="col-span-2">Email</div>
              <div>Enrolled Since</div>
              <div>Courses</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            
            {filteredStudents.length > 0 ? filteredStudents.map(student => (
              <div key={student.id} className="grid grid-cols-8 gap-2 p-4 items-center border-b hover:bg-muted/50">
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-muted-foreground">Last active: {student.lastActive ? formatDate(student.lastActive) : "Never"}</div>
                  </div>
                </div>
                
                <div className="col-span-2 text-sm">
                  {student.email}
                </div>
                
                <div className="text-sm">
                  {formatDate(student.enrollmentDate)}
                </div>
                
                <div className="text-sm">
                  {student.coursesCompleted}/{student.coursesEnrolled} completed
                </div>
                
                <div>
                  <Badge variant={student.status === "active" ? "default" : "outline"}>
                    {student.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                        <DialogDescription>
                          Enrollment and progress information for {student?.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedStudent && (
                        <div className="space-y-6">
                          <div className="flex gap-4 items-center">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="text-xl">{getInitials(selectedStudent.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <MailIcon className="h-3 w-3 mr-1" />
                                  {selectedStudent.email}
                                </div>
                                <Badge variant={selectedStudent.status === "active" ? "default" : "outline"}>
                                  {selectedStudent.status === "active" ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <Tabs defaultValue="courses">
                            <TabsList>
                              <TabsTrigger value="courses">Courses</TabsTrigger>
                              <TabsTrigger value="certificates">Certificates</TabsTrigger>
                              <TabsTrigger value="activity">Activity</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="courses" className="mt-4">
                              <div className="rounded-md border">
                                <div className="grid grid-cols-10 gap-2 p-3 font-medium border-b">
                                  <div className="col-span-4">Course</div>
                                  <div className="col-span-2">Enrolled</div>
                                  <div className="col-span-2">Status</div>
                                  <div className="col-span-2">Progress</div>
                                </div>
                                
                                {mockEnrollments.map(enrollment => (
                                  <div key={enrollment.courseId} className="grid grid-cols-10 gap-2 p-3 items-center border-b">
                                    <div className="col-span-4 font-medium">{enrollment.courseTitle}</div>
                                    <div className="col-span-2 text-sm">{formatDate(enrollment.enrollmentDate)}</div>
                                    <div className="col-span-2">
                                      <Badge variant={enrollment.completed ? "success" : "secondary"}>
                                        {enrollment.completed ? "Completed" : "In Progress"}
                                      </Badge>
                                    </div>
                                    <div className="col-span-2">
                                      <div className="flex items-center gap-2">
                                        <div className="bg-gray-200 h-2 rounded-full w-full overflow-hidden">
                                          <div 
                                            className="bg-primary h-full rounded-full" 
                                            style={{ width: `${enrollment.progress}%` }}
                                          />
                                        </div>
                                        <span className="text-xs">{enrollment.progress}%</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="certificates" className="mt-4">
                              <div className="rounded-md border">
                                <div className="grid grid-cols-8 gap-2 p-3 font-medium border-b">
                                  <div className="col-span-4">Course</div>
                                  <div className="col-span-2">Completed</div>
                                  <div className="col-span-2">Certificate ID</div>
                                </div>
                                
                                {mockEnrollments
                                  .filter(enrollment => enrollment.completed)
                                  .map(enrollment => (
                                    <div key={enrollment.courseId} className="grid grid-cols-8 gap-2 p-3 items-center border-b">
                                      <div className="col-span-4">{enrollment.courseTitle}</div>
                                      <div className="col-span-2">{formatDate(enrollment.completionDate)}</div>
                                      <div className="col-span-2">{enrollment.certificateId}</div>
                                    </div>
                                  ))}
                                  
                                {mockEnrollments.filter(enrollment => enrollment.completed).length === 0 && (
                                  <div className="p-4 text-center text-muted-foreground">
                                    No certificates issued yet
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="activity" className="mt-4">
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                  Detailed activity logs will be available in a future update
                                </p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button variant="outline">
                          Message Student
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-1">No students found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters or invite new students to your courses.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Invite Student Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Student</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new student to join your courses.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                placeholder="student@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteStudent}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}