import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Home, 
  Wallet, 
  User, 
  ChevronRight,
  TrendingUp,
  Box,
  ArrowLeft,
  Info,
  History,
  Map as MapIcon,
  AlertTriangle,
  UploadCloud,
  ShieldCheck,
  CreditCard,
  Mail,
  Lock,
  LogOut,
  Phone,
  Ruler,
  Scale,
  MessageSquare,
  Star,
  Car,
  Settings,
  Shield,
  Award,
  Truck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Delivery {
  id: string;
  address: string;
  customer: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryInstructions?: string;
  weight?: string;
  dimensions?: string;
  status: 'pending' | 'in-progress' | 'delivered';
  timeSlot: string;
  priority: 'High' | 'Standard';
  contents?: string[];
  history?: { event: string; time: string }[];
  coordinates?: [number, number];
}

type View = 'dashboard' | 'packages' | 'earnings' | 'route' | 'kyc' | 'auth' | 'profile';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('auth');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasSignedUp, setHasSignedUp] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<Delivery | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    { 
      id: 'AZ-101', 
      address: '123 Tech Lane, Seattle', 
      customer: 'John Doe', 
      customerPhone: '+1 (555) 019-2831',
      customerEmail: 'john.d@example.com',
      deliveryInstructions: 'Leave package at the back door behind the planter.',
      weight: '4.2 lbs',
      dimensions: '12" x 8" x 6"',
      status: 'pending', 
      timeSlot: '10:00 AM - 12:00 PM', 
      priority: 'High',
      contents: ['iPhone 15 Pro', 'Wireless Charger'],
      history: [
        { event: 'Received at Station', time: '08:00 AM' },
        { event: 'Out for Delivery', time: '09:30 AM' }
      ],
      coordinates: [47.6062, -122.3321]
    },
    { 
      id: 'AZ-202', 
      address: '456 Innovation Blvd, Seattle', 
      customer: 'Jane Smith', 
      customerPhone: '+1 (555) 012-9843',
      deliveryInstructions: 'Access code for gate: 4812. Please do not ring doorbell.',
      weight: '12.5 lbs',
      dimensions: '20" x 14" x 10"',
      status: 'pending', 
      timeSlot: '1:00 PM - 3:00 PM', 
      priority: 'Standard',
      contents: ['Kitchen Mixer'],
      history: [
        { event: 'Received at Station', time: '07:30 AM' }
      ],
      coordinates: [47.6131, -122.3421]
    },
    { 
      id: 'AZ-303', 
      address: '789 Future Way, Seattle', 
      customer: 'Bob Miller', 
      customerPhone: '+1 (555) 084-2910',
      weight: '2.1 lbs',
      dimensions: '10" x 6" x 4"',
      status: 'pending', 
      timeSlot: '3:00 PM - 5:00 PM', 
      priority: 'High',
      contents: ['Running Shoes', 'Water Bottle'],
      history: [
        { event: 'Received at Station', time: '10:00 AM' }
      ],
      coordinates: [47.6200, -122.3500]
    },
  ]);

  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success'|'error'|'info'}[]>([]);
  const [withdrawnAmount, setWithdrawnAmount] = useState<number>(0);
  const [isKycVerified, setIsKycVerified] = useState<boolean>(false);
  const [kycLoading, setKycLoading] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    // Hide splash screen after animation completes (2.5s delay + 0.5s fade in CSS)
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    performance: 98,
  };

  const basePay = stats.delivered * 10;
  const tips = stats.delivered > 0 ? 10.50 : 0;
  const bonuses = stats.delivered > 0 ? 5.00 : 0;
  const totalEarnings = basePay + tips + bonuses;
  const availableBalance = totalEarnings - withdrawnAmount;

  const handleWithdraw = () => {
    if (!isKycVerified) {
      showToast('KYC Verification Required before withdrawal.', 'error');
      setCurrentView('kyc');
      return;
    }
    if (availableBalance <= 0) {
      showToast('No available balance to withdraw.', 'error');
      return;
    }
    showToast(`Successfully withdrew $${availableBalance.toFixed(2)} to your linked bank account.`, 'success');
    setWithdrawnAmount(prev => prev + availableBalance);
  };
  
  const handleKycSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setKycLoading(true);
      showToast('Processing Identity Verification...', 'info');
      
      setTimeout(() => {
          setKycLoading(false);
          setIsKycVerified(true);
          showToast('Payment Gateway & KYC Verified Successfully! 🎉', 'success');
          setCurrentView('earnings');
      }, 3000);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newId = `AZ-${Math.floor(Math.random() * 900) + 100}`;
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lngOffset = (Math.random() - 0.5) * 0.05;
      const baseLat = 47.6062;
      const baseLng = -122.3321;
      
      const newDelivery: Delivery = {
        id: newId,
        address: `New Dropoff ${Math.floor(Math.random() * 100)}, Seattle`,
        customer: `Customer ${Math.floor(Math.random() * 1000)}`,
        customerPhone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        weight: `${(Math.random() * 15).toFixed(1)} lbs`,
        status: 'pending',
        timeSlot: 'ASAP',
        priority: Math.random() > 0.7 ? 'High' : 'Standard',
        contents: ['Surprise Item'],
        history: [{ event: 'Order Received', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }],
        coordinates: [baseLat + latOffset, baseLng + lngOffset]
      };
      
      setDeliveries(prev => [...prev, newDelivery]);
      showToast(`New priority order received: ${newId}`, 'info');
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = (id: string, newStatus: Delivery['status']) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    if (newStatus === 'delivered') {
      showToast(`Package ${id} delivered successfully`, 'success');
    }
  };

  if (!mounted) return null;

  const renderDashboard = () => (
    <div className="animate-slide-up">
      <section style={{ marginBottom: '40px' }}>
        <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '8px', letterSpacing: '1px' }}>DASHBOARD VIEW</p>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1.1 }}>
          Ready for your <span className="primary-text-gradient">Guidewire</span> shift?
        </h1>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(88, 166, 255, 0.1)', display: 'grid', placeItems: 'center', color: '#58A6FF' }}>
                  <Box size={20} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#58A6FF', fontWeight: '600' }}>Active Route</span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Remaining Stops</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="stat-value">{stats.total - stats.delivered}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>/ {stats.total} total</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(35, 134, 54, 0.1)', display: 'grid', placeItems: 'center', color: '#3fb950' }}>
                  <TrendingUp size={20} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#3fb950', fontWeight: '600' }}>{stats.performance}% Score</span>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Projected Earnings</p>
          <span className="stat-value">${totalEarnings.toFixed(2)}</span>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>Upcoming Tasks</h2>
          <button onClick={() => setCurrentView('route')} style={{ color: 'var(--primary)', background: 'none', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Optimized Route <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {deliveries.filter(d => d.status !== 'delivered').map((delivery) => (
            <div key={delivery.id} className="glass-card" style={{ padding: '24px' }} onClick={() => setSelectedPackage(delivery)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '16px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      display: 'grid', 
                      placeItems: 'center',
                      color: delivery.priority === 'High' ? 'var(--primary)' : 'var(--text-dim)'
                  }}>
                      <Package size={28} />
                  </div>
                  <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{delivery.customer}</h3>
                          {delivery.priority === 'High' && (
                              <span style={{ backgroundColor: 'rgba(255, 153, 0, 0.15)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>PRIORITY</span>
                          )}
                      </div>
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} /> {delivery.address}
                      </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '600' }}>
                      <Clock size={14} /> {delivery.timeSlot}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.3)', marginTop: '4px' }}># {delivery.id}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button 
                  className="btn-primary" 
                  style={{ flex: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(delivery.id, 'delivered');
                  }}
                 >
                   <CheckCircle2 size={18} /> Confirm Delivery
                 </button>
                 <button className="glass-card" style={{ flex: 1, fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={(e) => { e.stopPropagation(); setCurrentView('route'); }}>
                   <Navigation size={18} /> Map
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderPackages = () => (
    <div className="animate-slide-up">
       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', color: 'var(--text-dim)' }}><ArrowLeft size={24} /></button>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Packages List</h1>
       </div>

       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {deliveries.map(delivery => (
            <div key={delivery.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => setSelectedPackage(delivery)}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'grid', placeItems: 'center' }}>
                        <Package size={24} color={delivery.status === 'delivered' ? '#3fb950' : '#8B949E'} />
                    </div>
                    <div>
                        <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{delivery.id}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{delivery.customer}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '800', 
                        padding: '4px 10px', 
                        borderRadius: '20px',
                        backgroundColor: delivery.status === 'delivered' ? 'rgba(63, 185, 80, 0.1)' : 'rgba(255, 153, 0, 0.1)',
                        color: delivery.status === 'delivered' ? '#3fb950' : '#FF9900'
                    }}>
                        {delivery.status.toUpperCase()}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '6px' }}>{delivery.timeSlot}</p>
                </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="animate-slide-up">
       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', color: 'var(--text-dim)' }}><ArrowLeft size={24} /></button>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Earnings</h1>
       </div>

       <div className="glass-card" style={{ padding: '32px', textAlign: 'center', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(0, 177, 160, 0.1) 0%, rgba(10, 15, 25, 0.7) 100%)' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginBottom: '8px', fontWeight: '600' }}>Available Balance</p>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '800' }} className="primary-text-gradient">${availableBalance.toFixed(2)}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3fb950', fontSize: '0.9rem', fontWeight: '700' }}>
                  <TrendingUp size={16} /> +12.5% this week
              </div>
          </div>
          
          <button 
           className="btn-primary" 
           style={{ width: '100%', marginTop: '24px', padding: '16px' }}
           onClick={handleWithdraw}
           disabled={availableBalance <= 0}
          >
           <Wallet size={20} /> Withdraw to Bank
          </button>
       </div>

       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Breakdown</h3>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Total Earned: ${totalEarnings.toFixed(2)}</span>
       </div>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card earning-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                  <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Base Pay</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{stats.delivered} Deliveries completed</p>
              </div>
              <p style={{ fontWeight: '800', fontSize: '1.2rem' }}>${basePay.toFixed(2)}</p>
          </div>
          <div className="glass-card earning-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderLeftColor: '#58A6FF' }}>
              <div>
                  <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Tips</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Customer gratuity</p>
              </div>
              <p style={{ fontWeight: '800', fontSize: '1.2rem', color: '#58A6FF' }}>${tips.toFixed(2)}</p>
          </div>
          <div className="glass-card earning-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderLeftColor: '#3fb950' }}>
              <div>
                  <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>Bonuses</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Guidewire shift multiplier</p>
              </div>
              <p style={{ fontWeight: '800', fontSize: '1.2rem', color: '#3fb950' }}>${bonuses.toFixed(2)}</p>
          </div>
       </div>
    </div>
  );

  const renderRoute = () => {
    const currentLocation: [number, number] = [47.6000, -122.3200];
    const pendingDeliveries = deliveries.filter(d => d.status !== 'delivered' && d.coordinates);
    const routePositions = [currentLocation, ...pendingDeliveries.map(d => d.coordinates as [number, number])];

    return (
    <div className="animate-slide-up">
       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', color: 'var(--text-dim)' }}><ArrowLeft size={24} /></button>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Active Route</h1>
       </div>

       <div className="map-container" style={{ width: '100%', height: '300px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--glass-border)', zIndex: 0 }}>
         <MapContainer center={currentLocation} zoom={13} style={{ width: '100%', height: '100%', zIndex: 1 }}>
           <TileLayer
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
           />
           <Marker position={currentLocation}>
               <Popup>
                   <div style={{ color: '#000' }}>
                       <strong>Your Location</strong>
                   </div>
               </Popup>
           </Marker>
           {deliveries.filter(d => d.coordinates).map(d => (
             <Marker key={d.id} position={d.coordinates as [number, number]} opacity={d.status === 'delivered' ? 0.5 : 1}>
               <Popup>
                 <div style={{ color: '#000' }}>
                   <strong>{d.customer}</strong><br/>
                   {d.address}<br/>
                   Status: {d.status.toUpperCase()}
                 </div>
               </Popup>
             </Marker>
           ))}
           <Polyline positions={routePositions} color="var(--primary)" weight={4} dashArray="10, 10" />
         </MapContainer>
       </div>

       <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Navigation size={20} color="var(--primary)" /> Route Directions
          </h3>
          
          <div className="route-steps">
               {deliveries.map((d, idx) => {
                 const isNext = d.status !== 'delivered' && idx === deliveries.findIndex(x => x.status !== 'delivered');
                 return (
                   <div key={d.id} className="route-step" style={{ opacity: d.status === 'delivered' ? 0.4 : 1 }}>
                       <p style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '4px', textDecoration: d.status === 'delivered' ? 'line-through' : 'none' }}>{d.address}</p>
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{d.status === 'delivered' ? 'Completed' : `Customer: ${d.customer}`}</p>
                       {isNext && (
                         <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', marginTop: '8px', display: 'block', animation: 'pulse 2s infinite' }}>NEXT STOP</span>
                       )}
                   </div>
                 );
               })}
          </div>
       </div>

       <button className="btn-primary" style={{ width: '100%', marginTop: '24px', padding: '18px' }} onClick={() => showToast('Starting navigation on active route...', 'info')}>
           <Navigation size={20} /> Start Navigation
       </button>
    </div>
    );
  };

  const renderKyc = () => (
    <div className="animate-slide-up">
       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button onClick={() => setCurrentView('earnings')} style={{ background: 'none', color: 'var(--text-dim)' }}><ArrowLeft size={24} /></button>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Identity & Payments</h1>
       </div>

       <div className="glass-card" style={{ padding: '32px', textAlign: 'center', marginBottom: '32px', border: '1px solid var(--primary-glow)' }}>
           <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(0, 177, 160, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
               <ShieldCheck size={40} />
           </div>
           <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>KYC Verification</h2>
           <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.5' }}>
               Federal regulations require us to verify your identity before enabling direct deposits to your bank account.
           </p>
       </div>

       <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="glass-card" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <User size={18} /> Personal Information
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <input required type="text" placeholder="Legal Full Name" className="kyc-input" />
                   <input required type="date" placeholder="Date of Birth" className="kyc-input" />
                   <input required type="text" placeholder="Social Security Number (SSN)" className="kyc-input" />
               </div>
           </div>

           <div className="glass-card" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <CreditCard size={18} /> Bank Details
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <input required type="text" placeholder="Routing Number (9 digits)" className="kyc-input" />
                   <input required type="text" placeholder="Account Number" className="kyc-input" />
               </div>
           </div>

           <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '2px dashed var(--glass-border)' }}>
               <UploadCloud size={32} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
               <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>Upload Government ID</h3>
               <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '16px' }}>Front & Back of Driver's License or Passport</p>
               <button type="button" style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>Choose File</button>
           </div>

           <button 
               type="submit" 
               className="btn-primary" 
               style={{ padding: '18px', fontSize: '1.1rem', marginTop: '12px' }}
               disabled={kycLoading}
           >
               {kycLoading ? (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="spinner"></div> Verifying...</span>
               ) : (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20}/> Complete Registration</span>
               )}
           </button>
       </form>
    </div>
  );

  const renderAuth = () => (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
       <div style={{ padding: '32px', textAlign: 'center', marginBottom: '32px', width: '100%', maxWidth: '400px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'var(--primary)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px var(--primary-glow)',
            margin: '0 auto 24px'
          }}>
            <Package size={36} color="#000" strokeWidth={3} />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '8px' }}>
            Guidewire <span className="primary-text-gradient">Partner</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>
              {authMode === 'login' ? 'Sign in to start your delivery shift' : 'Join our delivery network today'}
          </p>
       </div>

       <div className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '400px' }}>
         <form onSubmit={(e) => {
             e.preventDefault();
             if (authMode === 'signup') {
                 showToast('Account created successfully! Please log in.', 'success');
                 setHasSignedUp(true);
                 setAuthMode('login');
             } else {
                 if (!hasSignedUp) {
                     showToast('No account found. Please sign up first.', 'error');
                     return;
                 }
                 showToast('Login successful!', 'success');
                 setIsAuthenticated(true);
                 setCurrentView('dashboard');
             }
         }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             
             {authMode === 'signup' && (
                 <div style={{ position: 'relative' }}>
                    <User size={20} color="var(--text-dim)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                    <input required type="text" placeholder="Full Name" className="kyc-input" style={{ paddingLeft: '48px' }} />
                 </div>
             )}

             <div style={{ position: 'relative' }}>
                <Mail size={20} color="var(--text-dim)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                <input required type="email" placeholder="Email Address" className="kyc-input" style={{ paddingLeft: '48px' }} />
             </div>

             <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--text-dim)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                <input required type="password" placeholder="Password" className="kyc-input" style={{ paddingLeft: '48px' }} />
             </div>

             <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', marginTop: '8px' }}>
                 {authMode === 'login' ? 'Sign In' : 'Create Account'}
             </button>
         </form>

         <div style={{ marginTop: '24px', textAlign: 'center' }}>
             <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                 {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                 <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ background: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', border: 'none', cursor: 'pointer' }}>
                     {authMode === 'login' ? 'Sign Up' : 'Log In'}
                 </button>
             </p>
         </div>
       </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate-slide-up">
       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <button onClick={() => setCurrentView('dashboard')} style={{ background: 'none', color: 'var(--text-dim)' }}><ArrowLeft size={24} /></button>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Partner Profile</h1>
       </div>

       <div className="glass-card" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100px', background: 'linear-gradient(to right, rgba(0, 177, 160, 0.2), rgba(88, 166, 255, 0.2))' }}></div>
           <div style={{ position: 'relative', zIndex: 1 }}>
               <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary-glow)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #0A0F19' }}>
                   <User size={48} color="var(--primary)" />
               </div>
               <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>Alex Rivera</h2>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '16px' }}>
                   <Award size={16} color="var(--primary)" /> Top Rated Partner
               </div>
               <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                   <div style={{ textAlign: 'center' }}>
                       <p style={{ fontWeight: '800', fontSize: '1.2rem', color: '#fff' }}>142</p>
                       <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Deliveries</p>
                   </div>
                   <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                   <div style={{ textAlign: 'center' }}>
                       <p style={{ fontWeight: '800', fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={16} color="#FF9900" fill="#FF9900" /> 4.9</p>
                       <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Rating</p>
                   </div>
                   <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                   <div style={{ textAlign: 'center' }}>
                       <p style={{ fontWeight: '800', fontSize: '1.2rem', color: '#3fb950' }}>{stats.performance}%</p>
                       <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Performance</p>
                   </div>
               </div>
           </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
           <div className="glass-card" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <User size={18} /> Contact Information
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>Phone</span>
                       <span style={{ color: '#fff', fontWeight: '600' }}>+1 (555) 987-6543</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>Email</span>
                       <span style={{ color: '#fff', fontWeight: '600' }}>arivera.deliveries@example.com</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>Member Since</span>
                       <span style={{ color: '#fff', fontWeight: '600' }}>Oct 2024</span>
                   </div>
               </div>
           </div>

           <div className="glass-card" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Car size={18} /> Vehicle Details
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>Vehicle Type</span>
                       <span style={{ color: '#fff', fontWeight: '600' }}>Cargo Van</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>Make/Model</span>
                       <span style={{ color: '#fff', fontWeight: '600' }}>Ford Transit Connect</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>License Plate</span>
                       <span style={{ color: '#fff', fontWeight: '600' }}>ABC-1234</span>
                   </div>
               </div>
           </div>
           
           <div className="glass-card" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Shield size={18} /> Account Status
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>KYC Verification</span>
                       <span style={{ color: isKycVerified ? '#3fb950' : '#FF9900', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           {isKycVerified ? <><CheckCircle2 size={14} /> Verified</> : 'Pending'}
                       </span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>Background Check</span>
                       <span style={{ color: '#3fb950', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Cleared</span>
                   </div>
                   {!isKycVerified && (
                       <button className="btn-primary" style={{ marginTop: '8px', padding: '12px', fontSize: '0.9rem' }} onClick={() => setCurrentView('kyc')}>
                           Complete KYC Verification
                       </button>
                   )}
               </div>
           </div>
       </div>

       <button className="glass-card" style={{ width: '100%', marginTop: '24px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', color: 'var(--text-main)' }}>
           <Settings size={18} /> Manage App Settings
       </button>
    </div>
  );

  return (
    <div className="app-container">
      {/* Loading Splash Screen */}
      {showSplash && (
        <div className="splash-screen">
            <div className="splash-logo-container" style={{ 
                position: 'relative',
                width: '80px', 
                height: '80px', 
                marginBottom: '24px'
            }}>
                <div className="splash-icon icon-1" style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--primary)', borderRadius: '20px', display: 'grid', placeItems: 'center' }}>
                    <Package size={40} color="#000" strokeWidth={2.5} />
                </div>
                <div className="splash-icon icon-2" style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--primary)', borderRadius: '20px', display: 'grid', placeItems: 'center' }}>
                    <Truck size={42} color="#000" strokeWidth={2.5} className="driving-truck" />
                </div>
                <div className="splash-icon icon-3" style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--primary)', borderRadius: '20px', display: 'grid', placeItems: 'center' }}>
                    <Home size={40} color="#000" strokeWidth={2.5} />
                </div>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Guidewire <span className="primary-text-gradient">Partner</span>
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Initializing System...
            </p>
        </div>
      )}

      {/* Navbar */}
      {isAuthenticated && (
      <nav style={{ 
        padding: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            backgroundColor: 'var(--primary)', 
            borderRadius: '12px', 
            display: 'grid', 
            placeItems: 'center',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
            <Package size={24} color="#000" strokeWidth={3} />
          </div>
          <div onClick={() => setCurrentView('dashboard')} style={{ cursor: 'pointer' }}>
            <h2 style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
              Guidewire <span className="primary-text-gradient">Partner</span>
            </h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '-2px' }}>EXPRESS DELIVERY</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', position: 'relative' }}>
            <button className="glass-card" style={{ width: '42px', height: '42px', display: 'grid', placeItems: 'center' }} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <User size={18} />
            </button>
            {showProfileMenu && (
                <div className="glass-card animate-slide-up" style={{
                    position: 'absolute',
                    top: '50px',
                    right: '0',
                    width: '150px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 1000
                }}>
                    <button 
                        onClick={() => {
                            setIsAuthenticated(false);
                            setCurrentView('auth');
                            setShowProfileMenu(false);
                            showToast('Logged out successfully', 'info');
                        }}
                        style={{ 
                            background: 'rgba(255, 69, 58, 0.1)', 
                            color: '#FF453A', 
                            border: 'none', 
                            padding: '12px 16px', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            textAlign: 'left'
                        }}
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                </div>
            )}
        </div>
      </nav>
      )}

      {/* Main Content */}
      <main style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', width: '100%', paddingBottom: '120px' }}>
        {currentView === 'auth' && renderAuth()}
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'packages' && renderPackages()}
        {currentView === 'earnings' && renderEarnings()}
        {currentView === 'route' && renderRoute()}
        {currentView === 'kyc' && renderKyc()}
        {currentView === 'profile' && renderProfile()}
      </main>

      {/* Package Detail Modal */}
      {selectedPackage && (
          <div className="modal-overlay" onClick={() => setSelectedPackage(null)}>
              <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary-glow)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                                <Package size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Package Detail</h2>
                        </div>
                        <button onClick={() => setSelectedPackage(null)} style={{ background: 'none', color: 'var(--text-dim)', fontSize: '1.5rem', fontWeight: '300' }}>×</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <section>
                          <h4 style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px' }}>CUSTOMER & SHIPMENT</h4>
                          <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>{selectedPackage.customer}</p>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>ID: {selectedPackage.id}</p>
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {selectedPackage.address}</span>
                                {selectedPackage.customerPhone && <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}><Phone size={16} /> {selectedPackage.customerPhone}</span>}
                                {selectedPackage.customerEmail && <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}><Mail size={16} /> {selectedPackage.customerEmail}</span>}
                            </div>
                          </div>
                      </section>

                      {selectedPackage.deliveryInstructions && (
                          <section>
                              <div className="glass-card" style={{ padding: '16px', border: '1px dashed rgba(255, 153, 0, 0.3)', backgroundColor: 'rgba(255, 153, 0, 0.05)' }}>
                                  <h5 style={{ color: '#FF9900', fontSize: '0.8rem', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14} /> DELIVERY INSTRUCTIONS</h5>
                                  <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>{selectedPackage.deliveryInstructions}</p>
                              </div>
                          </section>
                      )}

                      <section>
                          <h4 style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Info size={14} /> PACKAGE DETAILS
                          </h4>
                          {(selectedPackage.weight || selectedPackage.dimensions) && (
                              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                  {selectedPackage.weight && (
                                      <div className="glass-card" style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Scale size={14} /> WEIGHT</span>
                                          <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>{selectedPackage.weight}</span>
                                      </div>
                                  )}
                                  {selectedPackage.dimensions && (
                                      <div className="glass-card" style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Ruler size={14} /> DIMENSIONS</span>
                                          <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>{selectedPackage.dimensions}</span>
                                      </div>
                                  )}
                              </div>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {selectedPackage.contents?.map((item, idx) => (
                                  <span key={idx} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                      {item}
                                  </span>
                              ))}
                          </div>
                      </section>

                      <section>
                          <h4 style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <History size={14} /> TRACKING HISTORY
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {selectedPackage.history?.map((event, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '12px', borderLeft: '2px solid var(--primary)' }}>
                                      <span style={{ fontWeight: '600' }}>{event.event}</span>
                                      <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{event.time}</span>
                                  </div>
                              ))}
                          </div>
                      </section>
                  </div>

                  <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={() => { handleUpdateStatus(selectedPackage.id, 'delivered'); setSelectedPackage(null); }}>
                          Complete Delivery
                      </button>
                      <button className="glass-card" style={{ flex: 1, fontWeight: '700' }} onClick={() => {
                          showToast('Issue reported to support team', 'error');
                          setSelectedPackage(null);
                      }}>Report Issue</button>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Bottom Nav */}
      {isAuthenticated && (
      <div className="glass-card" style={{ 
          position: 'fixed', 
          bottom: '24px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: 'calc(100% - 48px)',
          maxWidth: '430px',
          padding: '10px 8px', 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          borderRadius: '35px', 
          zIndex: 100,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(25px)'
      }}>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={currentView === 'dashboard' ? 'nav-active' : ''}
            style={{ background: 'none', color: 'var(--text-dim)', transition: 'all 0.3s' }}
          >
              <div className="nav-icon-bg" style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'grid', placeItems: 'center' }}>
                <Home size={22} />
              </div>
          </button>
          <button 
            onClick={() => setCurrentView('packages')}
            className={currentView === 'packages' ? 'nav-active' : ''}
            style={{ background: 'none', color: 'var(--text-dim)', transition: 'all 0.3s' }}
          >
              <div className="nav-icon-bg" style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'grid', placeItems: 'center' }}>
                <Package size={22} />
              </div>
          </button>
          <button 
            onClick={() => setCurrentView('earnings')}
            className={currentView === 'earnings' ? 'nav-active' : ''}
            style={{ background: 'none', color: 'var(--text-dim)', transition: 'all 0.3s' }}
          >
              <div className="nav-icon-bg" style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'grid', placeItems: 'center' }}>
                <Wallet size={22} />
              </div>
          </button>
          <button 
            onClick={() => setCurrentView('route')}
            className={currentView === 'route' ? 'nav-active' : ''}
            style={{ background: 'none', color: 'var(--text-dim)', transition: 'all 0.3s' }}
          >
              <div className="nav-icon-bg" style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'grid', placeItems: 'center' }}>
                <MapIcon size={22} />
              </div>
          </button>
          <button 
            onClick={() => setCurrentView('profile')}
            className={currentView === 'profile' ? 'nav-active' : ''}
            style={{ background: 'none', color: 'var(--text-dim)', transition: 'all 0.3s' }}
          >
              <div className="nav-icon-bg" style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'grid', placeItems: 'center' }}>
                <User size={22} />
              </div>
          </button>
      </div>
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="var(--success)" />}
            {toast.type === 'error' && <AlertTriangle size={18} color="var(--error)" />}
            {toast.type === 'info' && <Info size={18} color="var(--accent)" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
