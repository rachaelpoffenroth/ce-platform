import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth-context';

// Layout components
import NavBar from '@/components/layouts/NavBar';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import NotFound from './pages/NotFound';
import CourseBuilder from './components/course-creator/CourseBuilder';
import Courses from './pages/Courses';
import Certificates from './pages/Certificates';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Account from './pages/Account';
import SubscriptionSelect from './pages/SubscriptionSelect';
import CorporateRegistration from './pages/CorporateRegistration';
import CoursePreview from './pages/CoursePreview';
import Certificate from './pages/Certificate';
import TestCertificate from './pages/TestCertificate';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/course-creator" element={<CourseBuilder />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/students" element={<Students />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/account" element={<Account />} />
                <Route path="/subscription-select" element={<SubscriptionSelect />} />
                <Route path="/corporate-registration" element={<CorporateRegistration />} />
                <Route path="/course-preview" element={<CoursePreview />} />
                <Route path="/certificate/:courseId" element={<Certificate />} />
                <Route path="/test-certificate" element={<TestCertificate />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;