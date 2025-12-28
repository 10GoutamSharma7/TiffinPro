import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { UserProvider, useUserRole } from './context/UserContext';
import { motion } from 'framer-motion';
import { ChefHat, Search, Clock, ShieldCheck, MapPin, Heart, ArrowRight } from 'lucide-react';

// Pages
import RoleSelection from './pages/RoleSelection';
import BrowseServices from './pages/BrowseServices';
import ServiceDetails from './pages/ServiceDetails';
import MyApplications from './pages/MyApplications';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ManageService from './pages/provider/ManageService';
import ManageApplications from './pages/provider/ManageApplications';
import ManageMenu from './pages/provider/ManageMenu';
import ManageReviews from './pages/provider/ManageReviews';

const CLERK_PUBLISHABLE_KEY = "pk_test_dmlhYmxlLWtpZC00Ny5jbGVyay5hY2NvdW50cy5kZXYk";

const Navbar = () => {
  const navigate = useNavigate();
  const { userRole } = useUserRole();

  return (
    <nav className="glass-morphism" style={{
      margin: '20px',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: '20px',
      zIndex: 100,
      flexWrap: 'wrap',
      gap: '15px'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <ChefHat size={32} style={{ color: '#ff4c4c' }} />
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
          Tiffin<span className="gradient-text">Pro</span>
        </h2>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <SignedIn>
          {userRole === 'customer' && (
            <>
              <Link to="/browse" className="nav-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Browse</Link>
              <Link to="/my-applications" className="nav-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>My Applications</Link>
            </>
          )}
          {userRole === 'provider' && (
            <>
              <Link to="/provider/dashboard" className="nav-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
              <Link to="/provider/service" className="nav-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Service</Link>
              <Link to="/provider/applications" className="nav-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Applications</Link>
              <Link to="/provider/reviews" className="nav-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Reviews</Link>
            </>
          )}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <Link to="/#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Features</Link>
          <Link to="/#explore" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Explore</Link>
          <SignInButton mode="modal">
            <button className="btn-primary" style={{ padding: '8px 20px' }}>Login</button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" style={{
      padding: '100px 20px',
      textAlign: 'center',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 style={{ fontSize: '4.5rem', marginBottom: '20px', lineHeight: 1.1 }}>
          Healthy Meals, <br />
          <span className="gradient-text">Right From Home.</span>
        </h1>
        <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Discover home-cooked tiffin services near you. Freshly prepared, hygienically packed, and delivered with love.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <SignedIn>
            <button
              onClick={() => navigate('/browse')}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              Browse Services <ArrowRight size={20} />
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                Get Started <ArrowRight size={20} />
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{ marginTop: '80px', position: 'relative' }}
      >
        <div className="glass-morphism" style={{
          width: '100%',
          height: '400px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000"
            alt="Delicious Food"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, var(--bg-dark), transparent)'
          }} />
        </div>
      </motion.div>
    </section>
  );
};

const Features = () => {
  const features = [
    { icon: <Clock size={32} />, title: "Instant Delivery", desc: "Always on time, hot and fresh meals at your doorstep." },
    { icon: <ShieldCheck size={32} />, title: "Verified Chefs", desc: "Every provider is vetted for hygiene and taste standards." },
    { icon: <Heart size={32} />, title: "Healthy & Pure", desc: "No soda, no excess oil. Pure home-cooked goodness." },
  ];

  return (
    <section id="features" style={{ padding: '80px 20px', background: 'rgba(0,0,0,0.2)' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '2.5rem' }}>Why Choose <span className="gradient-text">TiffinPro?</span></h2>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className="glass-morphism"
            style={{ padding: '40px', textAlign: 'center' }}
          >
            <div style={{ color: 'var(--primary)', marginBottom: '20px' }}>{f.icon}</div>
            <h3 style={{ marginBottom: '15px' }}>{f.title}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer style={{ padding: '60px 20px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '100px' }}>
    <div style={{ marginBottom: '20px' }}>
      <ChefHat size={32} style={{ color: '#ff4c4c', margin: '0 auto' }} />
      <h2 style={{ fontSize: '1.5rem', marginTop: '10px' }}>Tiffin<span className="gradient-text">Pro</span></h2>
    </div>
    <p style={{ color: 'var(--text-secondary)' }}>© 2025 TiffinPro. Made with ❤️ for a healthier world.</p>
  </footer>
);

const LandingPage = () => (
  <>
    <Navbar />
    <Hero />
    <Features />
    <Footer />
  </>
);

const ProtectedRoute = ({ children, requiredRole }) => {
  const { userRole, loading } = useUserRole();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  if (!userRole) {
    return <Navigate to="/select-role" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'customer' ? '/browse' : '/provider/dashboard'} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { userRole, loading } = useUserRole();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/select-role" element={
        <SignedIn>
          {userRole ? (
            <Navigate to={userRole === 'customer' ? '/browse' : '/provider/dashboard'} replace />
          ) : (
            <RoleSelection />
          )}
        </SignedIn>
      } />

      {/* Customer Routes */}
      <Route path="/browse" element={
        <SignedIn>
          <ProtectedRoute requiredRole="customer">
            <Navbar />
            <BrowseServices />
          </ProtectedRoute>
        </SignedIn>
      } />

      <Route path="/service/:id" element={
        <SignedIn>
          <ProtectedRoute requiredRole="customer">
            <Navbar />
            <ServiceDetails />
          </ProtectedRoute>
        </SignedIn>
      } />

      <Route path="/my-applications" element={
        <SignedIn>
          <ProtectedRoute requiredRole="customer">
            <Navbar />
            <MyApplications />
          </ProtectedRoute>
        </SignedIn>
      } />

      {/* Provider Routes */}
      <Route path="/provider/dashboard" element={
        <SignedIn>
          <ProtectedRoute requiredRole="provider">
            <Navbar />
            <ProviderDashboard />
          </ProtectedRoute>
        </SignedIn>
      } />

      <Route path="/provider/service" element={
        <SignedIn>
          <ProtectedRoute requiredRole="provider">
            <Navbar />
            <ManageService />
          </ProtectedRoute>
        </SignedIn>
      } />

      <Route path="/provider/applications" element={
        <SignedIn>
          <ProtectedRoute requiredRole="provider">
            <Navbar />
            <ManageApplications />
          </ProtectedRoute>
        </SignedIn>
      } />

      <Route path="/provider/menu" element={
        <SignedIn>
          <ProtectedRoute requiredRole="provider">
            <Navbar />
            <ManageMenu />
          </ProtectedRoute>
        </SignedIn>
      } />

      <Route path="/provider/reviews" element={
        <SignedIn>
          <ProtectedRoute requiredRole="provider">
            <Navbar />
            <ManageReviews />
          </ProtectedRoute>
        </SignedIn>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <UserProvider>
        <BrowserRouter>
          <div className="App">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </UserProvider>
    </ClerkProvider>
  );
}

export default App;
