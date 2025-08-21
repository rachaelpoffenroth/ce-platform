import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon } from 'lucide-react';

export default function TestCertificate() {
  const { user } = useAuth();
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    // Sample certificate data for preview
    const sampleCertificate = {
      id: "cert-1",
      courseTitle: "Insurance Ethics and Best Practices",
      completionDate: "2025-07-15",
      expirationDate: "2027-07-15",
      creditHours: 4,
      certificateNumber: "CE-INS-12345",
      ciprNumber: user?.profile?.ciprNumber || "CIP12345",
    };
    
    setCertificate(sampleCertificate);
  }, [user]);

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Certificate Preview</h1>
          <Link to="/student-dashboard" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Full Certificate View */}
        <div className="w-full max-w-5xl mx-auto bg-blue-50 border-8 border-blue-700 aspect-[1.4142] shadow-xl">
          {/* Blue circular AIC logo */}
          <div className="absolute top-8 right-8 h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            AIC
          </div>
          
          <div className="p-12 flex flex-col h-full">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-serif text-blue-800">Certificate of Completion</h1>
              <h2 className="text-xl font-medium text-blue-700 mt-2">American Insurance Certification</h2>
              <div className="mt-2">Continuing Education Program</div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-lg mb-6">This is to certify that</p>
              <h2 className="text-3xl font-bold mb-6">{user?.name || 'Student Name'}</h2>
              <p className="text-lg mb-6">has successfully completed</p>
              <h3 className="text-2xl font-bold mb-6">{certificate.courseTitle}</h3>
              <p className="text-lg mb-6">with {certificate.creditHours} hours of continuing education credit</p>
              <p className="text-lg">on {new Date(certificate.completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-lg mt-6 text-blue-800 font-semibold">CIPR#: {certificate.ciprNumber}</p>
            </div>
            
            <div className="mt-16 grid grid-cols-3">
              <div className="border-t border-gray-400 pt-2 px-2">
                <p className="text-center font-semibold">John Hancock</p>
                <p className="text-center text-sm">AIC Director</p>
              </div>
              
              <div className="border-t border-gray-400 pt-2 px-2">
                <p className="text-center text-sm font-medium">Certificate ID:</p>
                <p className="text-center text-sm">{certificate.certificateNumber}</p>
              </div>
              
              <div className="border-t border-gray-400 pt-2 px-2">
                <p className="text-center text-sm font-medium">Course Instructor</p>
                <p className="text-center text-sm">Verify this certificate at aicertification.org</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-4">
          <Button>Download Certificate</Button>
          <Button variant="outline">Print Certificate</Button>
        </div>
      </div>
    </div>
  );
}