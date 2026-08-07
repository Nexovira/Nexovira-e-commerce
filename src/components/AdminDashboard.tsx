import React, { useState } from 'react';
import { NexoviraLogo } from './NexoviraLogo';
import {
  Product,
  ProductCategory,
  Order,
  WithdrawalRequest,
  StoreSettings,
  ShippingZone,
  PaymentRecord,
} from '../types';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Send,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Truck,
  Eye,
  Search,
  X,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Clock,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Database,
  Lock,
} from 'lucide-react';
import { storageApi } from '../lib/storage';
import { realtimeSync } from '../lib/supabaseClient';

interface AdminDashboardProps {
  products: Product[];
  categories: ProductCategory[];
  orders: Order[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'paystack' | 'products' | 'categories' | 'shipping' | 'orders' | 'withdrawals' | 'settings'>('analytics');

  // Product Form Modal & Catalog State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Deletion Modal & Toast Feedback State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [pSku, setPSku] = useState('');
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('Nexovira Pro');
  const [pCategory, setPCategory] = useState(categories[0]?.id || 'cat-refrigerators');
  const [pPrice, setPPrice] = useState(150000);
  const [pOriginalPrice, setPOriginalPrice] = useState(180000);
  const [pStock, setPStock] = useState(10);
  const [pDesc, setPDesc] = useState('');
  const [pImgUrl, setPImgUrl] = useState('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80');

  // Category Form State
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80');

  // Shipping Zone Form State
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(storageApi.getShippingZones());
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [zonePrice, setZonePrice] = useState(3500);
  const [zoneEstDays, setZoneEstDays] = useState('1 - 2 Days');
  const [zoneStates, setZoneStates] = useState('Lagos Island');

  // Order Details Modal State & Filters
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | Order['status']>('all');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Business Settings State
  const [settings, setSettings] = useState<StoreSettings>(storageApi.getSettings());

  const withdrawals = storageApi.getWithdrawals();
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.totalAmount : sum), 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesCat = productCategoryFilter === 'all' || p.categoryId === productCategoryFilter;
    const q = productSearchQuery.toLowerCase().trim();
    const matchesQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q));
    return matchesCat && matchesQ;
  });

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cat = categories.find((c) => c.id === pCategory);

      const productData: Product = {
        id: editingProduct ? editingProduct.id : 'prod-' + Date.now(),
        sku: pSku || 'NEXO-' + Math.floor(1000 + Math.random() * 9000),
        name: pName,
        slug: pName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: pBrand || 'Nexovira Pro',
        categoryId: pCategory,
        categoryName: cat?.name || 'General Appliances',
        price: Number(pPrice),
        originalPrice: Number(pOriginalPrice) || Number(pPrice),
        discountPercent: pOriginalPrice > pPrice ? Math.round(((pOriginalPrice - pPrice) / pOriginalPrice) * 100) : 0,
        description: pDesc || 'High quality Nexovira appliance.',
        features: ['Inverter Motor Technology', 'Low Wattage Generator Mode', '2-Year Official Warranty'],
        specs: { 'Brand': pBrand, 'Warranty': '2 Years' },
        images: [pImgUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80'],
        stock: Number(pStock),
        rating: editingProduct ? editingProduct.rating : 5.0,
        reviewCount: editingProduct ? editingProduct.reviewCount : 1,
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      };

      if (editingProduct) {
        storageApi.updateProduct(productData);
        await fetch(`/api/products/${productData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        }).catch((err) => console.warn('[Backend Put Warning]:', err));

        realtimeSync.notifyChange('prices', { productId: productData.id, newPrice: productData.price, name: productData.name });
        setToastNotification({
          message: `Appliance "${productData.name}" updated successfully.`,
          type: 'success',
        });
      } else {
        storageApi.addProduct(productData);
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        }).catch((err) => console.warn('[Backend Post Warning]:', err));

        realtimeSync.notifyChange('products', { productId: productData.id, name: productData.name });
        setToastNotification({
          message: `New appliance "${productData.name}" added to catalog.`,
          type: 'success',
        });
      }

      setIsAddingProduct(false);
      setEditingProduct(null);
      onRefreshData();
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err: any) {
      console.error('[Save Product Error]:', err);
      setToastNotification({
        message: `Failed to save product: ${err?.message || 'Check form fields'}`,
        type: 'error',
      });
      setTimeout(() => setToastNotification(null), 5000);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const targetId = productToDelete.id;
    const targetName = productToDelete.name;
    setIsDeletingProduct(true);

    try {
      // 1. Call Backend Delete Endpoint for server audit log
      await fetch(`/api/products/${targetId}`, {
        method: 'DELETE',
      }).catch((err) => {
        console.warn('[Backend Product Delete Warning]:', err);
      });

      // 2. Local Storage & Cart/Wishlist Cleanup
      storageApi.deleteProduct(targetId);

      // 3. Reset form if currently editing this product
      if (editingProduct?.id === targetId) {
        setEditingProduct(null);
        setIsAddingProduct(false);
      }

      // 4. Broadcast Realtime Sync
      realtimeSync.notifyChange('products', { productId: targetId, action: 'delete' });

      // 5. Update parent state immediately
      onRefreshData();

      // 6. Close Modal & Show Success Toast
      setProductToDelete(null);
      setToastNotification({
        message: `Appliance "${targetName}" was permanently removed from store catalog.`,
        type: 'success',
      });
      setTimeout(() => setToastNotification(null), 4000);
    } catch (err: any) {
      console.error('[Delete Product Error]:', err);
      setToastNotification({
        message: `Failed to delete product: ${err?.message || 'Unknown error'}`,
        type: 'error',
      });
      setTimeout(() => setToastNotification(null), 5000);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    if (editingCategory) {
      storageApi.updateCategory({
        ...editingCategory,
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: catDesc,
        image: catImg,
      });
      setEditingCategory(null);
    } else {
      storageApi.addCategory({
        id: 'cat-' + Date.now(),
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: catDesc,
        image: catImg,
        productCount: 0,
      });
    }

    setCatName('');
    setCatDesc('');
    onRefreshData();
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      storageApi.deleteCategory(catId);
      onRefreshData();
    }
  };

  const handleSaveShippingZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName) return;

    const zoneData: ShippingZone = {
      id: editingZone ? editingZone.id : 'zone-' + Date.now(),
      name: zoneName,
      price: zonePrice,
      estimatedDays: zoneEstDays,
      statesCovered: zoneStates.split(',').map((s) => s.trim()),
    };

    if (editingZone) {
      const updated = storageApi.updateShippingZone(zoneData);
      setShippingZones(updated);
    } else {
      const updated = storageApi.addShippingZone(zoneData);
      setShippingZones(updated);
    }

    setIsAddingZone(false);
    setEditingZone(null);
    setZoneName('');
    setZonePrice(3500);
    setZoneEstDays('1 - 2 Days');
    setZoneStates('');
  };

  const handleDeleteShippingZone = (id: string) => {
    if (confirm('Are you sure you want to delete this shipping zone?')) {
      const updated = storageApi.deleteShippingZone(id);
      setShippingZones(updated);
    }
  };

  const handleApproveWithdrawal = (id: string) => {
    storageApi.updateWithdrawalStatus(id, 'approved', 'Approved by Admin');
    onRefreshData();
  };

  const handleRejectWithdrawal = (id: string) => {
    storageApi.updateWithdrawalStatus(id, 'rejected', 'Rejected by Admin');
    onRefreshData();
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    storageApi.updateOrderStatus(orderId, status);
    realtimeSync.notifyChange('orders', { orderId, status });
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
    onRefreshData();
  };

  const handleUpdateTrackingNumber = (orderId: string) => {
    if (!trackingNumberInput) return;
    const allOrders = storageApi.getOrders();
    const updated = allOrders.map((o) => (o.id === orderId ? { ...o, trackingNumber: trackingNumberInput } : o));
    storageApi.saveOrders(updated);
    realtimeSync.notifyChange('orders', { orderId, trackingNumber: trackingNumberInput });
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, trackingNumber: trackingNumberInput });
    }
    alert('Tracking number updated!');
    onRefreshData();
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      storageApi.deleteOrder(orderId);
      realtimeSync.notifyChange('orders', { orderId, action: 'delete' });
      setSelectedOrder(null);
      onRefreshData();
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageApi.saveSettings(settings);
    realtimeSync.notifyChange('settings', settings);
    alert('Nexovira Store Settings saved successfully.');
  };

  // Filtered Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.customerName.toLowerCase().includes(q) ||
      ord.customerPhone.includes(q) ||
      ord.customerEmail.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="py-10 bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Admin Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <NexoviraLogo size="sm" lightMode={true} showText={false} />
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 font-display leading-tight">
                Nexovira Store Admin
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Full-stack store management, inventory & orders
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold flex items-center gap-2 transition-all self-stretch md:self-auto justify-center"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>Sync Live Data</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2 text-xs font-semibold no-scrollbar">
          {[
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'paystack', label: 'Paystack Gateway', icon: ShieldCheck },
            { id: 'products', label: `Products (${products.length})`, icon: Package },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'shipping', label: `Shipping (${shippingZones.length})`, icon: Truck },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})`, icon: Send },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px] rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
              <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl shadow-xs">
                <DollarSign className="w-5 h-5 text-emerald-600 mb-1" />
                <h3 className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider">Revenue</h3>
                <p className="text-base sm:text-2xl font-black text-slate-900 mt-0.5">₦{totalRevenue.toLocaleString()}</p>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl shadow-xs">
                <ShoppingBag className="w-5 h-5 text-blue-600 mb-1" />
                <h3 className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider">Orders</h3>
                <p className="text-base sm:text-2xl font-black text-slate-900 mt-0.5">{orders.length}</p>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-500 mb-1" />
                <h3 className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider">Low Stock</h3>
                <p className="text-base sm:text-2xl font-black text-amber-600 mt-0.5">{lowStockCount} Items</p>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 sm:p-5 rounded-2xl shadow-xs">
                <Send className="w-5 h-5 text-rose-600 mb-1" />
                <h3 className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-wider">Withdrawals</h3>
                <p className="text-base sm:text-2xl font-black text-rose-600 mt-0.5">{pendingWithdrawals.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Paystack Gateway & Audit Tab */}
        {activeTab === 'paystack' && (() => {
          const paymentRecords = storageApi.getPaymentRecords();
          const webhookLogs = storageApi.getWebhookLogs();
          const auditLogs = storageApi.getAuditLogs();

          const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'paid').length;
          const pendingOrdersCount = orders.filter((o) => o.paymentStatus === 'pending').length;
          const failedOrdersCount = orders.filter((o) => o.paymentStatus === 'failed').length;

          const exportToCSV = (data: any[], filename: string) => {
            if (!data.length) return alert('No data available to export.');
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map((obj) =>
              Object.values(obj)
                .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
                .join(',')
            );
            const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };

          return (
            <div className="space-y-8 text-xs">
              {/* Paystack Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <DollarSign className="w-6 h-6 text-emerald-600 mb-2" />
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Paystack Revenue</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">₦{totalRevenue.toLocaleString()}</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <CheckCircle className="w-6 h-6 text-blue-600 mb-2" />
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paid Orders</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">{paidOrdersCount}</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <Clock className="w-6 h-6 text-amber-500 mb-2" />
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Payments</h3>
                  <p className="text-2xl font-black text-amber-600 mt-1">{pendingOrdersCount}</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <XCircle className="w-6 h-6 text-rose-600 mb-2" />
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed / Rejected</h3>
                  <p className="text-2xl font-black text-rose-600 mt-1">{failedOrdersCount}</p>
                </div>
              </div>

              {/* Transaction Ledger & Export Controls */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Paystack Verified Transaction History
                    </h3>
                    <p className="text-slate-500 text-[11px]">Real-time ledger of verified Paystack authorizations, gateway responses, and customer references</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        exportToCSV(
                          paymentRecords.map((r) => ({
                            Reference: r.reference,
                            OrderNumber: r.orderNumber,
                            CustomerEmail: r.customerEmail,
                            AmountPaid: r.amountPaid,
                            Currency: r.currency,
                            Method: r.paymentMethod,
                            Channel: r.channel,
                            AuthCode: r.authorizationCode,
                            GatewayResponse: r.gatewayResponse,
                            Status: r.status,
                            PaymentDate: r.paymentDate,
                          })),
                          'Paystack_Transaction_Ledger'
                        )
                      }
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Export CSV
                    </button>

                    <button
                      onClick={() =>
                        exportToCSV(
                          orders.map((o) => ({
                            OrderNumber: o.orderNumber,
                            CustomerName: o.customerName,
                            CustomerEmail: o.customerEmail,
                            TotalAmount: o.totalAmount,
                            PaymentStatus: o.paymentStatus,
                            PaymentMethod: o.paymentMethod,
                            PaymentReference: o.paymentReference || 'N/A',
                            Status: o.status,
                            CreatedAt: o.createdAt,
                          })),
                          'Nexovira_Orders_Report'
                        )
                      }
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <FileText className="w-4 h-4" /> Export Excel
                    </button>
                  </div>
                </div>

                {/* Ledger Table */}
                {paymentRecords.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 space-y-2">
                    <Database className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-medium">No verified Paystack payments in ledger yet.</p>
                    <p className="text-[11px] text-slate-400">Complete an order via Paystack checkout or deposit to populate live transaction audit.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="p-3">Reference / Order #</th>
                          <th className="p-3">Customer Email</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Channel / Method</th>
                          <th className="p-3">Auth Code / Gateway Response</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        {paymentRecords.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono">
                              <span className="font-bold text-slate-900 block">{p.reference}</span>
                              <span className="text-[10px] text-slate-500">Order: #{p.orderNumber}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-800 block">{p.customerName || 'Customer'}</span>
                              <span className="text-slate-500">{p.customerEmail}</span>
                            </td>
                            <td className="p-3 font-black text-slate-900">
                              ₦{p.amountPaid.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">{p.currency}</span>
                            </td>
                            <td className="p-3">
                              <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                                {p.channel || p.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-mono text-[10px] text-slate-700 block">{p.authorizationCode || 'AUTH_LIVE'}</span>
                              <span className="text-[10px] text-emerald-600 font-medium">{p.gatewayResponse || 'Approved'}</span>
                            </td>
                            <td className="p-3 text-slate-500 font-medium">
                              {new Date(p.paymentDate).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded uppercase text-[9px]">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Webhook Events & HMAC Audit Section */}
              <div className="space-y-6">
                {/* Multi-Vendor Paystack Accounts & Real-Time Sync Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        Multi-Vendor Paystack Connect Accounts
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Active Paystack OAuth connections, merchant subaccount codes, and settlement statuses across vendors
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        realtimeSync.notifyChange('paystack', { action: 'admin_sync' });
                        alert('⚡ Real-time Paystack & Store Sync Broadcasted to all connected clients!');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Broadcast Real-Time Sync</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="p-3">Vendor / Merchant</th>
                          <th className="p-3">Paystack Email</th>
                          <th className="p-3">Subaccount Code</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Connected Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        {Object.entries(storageApi.getPaystackConnections()).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-500">
                              No vendor Paystack connections registered yet. Launch Paystack Connect Wizard in Customer Dashboard to connect.
                            </td>
                          </tr>
                        ) : (
                          Object.entries(storageApi.getPaystackConnections()).map(([userId, conn]: [string, any]) => (
                            <tr key={userId} className="hover:bg-slate-50 transition">
                              <td className="p-3 font-bold text-slate-900">{conn.businessName || 'Nexovira Merchant'}</td>
                              <td className="p-3 text-slate-600">{conn.email || 'N/A'}</td>
                              <td className="p-3 font-mono text-emerald-600 font-bold">{conn.subaccountCode || 'ACCT_LIVE'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  conn.status === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {conn.status || 'connected'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500">{conn.connectedAt ? new Date(conn.connectedAt).toLocaleDateString() : 'Active'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Webhook Logs */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    Paystack Webhook Event Logs (HMAC SHA512)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Incoming <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-600">POST /api/paystack/webhook</code> callbacks verified with signature header.
                  </p>

                  {webhookLogs.length === 0 ? (
                    <p className="text-slate-400 py-4 font-medium text-[11px]">No webhook events received yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {webhookLogs.map((wh) => (
                        <div key={wh.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-700">{wh.event}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                wh.signatureVerified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {wh.signatureVerified ? 'HMAC Verified' : 'Invalid Signature'}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-slate-600">Ref: {wh.reference}</p>
                          <p className="text-[9px] text-slate-400">{new Date(wh.receivedAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit Logs */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    Security & Audit Trails
                  </h4>
                  <p className="text-[11px] text-slate-500">Immutable server logs tracking payment initialization, amount checks, and stock deductions.</p>

                  {auditLogs.length === 0 ? (
                    <p className="text-slate-400 py-4 font-medium text-[11px]">No audit log entries recorded yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {auditLogs.map((al) => (
                        <div key={al.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-700">{al.action}</span>
                            <span className="text-[9px] text-slate-400">{new Date(al.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-800">{al.details}</p>
                          <p className="text-[9px] text-slate-500">Actor: {al.actor}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

        {/* Products Management Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 font-display">Manage Product Catalog</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setPSku('');
                  setPName('');
                  setPPrice(150000);
                  setIsAddingProduct(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Appliance
              </button>
            </div>

            {/* Product Modal Form */}
            {isAddingProduct && (
              <form onSubmit={handleSaveProduct} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-blue-600">
                  {editingProduct ? 'Edit Appliance Product' : 'Add New Appliance Product'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">SKU</label>
                    <input
                      type="text"
                      value={pSku}
                      onChange={(e) => setPSku(e.target.value)}
                      placeholder="e.g. NEXO-AC-1.5HP"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Product Title</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Nexovira Inverter Split AC 1.5 HP"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Sale Price (NGN)</label>
                    <input
                      type="number"
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Original Price (NGN)</label>
                    <input
                      type="number"
                      value={pOriginalPrice}
                      onChange={(e) => setPOriginalPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Stock Level</label>
                    <input
                      type="number"
                      required
                      value={pStock}
                      onChange={(e) => setPStock(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 font-medium">Product Image</label>
                    <span className="text-[10px] text-slate-500">Upload file or enter URL</span>
                  </div>

                  <div className="space-y-2">
                    {/* Image File Upload Box */}
                    <div className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-xl p-3 bg-slate-50 transition-colors text-center relative group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setPImgUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center gap-1 py-1">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                        <span className="text-xs font-semibold text-slate-700">
                          Click or drag image file here to upload
                        </span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WEBP or SVG up to 5MB</span>
                      </div>
                    </div>

                    {/* Image Preview & URL Direct Input Fallback */}
                    <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xl">
                      {pImgUrl ? (
                        <img
                          src={pImgUrl}
                          alt="Product Preview"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Or Direct Image URL
                        </label>
                        <input
                          type="url"
                          required
                          value={pImgUrl}
                          onChange={(e) => setPImgUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-xs focus:bg-white focus:border-cyan-500 focus:outline-none truncate"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Description</label>
                  <textarea
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow-sm">
                    Save Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Products Search & Category Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Search appliance by title, SKU, or brand..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
                {productSearchQuery && (
                  <button
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-slate-500 text-[11px] font-medium shrink-0">Category:</label>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3">Appliance</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 space-y-2">
                          <Package className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-semibold text-slate-700">No appliance products found.</p>
                          <p className="text-[11px]">
                            {productSearchQuery || productCategoryFilter !== 'all'
                              ? 'Try adjusting your search query or category filter.'
                              : 'Add your first appliance product to start selling.'}
                          </p>
                          {(productSearchQuery || productCategoryFilter !== 'all') && (
                            <button
                              onClick={() => {
                                setProductSearchQuery('');
                                setProductCategoryFilter('all');
                              }}
                              className="mt-2 text-xs text-blue-600 font-bold hover:underline"
                            >
                              Clear Search Filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate max-w-xs">{p.name}</span>
                              <span className="text-[10px] text-cyan-600 font-medium">{p.brand}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{p.sku}</td>
                          <td className="p-3 text-slate-700 font-medium">{p.categoryName}</td>
                          <td className="p-3 font-bold text-slate-900">₦{p.price.toLocaleString()}</td>
                          <td className="p-3">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                p.stock <= 5 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setPSku(p.sku);
                                setPName(p.name);
                                setPBrand(p.brand);
                                setPCategory(p.categoryId);
                                setPPrice(p.price);
                                setPOriginalPrice(p.originalPrice || p.price);
                                setPStock(p.stock);
                                setPDesc(p.description);
                                setPImgUrl(p.images[0]);
                                setIsAddingProduct(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition mr-1"
                              title="Edit Appliance Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setProductToDelete(p)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Appliance Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
            <form onSubmit={handleSaveCategory} className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCatName('');
                      setCatDesc('');
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Smart Air Purifiers"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 font-medium">Category Image</label>
                  <span className="text-[10px] text-slate-500">Upload or URL</span>
                </div>

                <div className="space-y-2">
                  <div className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-xl p-3 bg-slate-50 transition-colors text-center relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setCatImg(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-1 py-1">
                      <Upload className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                      <span className="text-xs font-semibold text-slate-700">Upload image file</span>
                      <span className="text-[10px] text-slate-400">Drag file or click</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-xl">
                    {catImg ? (
                      <img
                        src={catImg}
                        alt="Category Preview"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                    <input
                      type="url"
                      required
                      value={catImg}
                      onChange={(e) => setCatImg(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-900 text-xs focus:bg-white focus:border-cyan-500 focus:outline-none truncate"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-sm">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </form>

            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Categories Overview</h3>
              <div className="space-y-3">
                {categories.map((c) => {
                  const catProductsCount = products.filter((p) => p.categoryId === c.id).length;
                  return (
                    <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={c.image} alt={c.name} referrerPolicy="no-referrer" className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded font-bold">
                              {catProductsCount} Products
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(c);
                            setCatName(c.name);
                            setCatDesc(c.description);
                            setCatImg(c.image);
                          }}
                          className="p-2 text-blue-600 hover:bg-white rounded-lg transition-all"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-2 text-rose-600 hover:bg-white rounded-lg transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Shipping Zones & Pricing Tab */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Manage Shipping Zones & Prices</h2>
                <p className="text-slate-500 text-[11px]">Set delivery pricing and estimated delivery timelines for regions across Nigeria</p>
              </div>
              <button
                onClick={() => {
                  setEditingZone(null);
                  setZoneName('');
                  setZonePrice(3500);
                  setZoneEstDays('1 - 2 Days');
                  setZoneStates('');
                  setIsAddingZone(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Shipping Zone
              </button>
            </div>

            {/* Shipping Zone Modal / Form */}
            {isAddingZone && (
              <form onSubmit={handleSaveShippingZone} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-blue-600">
                  {editingZone ? 'Edit Shipping Zone' : 'Add New Shipping Zone'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Zone Name</label>
                    <input
                      type="text"
                      required
                      value={zoneName}
                      onChange={(e) => setZoneName(e.target.value)}
                      placeholder="e.g. Lagos Island (Lekki, VI, Ikoyi)"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Delivery Price (NGN)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={zonePrice}
                      onChange={(e) => setZonePrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Estimated Delivery Time</label>
                    <input
                      type="text"
                      required
                      value={zoneEstDays}
                      onChange={(e) => setZoneEstDays(e.target.value)}
                      placeholder="e.g. 1 - 2 Days"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">States / Areas Covered (comma separated)</label>
                  <input
                    type="text"
                    value={zoneStates}
                    onChange={(e) => setZoneStates(e.target.value)}
                    placeholder="e.g. Lekki Phase 1, Ikoyi, Victoria Island, Ajah"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl shadow-sm">
                    Save Shipping Zone
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingZone(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Shipping Zones List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shippingZones.map((zone) => (
                  <div key={zone.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                        <h4 className="font-bold text-slate-900 text-sm">{zone.name}</h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingZone(zone);
                            setZoneName(zone.name);
                            setZonePrice(zone.price);
                            setZoneEstDays(zone.estimatedDays);
                            setZoneStates(zone.statesCovered.join(', '));
                            setIsAddingZone(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-white rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShippingZone(zone.id)}
                          className="p-1.5 text-rose-600 hover:bg-white rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                      <span className="text-slate-500 font-medium">Delivery Rate:</span>
                      <span className="font-black text-slate-900 text-sm">₦{zone.price.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Estimated Time:</span>
                      <span className="font-bold text-blue-600">{zone.estimatedDays}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60 mt-1">
                      <strong className="text-slate-700 block mb-0.5">Coverage:</strong>
                      {zone.statesCovered.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customer Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 text-xs shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Customer Orders Management</h2>
                <p className="text-slate-500 text-[11px]">Track customer purchases, update order status, manage tracking numbers, and view customer details</p>
              </div>

              {/* Order Search */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search order #, customer..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 font-semibold">
              {[
                { id: 'all', label: `All (${orders.length})` },
                { id: 'pending', label: 'Pending' },
                { id: 'processing', label: 'Processing' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all whitespace-nowrap ${
                    orderStatusFilter === f.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <p className="text-slate-500 py-8 text-center font-medium">No customer orders matching your criteria.</p>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">Order #{ord.orderNumber}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                            {ord.paymentStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Customer: <strong className="text-slate-800">{ord.customerName}</strong> ({ord.customerPhone}) • {new Date(ord.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-black text-sm">₦{ord.totalAmount.toLocaleString()}</span>

                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                          className="bg-white border border-slate-300 text-blue-600 font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-600"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setTrackingNumberInput(ord.trackingNumber || '');
                          }}
                          className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 border-t border-slate-200/80 pt-2">
                      <span className="font-medium text-slate-500">{ord.items.length} Item(s):</span>
                      <span className="truncate max-w-xl text-slate-800 font-medium">
                        {ord.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detailed Order View Modal / Drawer */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Order Details #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-slate-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Info Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Info</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                  <p className="text-slate-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.customerEmail}</p>
                  <p className="text-slate-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedOrder.customerPhone}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Shipping Destination</span>
                  <p className="text-slate-900 font-medium flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                  </p>
                  <p className="text-slate-500 font-medium mt-1">Payment Method: <span className="uppercase font-bold text-slate-800">{selectedOrder.paymentMethod}</span></p>
                  <p className="text-slate-500 font-mono text-[10px]">Ref: {selectedOrder.paymentReference}</p>
                </div>
              </div>

              {/* Order Status & Tracking Number Editor */}
              <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <label className="block text-blue-900 font-bold mb-1">Order Fulfillment Status</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as any)}
                      className="bg-white border border-blue-300 text-blue-900 font-bold rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="pending">Pending Processing</option>
                      <option value="processing">Processing & Packaging</option>
                      <option value="shipped">Shipped Out for Delivery</option>
                      <option value="delivered">Delivered to Customer</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-blue-900 font-bold mb-1">Total Order Amount</span>
                    <span className="text-xl font-black text-slate-900">₦{selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Tracking Number Input */}
                <div className="pt-2 border-t border-blue-200/80 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter Dispatch / Courier Tracking Number"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    className="flex-1 bg-white border border-blue-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button
                    onClick={() => handleUpdateTrackingNumber(selectedOrder.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm whitespace-nowrap"
                  >
                    Save Tracking Number
                  </button>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Ordered Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-white"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">SKU: {item.productId}</p>
                        </div>
                      </div>

                      <div className="text-right font-bold">
                        <p className="text-slate-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">Qty: {item.quantity} × ₦{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Order Record
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawals Approval Tab */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs shadow-sm">
            <h2 className="text-base font-bold text-slate-900 font-display mb-2">Customer Bank Withdrawal Requests</h2>
            {withdrawals.length === 0 ? (
              <p className="text-slate-500">No withdrawal requests.</p>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">{w.userName} ({w.userEmail})</p>
                    <p className="text-slate-500">{w.bankName} - {w.accountNumber} ({w.accountName})</p>
                    <p className="text-blue-600 font-bold text-sm mt-1">₦{w.amount.toLocaleString()}</p>
                  </div>

                  {w.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveWithdrawal(w.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(w.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold uppercase text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded">
                      {w.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Store Business Settings Tab */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs max-w-xl shadow-sm">
            <h2 className="text-base font-bold text-slate-900 font-display mb-2">Nexovira Store Business Settings</h2>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Instagram URL</label>
              <input
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">X (Twitter) URL</label>
              <input
                type="url"
                value={settings.xUrl}
                onChange={(e) => setSettings({ ...settings, xUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm">
              Save Store Settings
            </button>
          </form>
        )}

        {/* Delete Appliance Product Confirmation Modal */}
        {productToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base font-display">Confirm Permanent Deletion</h3>
                  <p className="text-[11px] text-slate-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <img
                  src={productToDelete.images[0]}
                  alt={productToDelete.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <h4 className="font-bold text-slate-900 truncate">{productToDelete.name}</h4>
                  <p className="text-slate-500 font-mono text-[11px]">SKU: {productToDelete.sku}</p>
                  <p className="text-slate-700 font-bold mt-0.5">
                    ₦{productToDelete.price.toLocaleString()} • {productToDelete.stock} in stock
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900">{productToDelete.name}</strong>? It will be removed immediately from the live storefront catalog, search results, customer carts, and database records.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeletingProduct}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteProduct}
                  disabled={isDeletingProduct}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  {isDeletingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Floating Action Button (FAB) for Adding Product */}
        {activeTab === 'products' && !isAddingProduct && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setPSku('NEXO-' + Math.floor(1000 + Math.random() * 9000));
              setPName('');
              setPBrand('Nexovira Pro');
              setPCategory(categories[0]?.id || 'cat-refrigerators');
              setPPrice(150000);
              setPOriginalPrice(180000);
              setPStock(10);
              setPDesc('');
              setPImgUrl('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80');
              setIsAddingProduct(true);
            }}
            className="md:hidden fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center font-bold border-2 border-white transition-all"
            aria-label="Add New Product"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        {/* Global Toast Notification Overlay */}
        {toastNotification && (
          <div
            className={`fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold text-white transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              toastNotification.type === 'success' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-rose-600 shadow-rose-600/20'
            }`}
          >
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span className="flex-1">{toastNotification.message}</span>
            <button
              onClick={() => setToastNotification(null)}
              className="text-white/80 hover:text-white font-black text-sm p-0.5 ml-1"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
