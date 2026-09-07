/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { PRODUCTS } from './data/products';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('turmeric-powder');

  // Synchronize with URL hash for browser history, back/forward, and direct linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const parts = hash.split('/');
      const rawRoute = parts[0];

      if (rawRoute === 'product' && parts[1]) {
        setSelectedProductSlug(parts[1]);
        setCurrentPage('product-detail');
      } else if (['home', 'about', 'products', 'product-detail', 'gallery', 'contact'].includes(rawRoute)) {
        setCurrentPage(rawRoute as Page);
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

  const navigateTo = (page: Page, slug?: string) => {
    if (page === 'product-detail' || slug) {
      const targetSlug = slug || selectedProductSlug || PRODUCTS[0].slug;
      setSelectedProductSlug(targetSlug);
      setCurrentPage('product-detail');
      window.location.hash = `#/product/${targetSlug}`;
    } else {
      setCurrentPage(page);
      window.location.hash = `#/${page}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (slug: string) => {
    navigateTo('product-detail', slug);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF2] text-[#2C3E50] selection:bg-[#F39C12]/30 selection:text-[#96281B]">
      {/* Navigation Bar on every page */}
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

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
      </main>

      {/* Floating WhatsApp chat button on every page */}
      <FloatingWhatsApp />

      {/* Consistent Footer on every page */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
