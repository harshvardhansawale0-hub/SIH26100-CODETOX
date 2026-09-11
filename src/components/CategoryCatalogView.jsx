import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Tag, 
  Layers, 
  Cpu, 
  Flame, 
  Heart, 
  Armchair, 
  Cross,
  PlusCircle,
  Truck,
  Building2,
  ExternalLink,
  Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Import image assets


export default function CategoryCatalogView({ 
  initialCategory = 'Oxygen Gas & Accessories', 
  currentUser,
  onNavigateToTenders,
  onOpenCreateBid,
  onNavigateHome
}) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Oxygen Gas & Accessories');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('ALL');
  const [cartCount, setCartCount] = useState(0);
  const [purchasedProducts, setPurchasedProducts] = useState({});

  useEffect(() => {
    if (initialCategory) {
      // Normalize category name if passed loosely
      const catMap = {
        'oxygen': 'Oxygen Gas & Accessories',
        'Oxygen Gas & Accessories': 'Oxygen Gas & Accessories',
        'Oxygen Gas & Medical Gases': 'Oxygen Gas & Accessories',
        'medical': 'Medical & Healthcare',
        'Medical & Healthcare': 'Medical & Healthcare',
        'Medical Equipment': 'Medical & Healthcare',
        'Medical & Healthcare Equipment': 'Medical & Healthcare',
        'saras': 'SARAS Handicrafts & Women Artisans',
        'SARAS Handicrafts': 'SARAS Handicrafts & Women Artisans',
        'SARAS Handicrafts & Women Artisans': 'SARAS Handicrafts & Women Artisans',
        'furniture': 'Furniture & Fixtures',
        'Furniture & Fixtures': 'Furniture & Fixtures',
        'Office & Institutional Furniture': 'Furniture & Fixtures',
        'fire': 'Fire Safety & Security',
        'Fire Safety & Security': 'Fire Safety & Security',
        'computers': 'Computers & IT Hardware',
        'Computers & IT Hardware': 'Computers & IT Hardware',
        'Cloud & Hosting Services': 'Public Procurement Services',
        'Services': 'Public Procurement Services'
      };
      setSelectedCategory(catMap[initialCategory] || initialCategory);
    }
  }, [initialCategory]);

  const categoryConfigs = [
    {
      name: 'Oxygen Gas & Accessories',
      icon: '🫁',
      tagline: 'Medical grade oxygen, high-pressure cylinders, cryogenic tanks and PSA generation systems'
    },
    {
      name: 'Medical & Healthcare',
      icon: '🩺',
      tagline: 'ICU monitors, diagnostic ECG machines, motorized beds and ventilators for healthcare centers'
    },
    {
      name: 'SARAS Handicrafts & Women Artisans',
      icon: '🌸',
      tagline: 'Exclusive artisan creations, handloom weaves, and craft products from rural Women SHGs'
    },
    {
      name: 'Furniture & Fixtures',
      icon: '🪑',
      tagline: 'Heavy-gauge steel almirahs, ergonomic chairs, executive desks and institutional fixtures'
    },
    {
      name: 'Fire Safety & Security',
      icon: '🧯',
      tagline: 'ABC powder fire extinguishers, optical smoke sensors, motorized pumps and suppression systems'
    },
    {
      name: 'Computers & IT Hardware',
      icon: '💻',
      tagline: 'Commercial desktops, military-grade laptops, enterprise rack servers and network printers'
    },
    {
      name: 'Public Procurement Services',
      icon: '☁️',
      tagline: 'Tier-IV MeitY empanelled cloud hosting, fleet hiring, facilities management and security services'
    }
  ];

  const productsDatabase = [
    // 1. Oxygen Gas & Accessories
    {
      id: 'PROD-OXY-01',
      category: 'Oxygen Gas & Accessories',
      title: 'B-Type High Pressure Medical Oxygen Cylinder (10 Liters)',
      brand: 'Bharat Oxygen & Alloy Vessels Ltd.',
      specs: '10 Liters Water Capacity, 150 Bar Working Pressure, Seamless Manganese Steel (IS:7285), Hydrotested.',
      l1Price: 6450,
      mrp: 8200,
      miiLocalContent: '85%',
      isMii: true,
      deliveryDays: '3 Days',
      stockStatus: 'In Stock (450 Units)',
      rating: 4.8,
      minOrderQty: 5
    },
    {
      id: 'PROD-OXY-02',
      category: 'Oxygen Gas & Accessories',
      title: 'D-Type Jumbo Medical Oxygen Cylinder (46.7 Liters / 7 cum)',
      brand: 'Kaveri Gas & Cryogenic Systems',
      specs: '46.7 Liters, Pin Index Bullnose Brass Valve, 150 Bar Working Pressure, Explosive Dept PESO Certified.',
      l1Price: 14200,
      mrp: 17500,
      miiLocalContent: '92%',
      isMii: true,
      deliveryDays: '4 Days',
      stockStatus: 'In Stock (180 Units)',
      rating: 4.9,
      minOrderQty: 2
    },
    {
      id: 'PROD-OXY-03',
      category: 'Oxygen Gas & Accessories',
      title: 'PSA Medical Oxygen Generation Plant (500 LPM Flow Rate)',
      brand: 'Inox Air Products & Engineering',
      specs: '93% ± 3% Purity, Dual Zeolite Molecular Sieve Towers, Rotary Screw Air Compressor, PLC Touchscreen.',
      l1Price: 4200000,
      mrp: 4800000,
      miiLocalContent: '75%',
      isMii: true,
      deliveryDays: '21 Days',
      stockStatus: 'Factory Built on Indent',
      rating: 5.0,
      minOrderQty: 1
    },
    {
      id: 'PROD-OXY-04',
      category: 'Oxygen Gas & Accessories',
      title: 'Medical Gas Pressure Regulator with Flowmeter & Humidifier Bottle',
      brand: 'MediFlow Instruments',
      specs: 'Chrome-Plated Brass Body, 0-15 L/min Flow Tube, Unbreakable Polycarbonate Humidifier Jar.',
      l1Price: 3150,
      mrp: 4200,
      miiLocalContent: '80%',
      isMii: true,
      deliveryDays: '2 Days',
      stockStatus: 'In Stock (1200 Units)',
      rating: 4.7,
      minOrderQty: 10
    },

    // 2. Medical & Healthcare
    {
      id: 'PROD-MED-01',
      category: 'Medical & Healthcare',
      title: '12.1-Inch Multipara Patient Monitor (5-Para ICU Grade)',
      brand: 'Apex BioMedical Devices Ltd.',
      specs: 'ECG, SpO2, NIBP, Respiration, Dual Temperature, 72-Hour Graphical Trends, Arrhythmia Detection.',
      l1Price: 48500,
      mrp: 62000,
      miiLocalContent: '68%',
      isMii: true,
      deliveryDays: '5 Days',
      stockStatus: 'In Stock (90 Units)',
      rating: 4.9,
      minOrderQty: 1
    },
    {
      id: 'PROD-MED-02',
      category: 'Medical & Healthcare',
      title: '12-Channel Electrocardiograph (ECG) with Interpretation',
      brand: 'BPL Medical Technologies',
      specs: '7-Inch Color Screen, Automatic Glasgow Analysis Algorithm, USB & LAN Data Export, Internal Memory.',
      l1Price: 38000,
      mrp: 46000,
      miiLocalContent: '72%',
      isMii: true,
      deliveryDays: '3 Days',
      stockStatus: 'In Stock (140 Units)',
      rating: 4.8,
      minOrderQty: 1
    },
    {
      id: 'PROD-MED-03',
      category: 'Medical & Healthcare',
      title: 'Motorized Five-Function ICU Hospital Bed with CPR Release',
      brand: 'Godrej Interio Healthcare',
      specs: 'Linak Actuators, Backrest, Knee rest, Trendelenburg & Reverse Trendelenburg, Central Braking System.',
      l1Price: 72000,
      mrp: 95000,
      miiLocalContent: '88%',
      isMii: true,
      deliveryDays: '7 Days',
      stockStatus: 'In Stock (65 Units)',
      rating: 4.9,
      minOrderQty: 2
    },
    {
      id: 'PROD-MED-04',
      category: 'Medical & Healthcare',
      title: 'High-Flow Invasive & Non-Invasive ICU Ventilator',
      brand: 'AgVa Healthcare / Make in India',
      specs: 'Adult & Pediatric, Inbuilt Turbine, Volume & Pressure Controlled Modes, 15-inch Touch Display.',
      l1Price: 485000,
      mrp: 650000,
      miiLocalContent: '90%',
      isMii: true,
      deliveryDays: '10 Days',
      stockStatus: 'In Stock (25 Units)',
      rating: 5.0,
      minOrderQty: 1
    },

    // 3. SARAS Handicrafts & Women Artisans
    {
      id: 'PROD-SARAS-01',
      category: 'SARAS Handicrafts & Women Artisans',
      title: 'Handcrafted Pure Silk Pochampally Ikat Saree (Silk Mark Certified)',
      brand: 'Telangana Women Weavers Co-op (NRLM SHG)',
      specs: '100% Pure Mulberry Silk, Traditional Geometric Tie-and-Dye Weave, Natural Eco-Friendly Dyes.',
      l1Price: 4200,
      mrp: 6500,
      miiLocalContent: '100%',
      isMii: true,
      isWomaniya: true,
      deliveryDays: '4 Days',
      stockStatus: 'In Stock (85 Pieces)',
      rating: 5.0,
      minOrderQty: 1
    },
    {
      id: 'PROD-SARAS-02',
      category: 'SARAS Handicrafts & Women Artisans',
      title: 'Dokra Lost-Wax Tribal Bell-Metal Craft Sculpture (Bastar Heritage)',
      brand: 'Chhattisgarh Tribal Artisan SHG Federation',
      specs: 'Non-Ferrous Casting using Beeswax & Clay Technique, Certified Indigenous Tribal Handicraft.',
      l1Price: 3450,
      mrp: 4800,
      miiLocalContent: '100%',
      isMii: true,
      isWomaniya: true,
      deliveryDays: '5 Days',
      stockStatus: 'In Stock (40 Pieces)',
      rating: 4.9,
      minOrderQty: 2
    },
    {
      id: 'PROD-SARAS-03',
      category: 'SARAS Handicrafts & Women Artisans',
      title: 'Natural Terracotta Water Pitchers & Clay Tableware Set (6 Pcs)',
      brand: 'Mitti Shilp Gramin Mahila Sangh',
      specs: 'Natural Red Clay, Porous Cooling Effect, Lead-Free, Hand-Turned on Potter Wheel.',
      l1Price: 1150,
      mrp: 1800,
      miiLocalContent: '100%',
      isMii: true,
      isWomaniya: true,
      deliveryDays: '3 Days',
      stockStatus: 'In Stock (200 Sets)',
      rating: 4.8,
      minOrderQty: 5
    },

    // 4. Furniture & Fixtures
    {
      id: 'PROD-FURN-01',
      category: 'Furniture & Fixtures',
      title: 'Heavy-Gauge Steel Almirah with Locker (IS:3312 Heavy Grade)',
      brand: 'Godrej & Boyce Mfg Ltd.',
      specs: 'CRCA Sheet 0.8mm Thickness, 3-Way Locking System, Anti-Corrosive Epoxy Powder Coated.',
      l1Price: 16800,
      mrp: 22000,
      miiLocalContent: '95%',
      isMii: true,
      deliveryDays: '5 Days',
      stockStatus: 'In Stock (220 Units)',
      rating: 4.8,
      minOrderQty: 1
    },
    {
      id: 'PROD-FURN-02',
      category: 'Furniture & Fixtures',
      title: 'Ergonomic Mesh High-Back Executive Office Chair with Lumbar Support',
      brand: 'Wipro Furniture Solutions',
      specs: 'BIFMA Certified Class-4 Gas Lift, Breathable Nylon Mesh, Adjustable 3D Armrests, Synchro-Tilt.',
      l1Price: 7450,
      mrp: 10500,
      miiLocalContent: '78%',
      isMii: true,
      deliveryDays: '3 Days',
      stockStatus: 'In Stock (540 Units)',
      rating: 4.9,
      minOrderQty: 2
    },
    {
      id: 'PROD-FURN-03',
      category: 'Furniture & Fixtures',
      title: 'Modular 4-Person Linear Workstation with Acoustic Fabric Screens',
      brand: 'Featherlite Furniture Ltd.',
      specs: 'Pre-Laminated Particle Board (IS:12823), Triangular Powder Coated Steel Understructure.',
      l1Price: 32000,
      mrp: 44000,
      miiLocalContent: '82%',
      isMii: true,
      deliveryDays: '8 Days',
      stockStatus: 'In Stock (60 Clusters)',
      rating: 4.7,
      minOrderQty: 1
    },

    // 5. Fire Safety & Security
    {
      id: 'PROD-FIRE-01',
      category: 'Fire Safety & Security',
      title: 'ABC Dry Chemical Powder Fire Extinguisher (6 Kg Capacity, IS:15683)',
      brand: 'Ceasefire Industries Ltd.',
      specs: 'Stored Pressure Type, MAP 90% Powder, CE & BIS Certified, Discharge Range 4 Meters.',
      l1Price: 2150,
      mrp: 3100,
      miiLocalContent: '92%',
      isMii: true,
      deliveryDays: '2 Days',
      stockStatus: 'In Stock (1500 Units)',
      rating: 4.9,
      minOrderQty: 4
    },
    {
      id: 'PROD-FIRE-02',
      category: 'Fire Safety & Security',
      title: 'Microprocessor-Based Addressable Optical Smoke Detector',
      brand: 'Honeywell Fire Solutions',
      specs: 'UL Listed, Dual LED Indicators, Drift Compensation Algorithm, 360° Smoke Entry.',
      l1Price: 1450,
      mrp: 2200,
      miiLocalContent: '65%',
      isMii: true,
      deliveryDays: '3 Days',
      stockStatus: 'In Stock (800 Units)',
      rating: 4.8,
      minOrderQty: 10
    },
    {
      id: 'PROD-FIRE-03',
      category: 'Fire Safety & Security',
      title: 'Motorized High-Pressure Diesel Fire Hydrant Pump (2280 LPM / 7 Bar)',
      brand: 'Kirloskar Brothers Ltd.',
      specs: 'Single Stage End Suction, Radiator Cooled Diesel Engine, Automatic Engine Controller Panel.',
      l1Price: 340000,
      mrp: 420000,
      miiLocalContent: '95%',
      isMii: true,
      deliveryDays: '14 Days',
      stockStatus: 'Factory Built on Indent',
      rating: 5.0,
      minOrderQty: 1
    },

    // 6. Computers & IT Hardware
    {
      id: 'PROD-COMP-01',
      category: 'Computers & IT Hardware',
      title: 'Commercial Desktop PC Intel Core i7 14th Gen (16GB RAM, 1TB SSD)',
      brand: 'HP India / Make in India Facility',
      specs: 'Intel Core i7-14700, 16GB DDR5, 1TB NVMe PCIe 4.0, 23.8-inch FHD IPS Monitor, Windows 11 Pro.',
      l1Price: 58400,
      mrp: 74000,
      miiLocalContent: '58%',
      isMii: true,
      deliveryDays: '4 Days',
      stockStatus: 'In Stock (350 Units)',
      rating: 4.9,
      minOrderQty: 1
    },
    {
      id: 'PROD-COMP-02',
      category: 'Computers & IT Hardware',
      title: 'Military-Grade Rugged Laptop MIL-STD-810H & IP65',
      brand: 'Dell Technologies India',
      specs: 'Intel Core i7 vPro, 32GB RAM, 1TB Encrypted SSD, 14-inch 1000 nits Sunlight Readable Touchscreen.',
      l1Price: 145000,
      mrp: 185000,
      miiLocalContent: '52%',
      isMii: true,
      deliveryDays: '7 Days',
      stockStatus: 'In Stock (45 Units)',
      rating: 5.0,
      minOrderQty: 1
    },
    {
      id: 'PROD-COMP-03',
      category: 'Computers & IT Hardware',
      title: 'Enterprise 2U Rackmount Dual-Socket Intel Xeon Scalable Server',
      brand: 'Netweb Technologies / Supermicro India',
      specs: 'Dual Xeon Silver 4410Y (24 Cores total), 64GB ECC DDR5, 4x 1.92TB Enterprise SAS SSD, Dual 10GbE.',
      l1Price: 365000,
      mrp: 450000,
      miiLocalContent: '64%',
      isMii: true,
      deliveryDays: '10 Days',
      stockStatus: 'In Stock (20 Units)',
      rating: 4.9,
      minOrderQty: 1
    },

    // 7. Services
    {
      id: 'PROD-SERV-01',
      category: 'Public Procurement Services',
      title: 'MeitY Empanelled Cloud VPS Hosting (8 vCPU, 32GB RAM, Tier-IV)',
      brand: 'Sify Technologies / RailTel Cloud',
      specs: 'ISO 27001 Certified, MeitY Empanelled, 99.98% SLA, Dedicated Public IP, 24x7 NOC Support.',
      l1Price: 4200,
      mrp: 6000,
      miiLocalContent: '100%',
      isMii: true,
      deliveryDays: 'Instant Provisioning (24h)',
      stockStatus: 'Virtual Elastic Capacity',
      rating: 4.9,
      minOrderQty: 1
    }
  ];

  const filteredProducts = productsDatabase.filter(p => {
    // 1. Category Match
    if (p.category !== selectedCategory) return false;

    // 2. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) || 
                    p.brand.toLowerCase().includes(q) || 
                    p.specs.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 3. Price Filter
    if (priceFilter === 'under10k' && p.l1Price >= 10000) return false;
    if (priceFilter === '10kto1L' && (p.l1Price < 10000 || p.l1Price > 100000)) return false;
    if (priceFilter === 'above1L' && p.l1Price <= 100000) return false;

    return true;
  });

  const handleBuyNow = (product) => {
    setCartCount(prev => prev + 1);
    setPurchasedProducts(prev => ({
      ...prev,
      [product.id]: true
    }));
    alert(`Direct Purchase Order Generated under GFR 149 for "${product.title}" at L1 rate of ₹${product.l1Price.toLocaleString()}. Procurement indent logged into your Buyer dashboard.`);
  };

  return (
    <div style={{ backgroundColor: '#071526', minHeight: '85vh', padding: '2rem 1.5rem', color: '#ffffff' }}>
      <div className="container-custom">
        {/* Top Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="section-tag" style={{ margin: 0 }}>PRODUCT & SERVICE CATALOG (GFR 149)</span>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '700' }}>
                Direct Purchase L1 Rate Benchmarking Active
              </span>
            </div>
            <h1 className="serif-heading" style={{ fontSize: '2.4rem', margin: '0.2rem 0', color: '#ffffff' }}>
              GeM Official Product & Service Marketplace
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '850px', margin: 0 }}>
              Browse verified OEM products, compare technical specifications, and generate direct purchase orders or tender indents across all statutory public procurement categories.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {onNavigateHome && (
              <button 
                onClick={onNavigateHome}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  border: '1px solid #1e385b',
                  borderRadius: '8px',
                  padding: '0.65rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Return to GeM Homepage"
              >
                <Home size={15} color="#38bdf8" />
                <span>🏠 Homepage</span>
              </button>
            )}
            <div style={{ backgroundColor: '#0b1a2d', border: '1px solid #1e385b', padding: '0.65rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Direct Indents: <strong>{cartCount} Generated</strong></span>
            </div>
          </div>
        </div>

        {/* 7 Interactive Category Selector Pills with Icons */}
        <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
          {categoryConfigs.map(cat => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  backgroundColor: isActive ? '#0f2238' : '#0b1a2d',
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  border: `1.5px solid ${isActive ? '#38bdf8' : '#1e385b'}`,
                  borderRadius: '10px',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(56, 189, 248, 0.25)' : 'none'
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Category Description Banner */}
        {(() => {
          const currentCfg = categoryConfigs.find(c => c.name === selectedCategory) || categoryConfigs[0];
          return (
            <div style={{ backgroundColor: '#0b1a2d', border: '1px solid #1e385b', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{currentCfg.icon}</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: '0 0 2px 0', fontWeight: '800' }}>
                    {currentCfg.name}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {currentCfg.tagline}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => onOpenCreateBid && onOpenCreateBid()}
                  style={{
                    backgroundColor: '#1e385b',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <PlusCircle size={14} />
                  <span>Raise Custom Bid for this Category</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Price Range Pills */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Price Bands' },
              { id: 'under10k', label: 'Under ₹10,000 (Micro Purchase)' },
              { id: '10kto1L', label: '₹10,000 - ₹1,00,000' },
              { id: 'above1L', label: 'High-Value (> ₹1,00,000)' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriceFilter(p.id)}
                style={{
                  backgroundColor: priceFilter === p.id ? '#1e385b' : 'transparent',
                  color: priceFilter === p.id ? '#38bdf8' : '#94a3b8',
                  border: `1px solid ${priceFilter === p.id ? '#38bdf8' : '#1e385b'}`,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: priceFilter === p.id ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search product model, specs, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#081729',
                border: '1px solid #1e385b',
                color: '#fff',
                padding: '0.5rem 1rem 0.5rem 2.2rem',
                borderRadius: '6px',
                width: '280px',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#0b1a2d', borderRadius: '12px', border: '1px solid #1e385b' }}>
            <ShoppingBag size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5, color: '#38bdf8' }} />
            <h4 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No products match your selected criteria</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Try clearing the search query or changing the price band filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {filteredProducts.map(product => {
              const isPurchased = purchasedProducts[product.id];
              return (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: '#0b1a2d',
                    border: '1px solid #1e385b',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="mono-text" style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700' }}>
                        {product.id}
                      </span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {product.isMii && (
                          <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            MII {product.miiLocalContent}
                          </span>
                        )}
                        {product.isWomaniya && (
                          <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                            🌸 Womaniya
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0 0 0.35rem 0', fontWeight: '700', lineHeight: 1.3 }}>
                      {product.title}
                    </h4>

                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
                      OEM Brand: {product.brand}
                    </span>

                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem', backgroundColor: '#071526', padding: '0.65rem', borderRadius: '6px', border: '1px solid #1e385b' }}>
                      {product.specs}
                    </p>
                  </div>

                  <div>
                    {/* Price and Stock Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', borderTop: '1px solid #1e385b', paddingTop: '0.85rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>GeM L1 Benchmark Rate</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#10b981' }}>
                          ₹{product.l1Price.toLocaleString()}
                        </div>
                        {product.mrp && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'line-through' }}>
                            MRP: ₹{product.mrp.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'block' }}>{product.stockStatus}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Delivery: {product.deliveryDays}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => onNavigateToTenders && onNavigateToTenders()}
                        style={{
                          backgroundColor: '#1e385b',
                          color: '#38bdf8',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.55rem',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        View Related Bids
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBuyNow(product)}
                        style={{
                          backgroundColor: isPurchased ? '#10b98125' : '#10b981',
                          color: isPurchased ? '#10b981' : '#071526',
                          border: isPurchased ? '1px solid #10b981' : 'none',
                          borderRadius: '6px',
                          padding: '0.55rem',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        {isPurchased ? <CheckCircle2 size={14} /> : <ShoppingBag size={14} />}
                        <span>{isPurchased ? 'Indent Created' : 'Direct Purchase'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
