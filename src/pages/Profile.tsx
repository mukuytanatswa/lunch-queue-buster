
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Edit2Icon, UserIcon } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="h-24 w-24 bg-brand-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-brand-600" />
                </div>
                
                <div className="flex-grow">
                  <h1 className="text-2xl font-bold mb-1">UCT Student</h1>
                  <p className="text-muted-foreground mb-4">student@myuct.ac.za</p>
                  
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit2Icon className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p>UCT Student</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>student@myuct.ac.za</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>+27 71 234 5678</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Delivery Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Default Location</p>
                    <p>Computer Science Building, Upper Campus</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alternative Location</p>
                    <p>Main Library, Level 3</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Notes</p>
                    <p>Please text when arriving</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
              <div className="rounded-lg border p-4 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 bg-brand-100 rounded flex items-center justify-center">
                    <span className="font-semibold text-brand-600">Visa</span>
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 1234</p>
                    <p className="text-sm text-muted-foreground">Expires 09/2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
              
              <Button variant="outline">Add Payment Method</Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
