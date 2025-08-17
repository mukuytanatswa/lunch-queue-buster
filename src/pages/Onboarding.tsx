import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Check } from 'lucide-react';

const Onboarding = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    campus_location: '',
  });

  // Redirect if not authenticated or already onboarded
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  const handleSkip = () => {
    navigate('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    await updateProfile({
      ...formData,
      onboarding_completed: true,
    });

    setIsLoading(false);
    navigate('/');
  };

  const steps = [
    {
      title: "Welcome to QuickBite!",
      description: "Let's set up your profile to get started",
      icon: <Check className="h-6 w-6" />,
    },
    {
      title: "Almost done!",
      description: "Just a few more details to personalize your experience",
      icon: <MapPin className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {steps[currentStep - 1].icon}
          </div>
          <CardTitle className="text-xl font-bold">
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">
                  Hi {profile?.first_name || 'there'}! 👋
                </h3>
                <p className="text-sm text-muted-foreground">
                  You're signed up as a <span className="font-medium capitalize">{profile?.role}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip for now
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campus_location">Campus Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="campus_location"
                    placeholder="e.g., Engineering Building, Student Center"
                    className="pl-10"
                    value={formData.campus_location}
                    onChange={(e) => handleInputChange('campus_location', e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This helps us show you nearby restaurants and faster delivery options
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip for now
                </Button>
                <Button 
                  onClick={handleComplete} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;