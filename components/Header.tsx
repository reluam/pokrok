'use client'

import { useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#koucink" className="text-gray-700 hover:text-primary-600 transition-colors">
              Koučing
            </a>
            <a href="#inspirace" className="text-gray-700 hover:text-primary-600 transition-colors">
              Inspirace
            </a>
            <a href="#blog" className="text-gray-700 hover:text-primary-600 transition-colors">
              Blog
            </a>
            <a href="#o-mne" className="text-gray-700 hover:text-primary-600 transition-colors">
              O mně
            </a>
          </nav>

          {/* Contact Button */}
          <div className="hidden md:block">
            <a
              href="/kontakt"
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#koucink" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                Koučing
              </a>
              <a href="#inspirace" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                Inspirace
              </a>
              <a href="#blog" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                Blog
              </a>
              <a href="#o-mne" className="block px-3 py-2 text-gray-700 hover:text-primary-600">
                O mně
              </a>
              <a
                href="/kontakt"
                className="block px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2"
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
