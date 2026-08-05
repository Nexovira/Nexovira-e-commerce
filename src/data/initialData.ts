import { ProductCategory, Product, StoreSettings, ShippingZone } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Nexovira Appliance Store',
  tagline: 'Smart Appliances. Smarter Living.',
  instagramUrl: 'https://www.instagram.com/nexov_ira/',
  xUrl: 'https://x.com/Nexovira',
  whatsappNumbers: ['08129595134', '07025900156'],
  supportEmail: 'support@nexovira.com',
  address: 'Nexovira Experience Hub, Lekki Expressway Phase 1, Lagos, Nigeria',
  referralBonusPercent: 5,
  lowStockThreshold: 5,
  freeShippingMinAmount: 350000,
};

export const INITIAL_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'zone-lagos-island',
    name: 'Lagos Island (Lekki, Ikoyi, Victoria Island)',
    price: 3500,
    estimatedDays: '1 - 2 Days',
    statesCovered: ['Lagos Island'],
  },
  {
    id: 'zone-lagos-mainland',
    name: 'Lagos Mainland (Ikeja, Yaba, Surulere, Maryland)',
    price: 4500,
    estimatedDays: '1 - 2 Days',
    statesCovered: ['Lagos Mainland'],
  },
  {
    id: 'zone-abuja-fct',
    name: 'Abuja (FCT)',
    price: 8500,
    estimatedDays: '2 - 3 Days',
    statesCovered: ['Abuja / FCT'],
  },
  {
    id: 'zone-port-harcourt',
    name: 'Rivers State (Port Harcourt)',
    price: 9500,
    estimatedDays: '2 - 4 Days',
    statesCovered: ['Rivers State'],
  },
  {
    id: 'zone-nationwide-express',
    name: 'Rest of Nigeria (Interstate Express)',
    price: 12500,
    estimatedDays: '3 - 5 Days',
    statesCovered: ['Oyo', 'Ogun', 'Edo', 'Kano', 'Enugu', 'Anambra', 'Delta', 'Others'],
  },
];

export const INITIAL_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-refrigerators',
    name: 'Refrigerators & Freezers',
    slug: 'refrigerators',
    description: 'Energy-efficient Inverter French-door, side-by-side, and chest freezers for long-lasting freshness.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    productCount: 8,
  },
  {
    id: 'cat-washing-machines',
    name: 'Washing Machines & Dryers',
    slug: 'washing-machines',
    description: 'Smart front-load and top-load automatic washing machines with steam hygiene and AI load sensing.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    productCount: 6,
  },
  {
    id: 'cat-air-conditioners',
    name: 'Air Conditioners & Cooling',
    slug: 'air-conditioners',
    description: 'Dual inverter split ACs, standing tower units, and air purifiers for whisper-quiet cooling.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    productCount: 6,
  },
  {
    id: 'cat-cooking',
    name: 'Cooking Appliances & Ovens',
    slug: 'cooking-appliances',
    description: 'Gas cookers, built-in electric ovens, induction hobs, and microwave grill combinations.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    productCount: 7,
  },
  {
    id: 'cat-small-kitchen',
    name: 'Kitchen Small Appliances',
    slug: 'kitchen-small-appliances',
    description: 'High-speed blenders, digital air fryers, multi-cookers, espresso machines, and juicers.',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
    productCount: 9,
  },
  {
    id: 'cat-tv-home',
    name: 'Televisions & Home Entertainment',
    slug: 'televisions-entertainment',
    description: '4K Ultra HD QLED Smart TVs, Dolby Atmos soundbars, and immersive home theater systems.',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    productCount: 5,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'NEXO-FR-520L',
    name: 'Nexovira Smart Inverter French Door Refrigerator 520L',
    slug: 'nexovira-smart-inverter-french-door-refrigerator-520l',
    brand: 'Nexovira Pro',
    categoryId: 'cat-refrigerators',
    categoryName: 'Refrigerators & Freezers',
    price: 850000,
    originalPrice: 980000,
    discountPercent: 13,
    description: 'Keep your groceries farm-fresh with the Nexovira 520L French Door Refrigerator. Featuring Dual Inverter Compressor technology, Multi-Airflow cooling, smart WiFi temperature controls, and a ice & water dispenser.',
    features: [
      'Dual Inverter Compressor with 10-Year Warranty',
      'No-Frost Smart Air Circulation System',
      'Door-in-Door Access for Energy Efficiency',
      'External Touch Display & Ambient LED Lighting',
      'Inbuilt Water & Ice Dispenser (Plumbed)'
    ],
    specs: {
      'Capacity': '520 Liters',
      'Energy Rating': 'A+++',
      'Dimensions': '833mm x 1775mm x 740mm',
      'Color': 'Platinum Brushed Stainless Steel',
      'Noise Level': '38dB',
      'Warranty': '2 Years General, 10 Years Compressor'
    },
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 12,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 38,
    variations: [
      { id: 'var-color', name: 'Finish', options: ['Platinum Stainless', 'Matte Black', 'Silver Gloss'] },
      { id: 'var-capacity', name: 'Capacity', options: ['520L', '650L Premium'] }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    sku: 'NEXO-WM-10KG',
    name: 'Nexovira AI Direct Drive Front Load Washer 10kg + Steam Hygiene',
    slug: 'nexovira-ai-direct-drive-front-load-washer-10kg',
    brand: 'Nexovira Care',
    categoryId: 'cat-washing-machines',
    categoryName: 'Washing Machines & Dryers',
    price: 460000,
    originalPrice: 520000,
    discountPercent: 11,
    description: 'Experience intelligent fabric care with AI Direct Drive load sensing. Detects weight and fabric softness to optimize wash motion. Includes Steam Hygiene mode that removes 99.9% of allergens.',
    features: [
      'AI DD™ Intelligent Fabric Protection',
      'Steam Spa Allergen Reduction Mode',
      '1400 RPM High Efficiency Spin Speed',
      'TurboWash™ 39-Minute Quick Cycle',
      'Ultra Quiet Inverter Direct Drive Motor'
    ],
    specs: {
      'Wash Capacity': '10 kg',
      'Spin Speed': '1400 RPM',
      'Programs': '16 Washing Programs',
      'Energy Efficiency': 'A+++ -30%',
      'Color': 'Titanium Dark Gray',
      'Warranty': '2 Years'
    },
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 8,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 44,
    variations: [
      { id: 'var-cap', name: 'Capacity', options: ['10kg Washing', '12kg Wash / 8kg Dry Combo'] }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    sku: 'NEXO-AC-1.5HP',
    name: 'Nexovira Dual Inverter Split Air Conditioner 1.5 HP (Gen Mode + Gold Fin)',
    slug: 'nexovira-dual-inverter-split-ac-1-5hp',
    brand: 'Nexovira Cool',
    categoryId: 'cat-air-conditioners',
    categoryName: 'Air Conditioners & Cooling',
    price: 385000,
    originalPrice: 430000,
    discountPercent: 10,
    description: 'Ultra-fast cooling with low power consumption. Features Generator Mode (works on low capacity generators), 100% Copper Condenser with Anti-Corrosion Gold Fin, and Health Ionizer Filter.',
    features: [
      'Dual Inverter Compressor for 70% Energy Savings',
      'Gen Mode Power Control (Step 1, Step 2, Step 3)',
      'Gold Fin™ Anti-Corrosion Heat Exchanger',
      'Plasmaster™ Ionizer Air Purifier Filter',
      'Super Silent 19dB Night Mode'
    ],
    specs: {
      'Horse Power': '1.5 HP',
      'Cooling Capacity': '12,000 BTU/h',
      'Refrigerant': 'R32 Eco Gas',
      'Tubing': '100% Pure Copper Kit Included',
      'Warranty': '2 Years Unit / 10 Years Compressor'
    },
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 15,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.95,
    reviewCount: 62,
    variations: [
      { id: 'var-hp', name: 'Power Rating', options: ['1.0 HP', '1.5 HP', '2.0 HP', '3.0 HP Standing'] }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    sku: 'NEXO-CK-5B',
    name: 'Nexovira Stainless Steel 5-Burner Gas Cooker + Rotisserie Electric Oven 90x60',
    slug: 'nexovira-5-burner-gas-cooker-oven-90x60',
    brand: 'Nexovira Chef',
    categoryId: 'cat-cooking',
    categoryName: 'Cooking Appliances & Ovens',
    price: 340000,
    originalPrice: 390000,
    discountPercent: 12,
    description: 'Elevate your culinary passion with this Italian-designed 90x60cm freestanding cooker. Features 5 high-output Eurogas burners (including Triple Ring Wok Burner), cast iron pan supports, double glass oven door, and motorised rotisserie.',
    features: [
      '5 High Efficiency Italian Sabaf Burners',
      'Center Triple-Crown Wok Burner (3.8 kW)',
      'Multi-Function Electric Convection Oven with Grill',
      'Automatic One-Hand Electronic Ignition & Flame Failure Safety',
      'Heavy Duty Cast Iron Pan Supports & Glass Top Cover'
    ],
    specs: {
      'Dimension': '90cm x 60cm x 85cm',
      'Oven Volume': '110 Liters',
      'Gas Type': 'LPG / NG Dual Convertible',
      'Color': 'Inox Stainless Steel',
      'Warranty': '2 Years'
    },
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 7,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    rating: 4.7,
    reviewCount: 29,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    sku: 'NEXO-AF-8.5L',
    name: 'Nexovira Digital Dual Basket Air Fryer XL 8.5L (1800W + Sync Cooking)',
    slug: 'nexovira-digital-dual-basket-air-fryer-8-5l',
    brand: 'Nexovira Kitchen',
    categoryId: 'cat-small-kitchen',
    categoryName: 'Kitchen Small Appliances',
    price: 115000,
    originalPrice: 135000,
    discountPercent: 14,
    description: 'Cook two dishes simultaneously with independent zone temperatures! The Nexovira 8.5L Dual Zone Air Fryer cuts oil usage by up to 85% while delivering crispy, golden deliciousness in minutes.',
    features: [
      'Dual Independent Cooking Baskets (4.25L + 4.25L)',
      'Smart Finish Technology (Syncs cooking end times)',
      '8 One-Touch Digital Presets (Fries, Roast, Grill, Dehydrate, Bake)',
      '360° Rapid Air Circulation System',
      'Non-Stick Dishwasher-Safe Crisper Plates'
    ],
    specs: {
      'Power': '1800 Watts',
      'Total Capacity': '8.5 Liters',
      'Temperature Range': '50°C to 200°C',
      'Display': 'Angled Touchscreen LED',
      'Warranty': '1 Year Full Replacement'
    },
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 24,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 89,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    sku: 'NEXO-TV-65QLED',
    name: 'Nexovira 65" 4K Smart QLED TV + Google TV & Dolby Vision Atmos',
    slug: 'nexovira-65-4k-smart-qled-tv',
    brand: 'Nexovira Vision',
    categoryId: 'cat-tv-home',
    categoryName: 'Televisions & Home Entertainment',
    price: 680000,
    originalPrice: 780000,
    discountPercent: 12,
    description: 'Immerse yourself in over 1 billion vibrant colors with Quantum Dot Technology. Features 120Hz Refresh Rate, HDMI 2.1 Game Master mode, Google TV with hands-free voice control, and built-in ONKYO Dolby Atmos sound.',
    features: [
      'Quantum Dot 4K UHD Display with HDR10+ & Dolby Vision',
      '120Hz Game Accelerator for Ultra-Smooth Gaming',
      'Google TV OS with Netflix, Prime Video, YouTube Pre-installed',
      'Hands-Free Far-Field Voice Assistant',
      'Frameless Metallic Edge Design'
    ],
    specs: {
      'Screen Size': '65 Inches',
      'Resolution': '3840 x 2160 Pixels (4K)',
      'Connectivity': '3x HDMI 2.1, 2x USB, Wi-Fi 5, Bluetooth 5.2',
      'Audio Output': '40W Dolby Atmos Speakers',
      'Warranty': '2 Years'
    },
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 6,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.85,
    reviewCount: 51,
    variations: [
      { id: 'var-tv-size', name: 'Screen Size', options: ['55 Inch QLED', '65 Inch QLED', '75 Inch QLED Flagship'] }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-007',
    sku: 'NEXO-BL-1500W',
    name: 'Nexovira High-Speed Professional Smoothie Blender 1500W + Nutribowl',
    slug: 'nexovira-high-speed-blender-1500w',
    brand: 'Nexovira Kitchen',
    categoryId: 'cat-small-kitchen',
    categoryName: 'Kitchen Small Appliances',
    price: 68000,
    originalPrice: 82000,
    discountPercent: 17,
    description: 'Crush ice in seconds and blend tough smooth smoothies, nut butters, and hot soups. Powered by a 1500W copper motor with 6 Japanese stainless steel blades and BPA-free Tritan jar.',
    features: [
      '1500W Pure Copper Turbo Motor (28,000 RPM)',
      '6 3D Laser-Cut Japanese Stainless Steel Blades',
      '2.0L Unbreakable BPA-Free Tritan Pitcher + 600ml Go-Cup',
      'Variable Speed Dial + Pulse Pulse Function',
      'Overheat Protection & Safety Interlock Switch'
    ],
    specs: {
      'Power': '1500 Watts',
      'Jar Capacity': '2.0 Liters',
      'Material': 'BPA Free Tritan & Stainless Steel Body',
      'Warranty': '1 Year'
    },
    images: [
      'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 30,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    rating: 4.8,
    reviewCount: 112,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-008',
    sku: 'NEXO-MW-30L',
    name: 'Nexovira Digital Microwave Oven with Convection & Grill 30L',
    slug: 'nexovira-digital-microwave-convection-grill-30l',
    brand: 'Nexovira Chef',
    categoryId: 'cat-cooking',
    categoryName: 'Cooking Appliances & Ovens',
    price: 128000,
    originalPrice: 145000,
    discountPercent: 11,
    description: '3-in-1 versatility: Microwave, Grill, and Hot Air Convection. Bake cakes, roast chicken, or thaw frozen foods evenly with Auto Defrost menus and Stainless Steel cavity.',
    features: [
      '3-in-1 Combination: Microwave 900W / Grill 1100W / Convection 1400W',
      '10 Auto Cooking Menus with LED Digital Display',
      'Stainless Steel Easy-Clean Interior Cavity',
      'Weight & Time Defrost Options',
      'Child Safety Lock'
    ],
    specs: {
      'Capacity': '30 Liters',
      'Turntable Diameter': '315 mm',
      'Color': 'Black Mirror & Rose Gold Trim',
      'Warranty': '1 Year'
    },
    images: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 18,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    rating: 4.65,
    reviewCount: 33,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-009',
    sku: 'NEXO-CF-400L',
    name: 'Nexovira Deep Chest Freezer 400L - 100 Hours Freeze Retention',
    slug: 'nexovira-deep-chest-freezer-400l',
    brand: 'Nexovira Pro',
    categoryId: 'cat-refrigerators',
    categoryName: 'Refrigerators & Freezers',
    price: 360000,
    originalPrice: 410000,
    discountPercent: 12,
    description: 'Built for extreme climate conditions and power outages. Retains freezing temperature for up to 100 hours after power loss. Comes with aluminum liner, key lock, and heavy duty casters.',
    features: [
      '100 Hours Cool Wall Thermal Retention',
      'Fast Freezing Function for Bulk Food Storage',
      'Tropicalized Compressor for High Ambient Temps',
      'Removable Storage Baskets & Security Lock with Keys',
      'LED Interior Light'
    ],
    specs: {
      'Capacity': '400 Liters',
      'Cooling Type': 'Direct Cooling',
      'Color': 'Arctic White',
      'Warranty': '2 Years'
    },
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 9,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.88,
    reviewCount: 27,
    createdAt: new Date().toISOString(),
  },
];
