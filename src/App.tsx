/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { InvoicePage } from './pages/InvoicePage';
import { AiSommelierPage } from './pages/AiSommelierPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AccountPage } from './pages/AccountPage';
import { DistributorPage } from './pages/DistributorPage';
import { AiChatbotDrawer } from './components/AiChatbotDrawer';
import { FloatingAiChatButton } from './components/FloatingAiChatButton';
import { ProductVariantModal } from './components/ProductVariantModal';
import { PRODUCTS } from './data/products';
import { CheckCircle2 } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('turmeric-powder');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('SS1025');
  const [authRedirectTarget, setAuthRedirectTarget] = useState<Page>('account');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const { toastMessage, variantModalProduct, initialPackIndex, closeVariantModal } = useCart();

  // Synchronize with URL hash for browser history, back/forward, and direct linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const parts = hash.split('/');
      const rawRoute = parts[0];

      if (rawRoute === 'product' && parts[1]) {
        setSelectedProductSlug(parts[1]);
        setCurrentPage('product-detail');
      } else if (rawRoute === 'order-confirmation' && parts[1]) {
        setSelectedOrderId(parts[1]);
        setCurrentPage('order-confirmation');
      } else if (rawRoute === 'invoice' && parts[1]) {
        setSelectedOrderId(parts[1]);
        setCurrentPage('invoice');
      } else if (
        [
          'home',
          'about',
          'products',
          'product-detail',
          'gallery',
          'contact',
          'cart',
          'checkout',
          'order-confirmation',
          'admin',
          'invoice',
          'ai-sommelier',
          'login',
          'register',
          'forgot-password',
          'account',
          'distributor',
          'wholesale',
        ].includes(rawRoute)
      ) {
        if (rawRoute === 'wholesale' || rawRoute === 'distributor') {
          setCurrentPage('distributor');
        } else {
          setCurrentPage(rawRoute as Page);
        }
        if (rawRoute === 'product-detail' && parts[1]) {
          setSelectedProductSlug(parts[1]);
        }
      } else {
        setCurrentPage('home');
      }
    };

    // Initial check
    if (window.location.hash) {
      handleHashChange();
    } else {
      window.location.hash = '#/home';
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: Page, slugOrId?: string) => {
    if (page === 'product-detail') {
      const targetSlug = slugOrId || selectedProductSlug || PRODUCTS[0].slug;
      setSelectedProductSlug(targetSlug);
      setCurrentPage('product-detail');
      window.location.hash = `#/product/${targetSlug}`;
    } else if (page === 'order-confirmation') {
      const targetId = slugOrId || selectedOrderId || 'SS1025';
      setSelectedOrderId(targetId);
      setCurrentPage('order-confirmation');
      window.location.hash = `#/order-confirmation/${targetId}`;
    } else if (page === 'invoice') {
      const targetId = slugOrId || selectedOrderId || 'SS1025';
      setSelectedOrderId(targetId);
      setCurrentPage('invoice');
      window.location.hash = `#/invoice/${targetId}`;
    } else {
      if (page === 'login' && slugOrId) {
        setAuthRedirectTarget(slugOrId as Page);
      } else if (page === 'login') {
        setAuthRedirectTarget('account');
      }
      setCurrentPage(page);
      window.location.hash = `#/${page}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (slug: string) => {
    navigateTo('product-detail', slug);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF2] text-[#2C3E50] selection:bg-[#F39C12]/30 selection:text-[#96281B] relative">
      {/* Global Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#2C3E50] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#F1C40F] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar on every page */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
      />

      {/* Main Page View Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={navigateTo} />
        )}

        {currentPage === 'products' && (
          <ProductsPage
            onNavigate={navigateTo}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentPage === 'product-detail' && (
          <ProductDetailPage
            productSlug={selectedProductSlug}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'gallery' && (
          <GalleryPage onNavigate={navigateTo} />
        )}

        {currentPage === 'contact' && (
          <ContactPage onNavigate={navigateTo} />
        )}

        {currentPage === 'cart' && (
          <CartPage onNavigate={navigateTo} />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage onNavigate={navigateTo} />
        )}

        {currentPage === 'order-confirmation' && (
          <OrderConfirmationPage
            orderId={selectedOrderId}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage onNavigate={navigateTo} />
        )}

        {currentPage === 'invoice' && (
          <InvoicePage
            orderId={selectedOrderId}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'ai-sommelier' && (
          <AiSommelierPage onNavigate={navigateTo} />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onNavigate={navigateTo}
            redirectTarget={authRedirectTarget}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onNavigate={navigateTo}
            redirectTarget={authRedirectTarget}
          />
        )}

        {currentPage === 'forgot-password' && (
          <ForgotPasswordPage onNavigate={navigateTo} />
        )}

        {currentPage === 'account' && (
          <AccountPage onNavigate={navigateTo} />
        )}

        {currentPage === 'distributor' && (
          <DistributorPage onNavigate={navigateTo} />
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer onNavigate={navigateTo} />

      {/* AI Sommelier Multi-turn Chatbot Drawer */}
      <AiChatbotDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onNavigate={navigateTo}
      />

      {/* Product Variant Bottom Sheet / Modal (Blinkit style) */}
      <ProductVariantModal
        product={variantModalProduct}
        initialPackIndex={initialPackIndex}
        isOpen={!!variantModalProduct}
        onClose={closeVariantModal}
        onNavigate={navigateTo}
      />

      {/* Floating AI Sommelier Button */}
      <FloatingAiChatButton
        onOpen={() => setIsAiDrawerOpen(true)}
        currentPage={currentPage}
      />

      {/* Consistent Footer on every page */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
