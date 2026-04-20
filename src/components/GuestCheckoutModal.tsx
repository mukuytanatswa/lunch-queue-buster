import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onContinue: (info: GuestInfo) => void;
}

export const GuestCheckoutModal = ({ open, onClose, onContinue }: Props) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('All fields are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    onContinue({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Just a few details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>First name</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Thabo" />
            </div>
            <div className="space-y-1">
              <Label>Last name</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mokoena" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="thabo@example.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <p className="text-xs text-muted-foreground">We'll send your order confirmation here.</p>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Setting up...' : 'Continue to checkout'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth" className="underline hover:text-foreground">Sign in</Link>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
