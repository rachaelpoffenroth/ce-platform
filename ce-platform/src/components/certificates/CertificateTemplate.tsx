import { useAuth } from '@/lib/auth-context';

interface CertificateProps {
  certificate: {
    courseTitle: string;
    completionDate: string;
    certificateNumber: string;
    creditHours: number;
    state?: string;
    province?: string;
  };
}

export default function CertificateTemplate({ certificate }: CertificateProps) {
  const { user } = useAuth();
  
  return (
    <div className="w-full max-w-4xl aspect-[1.4142] mx-auto">
      <div 
        className="h-full w-full relative bg-white border-8 border-blue-700"
        style={{
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHJlY3QgaWQ9InBhdHRlcm4tYmFja2dyb3VuZCIgd2lkdGg9IjQwMCUiIGhlaWdodD0iNDAwJSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAxKSI+PC9yZWN0PjxwYXRoIGZpbGw9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjAzKSIgZD0iTTAgMGgyMHYyMEgweiI+PC9wYXRoPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNwYXR0ZXJuKSIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSI+PC9yZWN0Pjwvc3ZnPg==')",
          backgroundSize: 'cover'
        }}
      >
        {/* Easy CE logo */}
        <div className="absolute top-8 right-8 h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          Easy CE
        </div>
        
        <div className="p-12 flex flex-col h-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-blue-800">Certificate of Completion</h1>
            <h2 className="text-xl font-medium text-blue-700 mt-2">Insurance Continuing Education</h2>
            <div className="mt-2">Alberta Insurance Council</div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-lg mb-4">This certifies that</p>
            <h2 className="text-3xl font-bold mb-4">{user?.name || 'Student Name'}</h2>
            <p className="text-lg mb-4">has successfully completed the course</p>
            <h3 className="text-2xl font-bold mb-4">{certificate.courseTitle}</h3>
            <p className="text-lg mb-4">{certificate.creditHours} Credit Hours</p>
            <p className="text-lg">Completion Date: {new Date(certificate.completionDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            {user?.profile?.ciprNumber && (
              <p className="text-lg mt-4 text-blue-800 font-semibold">{user.profile.ciprNumber}</p>
            )}
            
            {certificate.province && (
              <p className="text-lg mt-2">
                Province: {certificate.province}
              </p>
            )}
          </div>
          
          <div className="mt-16 grid grid-cols-3">
            <div className="border-t border-gray-400 pt-2 px-2">
              <p className="text-center font-semibold">{user?.name || 'Course Instructor'}</p>
              <p className="text-center text-sm">Course Instructor</p>
            </div>
            
            <div className="border-t border-gray-400 pt-2 px-2">
              <p className="text-center text-sm font-medium">Certificate ID:</p>
              <p className="text-center text-sm">{certificate.certificateNumber}</p>
            </div>
            
            <div className="border-t border-gray-400 pt-2 px-2">
              <p className="text-center text-sm font-medium">Course Approval</p>
              <p className="text-center text-sm">Alberta Insurance Council</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}