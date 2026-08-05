import React from 'react';
import { Order } from '../types';
import { CheckCircle2, Printer, ShoppingBag, ShieldCheck, Truck, PhoneCall, Copy, ArrowRight } from 'lucide-react';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl relative text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header Badge */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Payment Verified & Order Confirmed!
          </h2>
          <p className="text-xs text-slate-500">
            Order Number: <span className="font-bold text-blue-600">#{order.orderNumber}</span> | Tracking: <span className="font-bold text-slate-800">{order.trackingNumber}</span>
          </p>
        </div>

        {/* Invoice Printable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Shipping & Payment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                Customer Delivery Address:
              </p>
              <p className="font-semibold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.shippingAddress.street}</p>
              <p className="text-slate-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p className="text-slate-600 mt-1">Phone: {order.customerPhone}</p>
            </div>

            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                Payment Details:
              </p>
              <p className="text-slate-700">
                Status:{' '}
                <span className="font-bold text-emerald-600 uppercase">{order.paymentStatus}</span>
              </p>
              <p className="text-slate-700">Method: {order.paymentMethod}</p>
              <p className="text-slate-700">
                Ref: <span className="font-mono text-blue-600">{order.paymentReference}</span>
              </p>
              <p className="text-slate-500 mt-1">Date: {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Ordered Items</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{item.productName}</p>
                      <p className="text-[10px] text-slate-500">
                        SKU: {item.sku} | Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">₦{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span>-₦{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span>{order.shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₦${order.shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-blue-600 font-black">₦{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-slate-700">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-[11px] leading-snug">
              Our delivery team will contact you on <strong>{order.customerPhone}</strong> within 24 hours to schedule installation and delivery.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-600" /> Print Receipt
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewOrders();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <span>View Order History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
