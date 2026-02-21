
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2Icon, UserIcon, Save, X } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Profile = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    campus_location: profile?.campus_location || '',
  });

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    if (!error) {
      setEditing(false);
      toast.success('Profile updated');
    }
  };

  // Sync form data when profile loads
  if (profile && !editing && formData.first_name !== (profile.first_name || '')) {
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      campus_location: profile.campus_location || '',
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-grow">
                  {editing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>First Name</Label>
                          <Input value={formData.first_name} onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input value={formData.last_name} onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Campus Location</Label>
                        <Input value={formData.campus_location} onChange={e => setFormData(p => ({ ...p, campus_location: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save</Button>
                        <Button variant="outline" onClick={() => setEditing(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold mb-1">{profile?.first_name} {profile?.last_name}</h1>
                      <p className="text-muted-foreground mb-1">{user?.email}</p>
                      <p className="text-sm text-muted-foreground capitalize mb-4">Role: {profile?.role}</p>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditing(true)}>
                        <Edit2Icon className="h-4 w-4" />Edit Profile
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-card rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div><p className="text-sm text-muted-foreground">Full Name</p><p>{profile?.first_name} {profile?.last_name}</p></div>
                  <div><p className="text-sm text-muted-foreground">Email</p><p>{user?.email}</p></div>
                  <div><p className="text-sm text-muted-foreground">Phone</p><p>{profile?.phone || 'Not set'}</p></div>
                </div>
              </div>
              <div className="bg-card rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery Preferences</h2>
                <div className="space-y-4">
                  <div><p className="text-sm text-muted-foreground">Campus Location</p><p>{profile?.campus_location || 'Not set'}</p></div>
                  <div><p className="text-sm text-muted-foreground">Onboarding</p><p>{profile?.onboarding_completed ? 'Completed' : 'Not completed'}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
