import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';

const InviteAccept = () => {
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    if (!loading && !token) {
      toast({
        title: "Invalid invite link",
        description: "This invite link is invalid or has expired.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [token, loading, navigate, toast]);

  const handleAcceptInvite = async () => {
    if (!token) return;

    setIsProcessing(true);
    
    try {
      // Here you would normally process the invite
      // For now, we'll just simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invite accepted!",
        description: "You have successfully joined the platform.",
      });
      
      // Redirect based on invite type
      if (type === 'vendor') {
        navigate('/vendor-dashboard');
      } else if (type === 'driver') {
        navigate('/driver-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error processing invite",
        description: "There was an error processing your invite. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">QuickBite Invite</CardTitle>
          <CardDescription>
            You've been invited to join QuickBite as {type === 'vendor' ? 'a vendor' : type === 'driver' ? 'a driver' : 'a member'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icons.spinner className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Welcome to QuickBite!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to accept your invitation and get started.
              </p>
            </div>

            {user ? (
              <Button 
                onClick={handleAcceptInvite} 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Accept Invitation
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please sign in to accept your invitation.
                </p>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full"
                >
                  Sign In to Continue
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAccept;