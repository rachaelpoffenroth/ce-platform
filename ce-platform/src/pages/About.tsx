import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">About Easy CE</h1>
      
      <div className="space-y-8 max-w-3xl">
        <section>
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-lg text-gray-700">
            Easy CE provides high-quality continuing education courses for insurance professionals. 
            Our mission is to deliver engaging, accessible, and comprehensive educational content that helps professionals 
            meet their licensing requirements while genuinely expanding their knowledge.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Quality Education</h2>
          <p className="text-lg text-gray-700">
            All our courses are created by industry experts and undergo rigorous quality assurance to ensure they meet 
            state-specific requirements. Our interactive learning approach helps professionals retain information better 
            and apply it in their daily practice.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">For Students</h2>
          <p className="text-lg text-gray-700">
            Access a wide range of accredited courses, track your progress, and earn certificates—all on a user-friendly platform 
            that works on any device. Complete your continuing education requirements at your own pace.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">For Instructors</h2>
          <p className="text-lg text-gray-700">
            Our platform provides instructors with powerful tools to create engaging courses with multimedia content, 
            quizzes, and interactive elements. Track student progress, get detailed analytics, and manage your courses 
            efficiently.
          </p>
        </section>
        
        <div className="pt-8">
          <Link to="/register">
            <Button size="lg">Join Us Today</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}