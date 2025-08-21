import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, InfoIcon, BuildingIcon, UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IndividualPlan {
  name: string;
  description: string;
  price: string;
  duration: string;
  perCourse: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

interface CorporatePlan {
  name: string;
  description: string;
  userRange: string;
  pricePerUser: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

const individualPlans: IndividualPlan[] = [
  {
    name: "Pay Per Course",
    description: "Pay only for what you need",
    price: "$29",
    duration: "per course",
    perCourse: "1 CE credit per course",
    features: [
      "Immediate access to selected course",
      "Professional certificate upon completion",
      "Access to course for 30 days",
      "Downloadable resources",
      "Mobile access"
    ],
    cta: "Browse Courses"
  },
  {
    name: "6-Month Access",
    description: "For professionals who need regular CE credits",
    price: "$99",
    duration: "for 6 months",
    perCourse: "Unlimited courses",
    features: [
      "Access to all courses for 6 months",
      "Professional certificates",
      "Course completion tracking",
      "Downloadable tax receipts",
      "Access countdown timer",
      "Priority support"
    ],
    cta: "Get Started",
    highlighted: true,
    badge: "Popular"
  },
  {
    name: "Annual Access",
    description: "Best value for insurance professionals",
    price: "$179",
    duration: "for a full year",
    perCourse: "Unlimited courses",
    features: [
      "Access to all courses for 12 months",
      "Professional certificates",
      "Course completion tracking",
      "Downloadable tax receipts",
      "Access countdown timer",
      "Priority support",
      "Early access to new courses"
    ],
    cta: "Get Annual Access",
    badge: "Best Value"
  }
];

const corporatePlans: CorporatePlan[] = [
  {
    name: "Team Plan",
    description: "For small insurance offices",
    userRange: "3-10 users",
    pricePerUser: "$149/user/year",
    features: [
      "All Professional Plan features",
      "Centralized admin dashboard",
      "Team progress tracking",
      "Bulk certificate management",
      "Dedicated account manager",
      "Savings: 17% off individual pricing"
    ],
    cta: "Contact Sales"
  },
  {
    name: "Enterprise Plan",
    description: "For growing insurance agencies",
    userRange: "11-50 users",
    pricePerUser: "$119/user/year",
    features: [
      "All Premium Plan features per user",
      "Custom course creation (unlimited)",
      "White-label branding",
      "Advanced reporting & analytics",
      "Integration support (LMS, HRIS)",
      "Priority phone support",
      "Savings: 33% off individual pricing"
    ],
    cta: "Contact Sales",
    highlighted: true
  },
  {
    name: "Corporate Plus",
    description: "For large insurance organizations",
    userRange: "51+ users",
    pricePerUser: "$99/user/year",
    features: [
      "Everything in Enterprise",
      "Custom development requests",
      "Dedicated success manager",
      "On-site training available",
      "Custom integrations",
      "SLA guarantees",
      "Savings: 45% off individual pricing"
    ],
    cta: "Contact Sales"
  }
];

export default function Pricing() {
  const [planType, setPlanType] = useState<"individual" | "corporate">("individual");
  
  return (
    <div className="container py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Insurance CE Plans</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for you and start your continuing education journey today.
        </p>
        
        <div className="flex justify-center mt-8">
          <Tabs defaultValue="individual" className="w-full max-w-md" onValueChange={(value) => setPlanType(value as "individual" | "corporate")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual" className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="corporate" className="flex items-center">
                <BuildingIcon className="mr-2 h-4 w-4" />
                Corporate
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual">
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
                {individualPlans.map((plan) => (
                  <Card 
                    key={plan.name}
                    className={`flex flex-col ${
                      plan.highlighted 
                        ? "border-primary shadow-lg relative" 
                        : ""
                    }`}
                  >
                    {plan.badge && (
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                        {plan.badge}
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {plan.duration}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-blue-600">
                        {plan.perCourse}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link to="/register" className="w-full">
                        <Button 
                          className="w-full" 
                          variant={plan.highlighted ? "default" : "outline"}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="mt-10 bg-slate-50 p-6 rounded-lg max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  Important Notes
                  <InfoIcon className="h-4 w-4 ml-2 text-blue-500" />
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>All individual subscriptions include downloadable tax receipts for expense claims</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Subscriptions include a countdown timer showing remaining access duration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>All certificates are AIC compliant and immediately available upon course completion</span>
                  </li>
                  <li className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>No free trial available - quality education requires investment</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="corporate">
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
                {corporatePlans.map((plan) => (
                  <Card 
                    key={plan.name}
                    className={`flex flex-col ${
                      plan.highlighted 
                        ? "border-primary shadow-lg relative" 
                        : ""
                    }`}
                  >
                    {plan.badge && (
                      <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                        {plan.badge}
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-2xl font-bold">
                          {plan.pricePerUser}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-600">
                        {plan.userRange}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link to="/contact" className="w-full">
                        <Button 
                          className="w-full" 
                          variant={plan.highlighted ? "default" : "outline"}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="mt-10 bg-slate-50 p-6 rounded-lg max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold mb-2">Corporate Benefits</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-2 text-blue-700">Admin Dashboard</h4>
                    <p className="text-sm text-slate-600">Track employee progress, manage accounts, and access completion reports for all users.</p>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-2 text-blue-700">Simple Registration</h4>
                    <p className="text-sm text-slate-600">Easy setup process for admins to register employees with CIPR numbers and company information.</p>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-2 text-blue-700">Enhanced Security</h4>
                    <p className="text-sm text-slate-600">Enterprise-grade security to protect confidential data and course content from breaches.</p>
                  </div>
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-2 text-blue-700">Shared Office Address</h4>
                    <p className="text-sm text-slate-600">All users must share the same office address to qualify for corporate pricing.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TooltipProvider>
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Have Questions About Our Pricing?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our team is ready to help you choose the right plan for your continuing education needs or create a custom solution for your organization.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/contact">
                  <Button size="lg">Contact Sales</Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-80 text-sm">Get in touch with our sales team for custom corporate plans or questions about bulk pricing.</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/register">
                  <Button variant="outline" size="lg">Sign Up Now</Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-80 text-sm">Create your account and select your preferred subscription plan.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}