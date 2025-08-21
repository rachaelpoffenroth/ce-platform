import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoaded(true);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center p-6">
        <div className={`space-y-6 max-w-3xl transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent sm:text-6xl">
            Insurance Continuing Education
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional education platform for insurance professionals. 
            Complete CE courses with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              onClick={() => navigate('/login')} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
            <Button 
              onClick={() => navigate('/about')} 
              variant="outline" 
              size="lg"
            >
              Learn More
            </Button>
          </div>
          
          <div className="pt-12 flex items-center justify-center space-x-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Quality</div>
              <div className="text-gray-500">Focused Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">AIC</div>
              <div className="text-gray-500">Compliant Certificates</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-gray-600">© 2025 CE Platform. All rights reserved.</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}