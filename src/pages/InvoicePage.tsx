import React, { useState, useEffect } from 'react';
import { Page, Order } from '../types';
import { InvoiceView } from '../components/InvoiceView';

interface InvoicePageProps {
  orderId: string;
  onNavigate: (page: Page, slug?: string) => void;
}

export const InvoicePage: React.FC<InvoicePageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching invoice order:', err);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#96281B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[#2C3E50]">Generating Official Invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">Invoice Not Found</h2>
        <p className="text-xs text-[#5D6D7E]">Unable to find invoice for #{orderId}</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2 rounded-full bg-[#96281B] text-white text-xs font-bold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <InvoiceView order={order} onClose={() => onNavigate('order-confirmation', orderId)} />
    </div>
  );
};
