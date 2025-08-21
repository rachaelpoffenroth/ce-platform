import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { DownloadIcon, PrinterIcon, ChevronLeftIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CourseDetails {
  id: string;
  title: string;
  instructor: string;
  completionDate: string;
  ceCredits: number;
  certificateId: string;
}

export default function Certificate() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Sample data - in production this would come from your API
        const sampleCourse: CourseDetails = {
          id: courseId || '',
          title: courseId === 'course1' 
            ? 'Insurance Regulatory Compliance' 
            : 'Insurance Ethics for Professionals',
          instructor: courseId === 'course1' 
            ? 'Dr. Sarah Johnson' 
            : 'Prof. Michael Rodriguez',
          completionDate: new Date().toISOString().split('T')[0],
          ceCredits: courseId === 'course1' ? 10 : 8,
          certificateId: `CE-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`
        };
        
        setCourse(sampleCourse);
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [courseId]);
  
  const downloadAsPDF = async () => {
    if (!certificateRef.current || !course) return;
    
    // Create a canvas from the certificate div
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const width = pdfWidth;
    const height = width / ratio;
    
    pdf.addImage(imgData, 'JPEG', 0, (pdfHeight - height) / 2, width, height);
    pdf.save(`${course.certificateId}_certificate.pdf`);
  };
  
  const printCertificate = () => {
    window.print();
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold mb-4">Certificate Not Found</h1>
          <p className="text-gray-500 mb-4">The requested certificate could not be found.</p>
          <Link to="/student-dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/student-dashboard" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={printCertificate}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={downloadAsPDF}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="flex justify-center">
        <div
          ref={certificateRef}
          className="w-full max-w-4xl aspect-[1.4142] bg-blue-50 shadow-lg border-8 border-blue-700 print:shadow-none"
          style={{
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3QgaWQ9InBhdHRlcm4tYmFja2dyb3VuZCIgd2lkdGg9IjQwMCUiIGhlaWdodD0iNDAwJSIgZmlsbD0icmdiYSgyNDMsIDI0NCwgMjQ2LCAxKSI+PC9yZWN0PjxwYXRoIGZpbGw9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KSIgZD0iTTAgMGgyMHYyMEgweiI+PC9wYXRoPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSI+PC9yZWN0Pjwvc3ZnPg==')",
            backgroundSize: 'cover'
          }}
        >
          {/* Alberta Insurance Council logo */}
          <div className="absolute top-8 right-8 h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            AIC
          </div>
          
          <div className="p-12 flex flex-col h-full">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-serif text-blue-800">Certificate of Completion</h1>
              <h2 className="text-xl font-medium text-blue-700 mt-2">Insurance Continuing Education</h2>
              <div className="mt-2">Alberta Insurance Council</div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-lg mb-6">This is to certify that</p>
              <h2 className="text-3xl font-bold mb-6">{user?.name || "Jane Doe"}</h2>
              <p className="text-lg mb-6">has successfully completed</p>
              <h3 className="text-2xl font-bold mb-6">{course.title}</h3>
              <p className="text-lg mb-6">with {course.ceCredits} hours of continuing education credit</p>
              <p className="text-lg">on {new Date(course.completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              {user?.profile?.ciprNumber && (
                <p className="text-lg mt-6 text-blue-800 font-semibold">{user?.profile?.ciprNumber}</p>
              )}
            </div>
            
            <div className="mt-16 grid grid-cols-3">
              <div className="border-t border-gray-400 pt-2 px-2">
                <p className="text-center font-semibold">{course?.instructor || 'Course Instructor'}</p>
                <p className="text-center text-sm">Course Instructor</p>
              </div>
              
              <div className="border-t border-gray-400 pt-2 px-2">
                <p className="text-center text-sm font-medium">Certificate ID:</p>
                <p className="text-center text-sm">{course.certificateId}</p>
              </div>
              
              <div className="border-t border-gray-400 pt-2 px-2">
                <p className="text-center text-sm font-medium">Course Approval</p>
                <p className="text-center text-sm">Alberta Insurance Council</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}