'use client'

import { useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background pt-2.5 pb-2.5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="block">
              <div className="text-h3 text-primary-500 hover:text-primary-600 transition-colors">
                Smysluplné žití
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 ml-auto mr-8">
            <a href="#koucink" className="text-asul18 text-text-primary hover:text-primary-600 transition-colors">
              Koučing
            </a>
            <a href="#inspirace" className="text-asul18 text-text-primary hover:text-primary-600 transition-colors">
              Inspirace
            </a>
            <a href="#blog" className="text-asul18 text-text-primary hover:text-primary-600 transition-colors">
              Blog
            </a>
            <a href="#o-mne" className="text-asul18 text-text-primary hover:text-primary-600 transition-colors">
              O mně
            </a>
          </nav>

              {/* Contact Button */}
              <div className="hidden md:block">
                <a
                  href="/kontakt"
                  className="bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2 text-asul18"
                >
                  <span>Kontakt</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t">
              <a href="#koucink" className="block px-3 py-2 text-asul18 text-text-primary hover:text-primary-600">
                Koučing
              </a>
              <a href="#inspirace" className="block px-3 py-2 text-asul18 text-text-primary hover:text-primary-600">
                Inspirace
              </a>
              <a href="#blog" className="block px-3 py-2 text-asul18 text-text-primary hover:text-primary-600">
                Blog
              </a>
              <a href="#o-mne" className="block px-3 py-2 text-asul18 text-text-primary hover:text-primary-600">
                O mně
              </a>
                  <a
                    href="/kontakt"
                    className="block px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2 text-asul18"
                  >
                    <span>Kontakt</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
