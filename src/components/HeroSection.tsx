
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden bg-gradient-to-b from-brand-50 to-white">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-100 opacity-60 blur-3xl"></div>
        <div className="absolute bottom-10 -left-20 h-60 w-60 rounded-full bg-brand-200 opacity-40 blur-3xl"></div>
      </div>

      <div className="container relative h-full mx-auto px-4 md:px-6 flex flex-col justify-center items-center text-center z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight slide-up">
              Skip the Lunch Queue at UCT
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto slide-up stagger-1">
              Pre-order from your favourite campus vendors and collect your food without waiting in line. Save time and never miss a class again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up stagger-2">
            <Button asChild size="lg" className="bg-brand-500 hover:bg-brand-600 text-white px-8">
              <Link to="/vendors">Order Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="group">
              <Link to="/about" className="flex items-center">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="pt-8 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 slide-up stagger-3">
            {[
              { label: 'Campus Vendors', value: '10+' },
              { label: 'Prep Time', value: '15-25 min' },
              { label: 'Time Saved', value: '30+ min' }
            ].map((stat, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-3xl font-bold text-brand-600">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Decoration at Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-20">
          <path fill="white" fillOpacity="1" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,37.3C1120,21,1280,11,1360,5.3L1440,0L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
