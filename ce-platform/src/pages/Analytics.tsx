import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  BarChart,
  LineChart,
  PieChart
} from "@/components/ui/chart";
import * as RechartsPrimitive from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

// Mock data for charts
const enrollmentData = [
  { name: "Jan", value: 12 },
  { name: "Feb", value: 18 },
  { name: "Mar", value: 23 },
  { name: "Apr", value: 27 },
  { name: "May", value: 34 },
  { name: "Jun", value: 32 },
  { name: "Jul", value: 38 },
  { name: "Aug", value: 42 }
];

const completionRateData = [
  { name: "Insurance Ethics", value: 85 },
  { name: "Real Estate Law", value: 72 },
  { name: "Digital Marketing", value: 63 },
  { name: "Risk Assessment", value: 91 },
  { name: "Property Management", value: 78 }
];

const revenueData = [
  { name: "Jan", value: 1200 },
  { name: "Feb", value: 1800 },
  { name: "Mar", value: 2300 },
  { name: "Apr", value: 2700 },
  { name: "May", value: 3400 },
  { name: "Jun", value: 3200 },
  { name: "Jul", value: 3800 },
  { name: "Aug", value: 4200 }
];

const courseDistributionData = [
  { name: "Insurance", value: 45 },
  { name: "Real Estate", value: 35 },
  { name: "Management", value: 20 }
];

const dailyActiveUsersData = Array.from({ length: 30 }, (_, i) => {
  const date = subDays(new Date(), 29 - i);
  return {
    name: format(date, "MMM d"),
    value: Math.floor(Math.random() * 40) + 60
  };
});

// Dashboard stats
const dashboardStats = [
  {
    title: "Total Students",
    value: "487",
    change: "+12%",
    changeType: "positive"
  },
  {
    title: "Course Enrollments",
    value: "952",
    change: "+23%",
    changeType: "positive"
  },
  {
    title: "Completion Rate",
    value: "76%",
    change: "+5%",
    changeType: "positive"
  },
  {
    title: "Avg. Rating",
    value: "4.8/5",
    change: "+0.2",
    changeType: "positive"
  }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("last30days");
  const [courseFilter, setCourseFilter] = useState("all");
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };
  
  const handleCourseFilterChange = (value: string) => {
    setCourseFilter(value);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "last7days":
        return "Last 7 Days";
      case "last30days":
        return "Last 30 Days";
      case "last90days":
        return "Last 90 Days";
      case "thisMonth":
        return `This Month (${format(new Date(), "MMMM")})`;
      case "lastMonth":
        return `Last Month`;
      default:
        return "Last 30 Days";
    }
  };
  
  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/instructor-dashboard'}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={courseFilter} onValueChange={handleCourseFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="insurance">Insurance Courses</SelectItem>
              <SelectItem value="realestate">Real Estate Courses</SelectItem>
              <SelectItem value="management">Management Courses</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.title}</CardDescription>
              <CardTitle className="text-3xl">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm ${
                stat.changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.change} from previous period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Enrollment Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment Trends</CardTitle>
              <CardDescription>
                {getTimeRangeLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer 
                  config={{ value: { color: "blue" }}}
                >
                  <LineChart data={enrollmentData}>
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.XAxis dataKey="name" />
                    <RechartsPrimitive.YAxis />
                    <RechartsPrimitive.Tooltip formatter={(value) => [`${value} students`, 'Students']} />
                    <RechartsPrimitive.Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Course Distribution</CardTitle>
                <CardDescription>
                  By category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer 
                    config={{ value: { color: "#4f46e5" }}}
                  >
                    <PieChart>
                      <RechartsPrimitive.Pie 
                        data={courseDistributionData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80} 
                        fill="#8884d8"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      />
                      <RechartsPrimitive.Tooltip formatter={(value) => `${value}%`} />
                      <RechartsPrimitive.Legend />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Course Completion Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Rates</CardTitle>
                <CardDescription>
                  Top performing courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer 
                    config={{ value: { color: "blue" }}}
                  >
                    <BarChart data={completionRateData}>
                      <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                      <RechartsPrimitive.XAxis dataKey="name" />
                      <RechartsPrimitive.YAxis />
                      <RechartsPrimitive.Tooltip formatter={(value) => `${value}%`} />
                      <RechartsPrimitive.Bar dataKey="value" fill="#4f46e5" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-6">
          {/* Daily Active Users */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Active Users</CardTitle>
              <CardDescription>
                {getTimeRangeLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer 
                  config={{ value: { color: "blue" }}}
                >
                  <LineChart data={dailyActiveUsersData}>
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.XAxis dataKey="name" />
                    <RechartsPrimitive.YAxis />
                    <RechartsPrimitive.Tooltip formatter={(value) => [`${value} users`, 'Users']} />
                    <RechartsPrimitive.Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Student Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Demographic data visualization will be available in a future update</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Student Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Student Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Engagement metrics will be available in a future update</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-6">
          {/* Course Completion Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Course Completion Rates</CardTitle>
              <CardDescription>
                By course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer 
                  config={{ value: { color: "blue" }}}
                >
                  <BarChart data={completionRateData}>
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.XAxis dataKey="name" />
                    <RechartsPrimitive.YAxis />
                    <RechartsPrimitive.Tooltip formatter={(value) => `${value}%`} />
                    <RechartsPrimitive.Bar dataKey="value" fill="#4f46e5" />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Course Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Course rating data will be available in a future update</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Average Completion Time */}
            <Card>
              <CardHeader>
                <CardTitle>Average Completion Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Completion time data will be available in a future update</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                {getTimeRangeLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer 
                  config={{ value: { color: "green" }}}
                >
                  <LineChart data={revenueData}>
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.XAxis dataKey="name" />
                    <RechartsPrimitive.YAxis />
                    <RechartsPrimitive.Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <RechartsPrimitive.Line type="monotone" dataKey="value" stroke="#22c55e" />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue by Course Category */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer 
                    config={{ value: { color: "green" }}}
                  >
                    <PieChart>
                      <RechartsPrimitive.Pie 
                        data={courseDistributionData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80} 
                        fill="#22c55e"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      />
                      <RechartsPrimitive.Tooltip formatter={(value) => `${value}%`} />
                      <RechartsPrimitive.Legend />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly Recurring Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">MRR data will be available in a future update</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}