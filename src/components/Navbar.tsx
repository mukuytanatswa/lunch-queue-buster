
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const getNavLinks = () => {
    const baseLinks = [
      { name: 'Home', path: '/' },
      { name: 'Vendors', path: '/vendors' },
      { name: 'About', path: '/about' }
    ];

    if (!user) return baseLinks;

    switch (profile?.role) {
      case 'student':
        return [...baseLinks, { name: 'Orders', path: '/orders' }];
      case 'vendor':
        return [{ name: 'Home', path: '/' }, { name: 'Dashboard', path: '/vendor-dashboard' }, { name: 'About', path: '/about' }];
      case 'driver':
        return [{ name: 'Home', path: '/' }, { name: 'Dashboard', path: '/driver-dashboard' }, { name: 'About', path: '/about' }];
      case 'admin':
        return [{ name: 'Home', path: '/' }, { name: 'Admin Panel', path: '/admin-dashboard' }, { name: 'Vendors', path: '/vendors' }, { name: 'About', path: '/about' }];
      default:
        return baseLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8',
      isScrolled ? 'glassmorphism py-3' : 'bg-transparent py-5'
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">QuickBite</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              location.pathname === link.path ? 'text-primary' : 'text-foreground/80'
            )}>{link.name}</Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>
                  )}
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </Link>
              <span className="text-sm text-foreground/80">Hi, {profile?.first_name || 'User'}</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
              <Button onClick={() => navigate('/auth')}>Get Started</Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden glassmorphism absolute top-full left-0 right-0 p-5 slide-down">
          <nav className="flex flex-col space-y-4">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className={cn(
                'text-sm font-medium p-2 rounded-md transition-colors',
                location.pathname === link.path ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-foreground/80'
              )}>{link.name}</Link>
            ))}
            {user ? (
              <>
                <div className="pt-2 flex items-center space-x-4">
                  <Link to="/cart" className="flex-1">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCart className="h-5 w-5 mr-2" />Cart ({totalItems})
                    </Button>
                  </Link>
                  <Link to="/profile" className="flex-1">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-5 w-5 mr-2" />Profile
                    </Button>
                  </Link>
                </div>
                <Button variant="outline" className="w-full" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />Sign Out
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={() => navigate('/auth')}>Sign In</Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
