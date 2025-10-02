import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import CourseCreator from "@/pages/CourseCreator";
import CourseViewer from "@/pages/CourseViewer";
import StudentDashboard from "@/pages/StudentDashboard";
import Checkout from "@/pages/Checkout";
import Courses from "@/pages/Courses";
import Students from "@/pages/Students";
import Analytics from "@/pages/Analytics";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/create-course" component={CourseCreator} />
          <Route path="/courses" component={Courses} />
          <Route path="/students" component={Students} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/course/:id" component={CourseViewer} />
          <Route path="/student" component={StudentDashboard} />
          <Route path="/checkout/:courseId" component={Checkout} />
          <Route path="/my-courses" component={() => <Redirect to="/courses" />} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
