import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Lock, CheckCircle, Clock, BookOpen, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { Course } from "@shared/schema";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ course, onSuccess }: { course: Course; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/student`,
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! You now have access to the course.",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-border rounded-lg">
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Complete Payment - ${course.price}
          </>
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        amount,
        courseId 
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Setup Failed",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/enrollments", { courseId });
      return response.json();
    },
    onSuccess: () => {
      setPaymentSuccess(true);
      setTimeout(() => {
        setLocation(`/course/${courseId}`);
      }, 3000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  useEffect(() => {
    if (course && course.price) {
      createPaymentIntentMutation.mutate(course.price);
    }
  }, [course]);

  const handlePaymentSuccess = () => {
    enrollMutation.mutate();
  };

  if (courseLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
          <p className="text-muted-foreground">The course you're trying to purchase doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  if (paymentSuccess) {
    return (
      <Layout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="text-center p-8">
            <CardContent>
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-accent" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">
                You have been successfully enrolled in {course.title}. 
                Redirecting to your course in a few seconds...
              </p>
              <Button onClick={() => setLocation(`/course/${courseId}`)} data-testid="button-go-to-course">
                Go to Course Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!clientSecret) {
    return (
      <Layout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Setting up payment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">
            Secure checkout powered by Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Course Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={course.accreditationType === "AIC" ? "default" : "secondary"}>
                  {course.accreditationType}
                </Badge>
                <Badge variant="outline">{course.accreditationClass}</Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.duration} minutes duration</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>Interactive modules with quizzes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>Professional certificate upon completion</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Course Price</span>
                  <span className="font-semibold">${course.price}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${course.price}</span>
                </div>
              </div>

              <div className="bg-accent/10 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-accent">What You Get</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Lifetime access to course content</li>
                      <li>• Interactive quizzes and assessments</li>
                      <li>• Professional certificate</li>
                      <li>• 6-month access period</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm course={course} onSuccess={handlePaymentSuccess} />
              </Elements>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Your payment information is secure and encrypted. We never store your card details.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span>Money-back Guarantee</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
