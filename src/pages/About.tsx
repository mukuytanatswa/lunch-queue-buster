
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">About QuickBite</h1>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                QuickBite was created to solve a significant problem at the University of Cape Town: 
                the long lunch queues that lead to wasted time, missed classes, and general frustration.
              </p>
              <p className="text-lg text-muted-foreground">
                Our mission is to help UCT students and staff save time and reduce stress by allowing them 
                to order food from campus vendors online and have it delivered directly to them, whether they're 
                in the library, in a study room, or between classes.
              </p>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-brand-50 p-6 rounded-lg">
                  <div className="bg-brand-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-brand-600 font-bold">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Order Online</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse campus vendors and place your order through our easy-to-use platform.
                  </p>
                </div>
                <div className="bg-brand-50 p-6 rounded-lg">
                  <div className="bg-brand-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-brand-600 font-bold">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Vendor Prepares</h3>
                  <p className="text-sm text-muted-foreground">
                    The vendor receives your order and prepares it while you continue with your day.
                  </p>
                </div>
                <div className="bg-brand-50 p-6 rounded-lg">
                  <div className="bg-brand-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-brand-600 font-bold">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Quick Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Our delivery partners collect and deliver your food to your specified location on campus.
                  </p>
                </div>
              </div>
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
              <p className="text-lg text-muted-foreground mb-6">
                QuickBite was created by UCT students who experienced the lunch queue problem firsthand.
                We're dedicated to improving campus life through innovative solutions.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
