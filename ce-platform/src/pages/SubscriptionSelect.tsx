import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, InfoIcon, BuildingIcon, UserIcon, CreditCardIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface IndividualPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  perCourse: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

interface CorporatePlan {
  id: string;
  name: string;
  description: string;
  userRange: string;
  pricePerUser: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const individualPlans: IndividualPlan[] = [
  {
    id: "pay-per-course",
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
    ]
  },
  {
    id: "six-month",
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
    highlighted: true,
    badge: "Popular"
  },
  {
    id: "annual",
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
    badge: "Best Value"
  }
];

const corporatePlans: CorporatePlan[] = [
  {
    id: "team",
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
    ]
  },
  {
    id: "enterprise",
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
    highlighted: true
  },
  {
    id: "corporate-plus",
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
    ]
  }
];

export default function SubscriptionSelect() {
  const navigate = useNavigate();
  const [planType, setPlanType] = useState<"individual" | "corporate">("individual");
  const [selectedPlan, setSelectedPlan] = useState<string>("six-month");
  
  const handleContinue = () => {
    // In a real implementation, this would save the selected plan and redirect to registration or payment
    navigate(`/register?plan=${selectedPlan}&type=${planType}`);
  };
  
  return (
    <div className="container max-w-7xl py-12 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Choose Your Subscription Plan</h1>
        <p className="text-lg text-muted-foreground">
          Select a plan that fits your needs and start your continuing education journey
        </p>
      </div>
      
      <div className="flex justify-center mb-10">
        <Tabs defaultValue="individual" className="w-full max-w-md" onValueChange={(value) => {
          setPlanType(value as "individual" | "corporate");
          setSelectedPlan(value === "individual" ? "six-month" : "enterprise");
        }}>
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
        </Tabs>
      </div>
      
      {planType === "individual" && (
        <div className="grid md:grid-cols-3 gap-8">
          {individualPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`flex flex-col ${
                selectedPlan === plan.id 
                  ? "border-primary ring-2 ring-primary ring-opacity-50" 
                  : plan.highlighted 
                    ? "border-primary shadow-md"
                    : ""
              } cursor-pointer hover:border-primary transition-all`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.badge && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {selectedPlan === plan.id && <CheckIcon className="h-5 w-5 text-primary" />}
                </CardTitle>
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
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? "Selected" : "Select"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {planType === "corporate" && (
        <div className="grid md:grid-cols-3 gap-8">
          {corporatePlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`flex flex-col ${
                selectedPlan === plan.id 
                  ? "border-primary ring-2 ring-primary ring-opacity-50" 
                  : plan.highlighted 
                    ? "border-primary shadow-md"
                    : ""
              } cursor-pointer hover:border-primary transition-all`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.badge && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {selectedPlan === plan.id && <CheckIcon className="h-5 w-5 text-primary" />}
                </CardTitle>
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
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? "Selected" : "Select"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-12">
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Important Subscription Information</h3>
              <p className="text-sm text-slate-700 mb-4">
                All subscriptions include access to our full catalog of insurance continuing education courses. 
                Certificates are delivered instantly upon course completion.
              </p>
              
              {planType === "corporate" && (
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h4 className="font-medium mb-2 text-blue-700">Corporate Account Requirements</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>All users must be at the same office address</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Each user requires a CIPR number for certificate issuance</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Admin can easily add/remove users through the dashboard</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          
          <Button onClick={handleContinue} size="lg" className="gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Continue to Payment
          </Button>
        </div>
      </div>
    </div>
  );
}