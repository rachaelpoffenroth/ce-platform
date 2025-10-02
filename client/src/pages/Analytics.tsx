import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign, 
  Calendar,
  Award,
  Clock,
  Target
} from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();

  const { data: analytics = {}, isLoading } = useQuery({
    queryKey: ["/api/analytics/instructor"],
  });

  // Sample data for demonstration
  const sampleData = {
    totalCourses: 5,
    totalStudents: 127,
    totalRevenue: 3825,
    completionRate: 78,
    monthlyEnrollments: [
      { month: 'Jan', enrollments: 12 },
      { month: 'Feb', enrollments: 18 },
      { month: 'Mar', enrollments: 25 },
      { month: 'Apr', enrollments: 32 },
      { month: 'May', enrollments: 28 },
      { month: 'Jun', enrollments: 35 },
    ],
    coursePerformance: [
      { name: 'Insurance Basics', students: 45, completion: 85 },
      { name: 'Advanced Claims', students: 32, completion: 72 },
      { name: 'Risk Management', students: 28, completion: 90 },
      { name: 'Policy Writing', students: 22, completion: 68 },
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 480 },
      { month: 'Feb', revenue: 720 },
      { month: 'Mar', revenue: 1050 },
      { month: 'Apr', revenue: 960 },
      { month: 'May', revenue: 840 },
      { month: 'Jun', revenue: 1200 },
    ],
    coursesStatus: [
      { name: 'Published', value: 4, color: '#10b981' },
      { name: 'Draft', value: 1, color: '#f59e0b' },
    ]
  };

  const data = Object.keys(analytics).length > 0 ? analytics as typeof sampleData : sampleData;

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardHeader>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                  </CardHeader>
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
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-analytics">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your course performance and student engagement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-total-courses">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-courses">{data.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-students">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-students">{data.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">${data.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-completion-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completion-rate">{data.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Enrollments</CardTitle>
              <CardDescription>Student enrollment trends over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlyEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="enrollments" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue generated from course sales</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Course Performance & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Student enrollment and completion rates by course</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.coursePerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#3b82f6" name="Students" />
                  <Bar dataKey="completion" fill="#10b981" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Course Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Course Status</CardTitle>
              <CardDescription>Distribution of course statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.coursesStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.coursesStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {data.coursesStatus.map((item: any) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}