import CorporateSignupForm from "@/components/subscription/CorporateSignupForm";

export default function CorporateRegistration() {
  return (
    <div className="container max-w-5xl py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Corporate Account Registration</h1>
        <p className="text-lg text-muted-foreground">
          Register your organization for Easy CE's corporate insurance continuing education program
        </p>
      </div>
      
      <CorporateSignupForm />
    </div>
  );
}