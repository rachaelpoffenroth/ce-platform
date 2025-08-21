import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PricingPreview() {
  const navigate = useNavigate();
  
  const plans = [
    {
      name: "Pay Per Course",
      price: "$29",
      description: "per course",
      features: [
        "1 CE credit per course",
        "30 days access",
        "Professional certificate"
      ]
    },
    {
      name: "6-Month Access",
      price: "$99",
      description: "for 6 months",
      features: [
        "Unlimited courses",
        "All certificates",
        "Downloadable tax receipts"
      ],
      highlight: true
    },
    {
      name: "Annual Access",
      price: "$179",
      description: "for a full year",
      features: [
        "Unlimited courses",
        "All certificates",
        "Priority support"
      ]
    }
  ];

  return (
    <section className="py-12 bg-slate-50">
      <div className="container px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that's right for your continuing education needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`${plan.highlight ? "border-primary shadow-md relative" : ""} flex flex-col`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.description}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => navigate('/pricing')}
                >
                  View Plan Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Button 
            variant="link" 
            size="lg" 
            onClick={() => navigate('/pricing')}
          >
            View All Pricing Options
          </Button>
        </div>
      </div>
    </section>
  );
}