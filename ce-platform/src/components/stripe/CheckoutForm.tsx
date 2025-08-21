import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  amount: number;
  currency: string;
  productName: string;
  onSuccess: (paymentId: string) => void;
}

const CheckoutForm = ({ amount, currency, productName, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    // Get a reference to a mounted CardElement
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // In a real implementation, you would create a payment intent on the server
      // This is just a simulation for demonstration purposes
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate Stripe confirmation
      const result = {
        paymentIntent: {
          id: `pi_${Math.random().toString(36).substring(2, 15)}`,
          status: 'succeeded',
        }
      };
      
      // Handle successful payment
      setSucceeded(true);
      setProcessing(false);
      
      // Call the success callback
      onSuccess(result.paymentIntent.id);
      
    } catch (error) {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };
  
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border rounded-md p-4">
        <div className="mb-4">
          <h3 className="font-semibold">Order Summary</h3>
          <div className="flex justify-between mt-2">
            <span>{productName}</span>
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency.toUpperCase(),
              }).format(amount / 100)}
            </span>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <label className="block text-sm font-medium mb-2">
            Card Details
          </label>
          <div className="p-3 border rounded-md bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="submit"
        disabled={!stripe || processing || succeeded}
        className="w-full"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : succeeded ? (
          "Payment Successful!"
        ) : (
          `Pay ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
          }).format(amount / 100)}`
        )}
      </Button>
      
      <div className="text-xs text-gray-500 text-center">
        Your payment information is secure. We use industry-standard encryption to protect your data.
      </div>
    </form>
  );
};

export default CheckoutForm;