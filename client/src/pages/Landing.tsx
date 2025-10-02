import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, Brain, Tag, Layers, CreditCard, BarChart, Mic, Play, CheckCircle, Clock, Users, ArrowRight, Star, Shield, Zap, Globe } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const handleLogin = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
    }
  };

  const handleDemo = () => {
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border sticky top-0 z-50" data-testid="nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-primary-foreground h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-foreground">EduFlow AI</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              {!isAuthenticated ? (
                <>
                  <Button variant="ghost" onClick={handleLogin} data-testid="button-login">
                    Login
                  </Button>
                  <Button onClick={handleLogin} data-testid="button-start-trial">
                    Start Free Trial
                  </Button>
                </>
              ) : (
                <Button onClick={() => window.location.href = "/"} data-testid="button-dashboard">
                  Go to Dashboard
                </Button>
              )}
            </div>
            <Button variant="ghost" className="md:hidden" data-testid="button-menu">
              <span className="sr-only">Menu</span>
              ☰
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Create AI-Powered 
              <span className="text-primary block">Learning Experiences</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your content into engaging courses with AI-generated slides, voice cloning, interactive quizzes, and automated certificate generation. Built for Alberta Insurance Council compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="text-lg px-8 py-3"
                data-testid="button-start-creating"
              >
                Start Creating Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleDemo}
                className="text-lg px-8 py-3"
                data-testid="button-watch-demo"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Feature Preview Dashboard */}
          <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden animate-slide-up">
            <div className="bg-muted px-6 py-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="ml-4 text-muted-foreground text-sm">Course Creator Dashboard</span>
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg text-primary">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">AI Course Generator</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg text-muted-foreground cursor-pointer">
                      <Mic className="w-4 h-4" />
                      <span>Voice Cloning</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg text-muted-foreground cursor-pointer">
                      <Brain className="w-4 h-4" />
                      <span>Quiz Generator</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg text-muted-foreground cursor-pointer">
                      <Tag className="w-4 h-4" />
                      <span>AIC Certificates</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg text-muted-foreground cursor-pointer">
                      <BarChart className="w-4 h-4" />
                      <span>Analytics</span>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* AI Course Generator Interface */}
                  <div className="bg-muted/50 rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      <Zap className="inline mr-2 text-primary" />
                      AI Course Generator
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Upload Course Material</label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <div className="text-3xl text-muted-foreground mb-2">📁</div>
                          <p className="text-muted-foreground">Drop your Word docs, PDFs, or MP4 files here</p>
                          <p className="text-sm text-muted-foreground mt-1">Supports Google Docs integration</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Course Duration</label>
                          <select className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                            <option>1 Hour</option>
                            <option>2 Hours</option>
                            <option>Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Accreditation Type</label>
                          <select className="w-full px-3 py-2 border border-border rounded-lg bg-background">
                            <option>Alberta AIC</option>
                            <option>General CE</option>
                            <option>Custom</option>
                          </select>
                        </div>
                      </div>

                      <Button className="w-full" data-testid="button-generate-course">
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Course with AI
                      </Button>
                    </div>
                  </div>

                  {/* Generated Course Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-2">Generated Slides</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                            <Layers className="text-primary h-4 w-4" />
                            <span className="text-sm">Introduction to Risk Management</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                            <Layers className="text-primary h-4 w-4" />
                            <span className="text-sm">Insurance Types Overview</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                            <Layers className="text-primary h-4 w-4" />
                            <span className="text-sm">Policy Analysis Framework</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground mb-2">AI-Generated Quizzes</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-2 bg-accent/10 rounded">
                            <Brain className="text-accent h-4 w-4" />
                            <span className="text-sm">Module 1 Quiz (4 questions)</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-accent/10 rounded">
                            <Brain className="text-accent h-4 w-4" />
                            <span className="text-sm">Module 2 Quiz (3 questions)</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 bg-accent/10 rounded">
                            <Users className="text-accent h-4 w-4" />
                            <span className="text-sm">Final Assessment (75% pass)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Create Professional Courses
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From AI-powered content generation to AIC-compliant certificate automation, we handle the technical complexity so you can focus on teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Voice Cloning Feature */}
            <Card className="hover:shadow-md transition-shadow" data-testid="card-voice-cloning">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Voice Cloning</h3>
                <p className="text-muted-foreground mb-4">Extract and clone voices from MP4 uploads. Synchronize presentations with natural-sounding narration in 175+ languages.</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Play className="text-accent h-4 w-4" />
                    <span>Upload MP4 → Extract Voice → Generate Narration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Quiz Generator */}
            <Card className="hover:shadow-md transition-shadow" data-testid="card-quiz-generator">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="text-secondary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Smart Quiz Generation</h3>
                <p className="text-muted-foreground mb-4">AI automatically creates engaging quizzes and live polls from your content, with 75% pass requirements for certification.</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-1">
                      <Brain className="text-accent h-4 w-4" />
                      <span>3-4 per module</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="text-accent h-4 w-4" />
                      <span>Live polling</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AIC Compliance */}
            <Card className="hover:shadow-md transition-shadow" data-testid="card-aic-compliance">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Tag className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AIC Tag Automation</h3>
                <p className="text-muted-foreground mb-4">Automatically generate Alberta Insurance Council compliant certificates and submission PDFs with exact formatting requirements.</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm text-accent font-medium">✓ Auto CIPR# integration</div>
                </div>
              </CardContent>
            </Card>

            {/* Course Builder */}
            <Card className="hover:shadow-md transition-shadow" data-testid="card-course-builder">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Layers className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Course Builder</h3>
                <p className="text-muted-foreground mb-4">Upload Word docs, PDFs, or Google Docs and get professionally structured courses with slides, timing, and assessments.</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <span>📄</span>
                    <span>📊</span>
                    <span>📁</span>
                    <span>Multi-format support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Integration */}
            <Card className="hover:shadow-md transition-shadow" data-testid="card-payment">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="text-secondary h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Flexible Pricing</h3>
                <p className="text-muted-foreground mb-4">Built-in Stripe integration with individual courses ($19) and discounted bundles ($89) plus 6-month access control.</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>$19/course</span>
                    <span>$89/bundle</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Dashboard */}
            <Card className="hover:shadow-md transition-shadow" data-testid="card-analytics">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="text-accent h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">Track student progress, completion rates, quiz performance, and certificate generation with detailed reporting.</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="text-accent font-semibold">92%</span> average completion rate
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that works for your course creation needs. No hidden fees, no long-term contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative" data-testid="card-plan-starter">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>5 courses per month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>AI slide generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Basic quiz generator</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Standard certificates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={handleLogin} data-testid="button-plan-starter">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan (Featured) */}
            <Card className="relative border-2 border-primary" data-testid="card-plan-professional">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Professional</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">$149</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>25 courses per month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>AI voice cloning</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Advanced quiz & live polls</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>AIC-compliant certificates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Student analytics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={handleLogin} data-testid="button-plan-professional">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative" data-testid="card-plan-enterprise">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Unlimited courses</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>White-label solution</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Multi-region compliance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-accent h-4 w-4" />
                    <span>24/7 phone support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" data-testid="button-plan-enterprise">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Features */}
          <div className="mt-16 bg-muted/50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-foreground text-center mb-8">All Plans Include</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="mx-auto text-primary h-12 w-12 mb-4" />
                <h4 className="font-semibold text-foreground mb-2">Secure Hosting</h4>
                <p className="text-muted-foreground text-sm">SOC 2 compliant infrastructure with 99.9% uptime guarantee</p>
              </div>
              <div className="text-center">
                <Zap className="mx-auto text-primary h-12 w-12 mb-4" />
                <h4 className="font-semibold text-foreground mb-2">Auto Updates</h4>
                <p className="text-muted-foreground text-sm">Regular feature updates and compliance requirement changes</p>
              </div>
              <div className="text-center">
                <Globe className="mx-auto text-primary h-12 w-12 mb-4" />
                <h4 className="font-semibold text-foreground mb-2">Expert Support</h4>
                <p className="text-muted-foreground text-sm">Dedicated support team familiar with educational compliance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Course Creation?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of educators using AI to create engaging, compliant courses. Start your free trial today and experience the future of online learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              onClick={handleLogin}
              className="text-lg px-8 py-4"
              data-testid="button-start-trial-cta"
            >
              Start Free 14-Day Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              data-testid="button-schedule-demo"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-4">
            No credit card required • Cancel anytime • Setup in 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-primary-foreground h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-foreground">EduFlow AI</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Transforming education with AI-powered course creation, voice cloning, and automated compliance for professional learning environments.
              </p>
              <div className="flex space-x-4">
                <div className="text-muted-foreground hover:text-primary cursor-pointer">
                  <Star className="h-5 w-5" />
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-muted-foreground hover:text-primary cursor-pointer">
                  <Play className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">AIC Compliance</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 EduFlow AI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
