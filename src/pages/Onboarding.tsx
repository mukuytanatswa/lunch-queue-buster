import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';

const Onboarding = () => {
  const { user, profile, profileLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');

  if (!user) return <Navigate to="/auth" replace />;
  if (profileLoading) return null;
  if (profile?.onboarding_completed) return <Navigate to="/" replace />;

  const handleComplete = async () => {
    setIsLoading(true);
    await updateProfile({ phone, onboarding_completed: true });
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Welcome to QuickBite!</CardTitle>
          <CardDescription>Let's set up your profile to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Hi {profile?.first_name || 'there'}!</h3>
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
                  placeholder="+27 71 234 5678"
                  className="pl-10"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                Skip for now
              </Button>
              <Button onClick={handleComplete} className="flex-1" disabled={isLoading}>
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background" /> : 'Get Started'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;