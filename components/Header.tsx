'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 pt-2.5 pb-2.5 bg-background" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '100px 100px'
    }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <div className="text-h3 text-primary-500 hover:text-primary-600 transition-colors">
                Smysluplné žití
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 ml-auto mr-8">
            <Link href="/koucink" className="text-asul18 text-text-primary hover:text-primary-600 transition-colors">
              Koučing
            </Link>
            <Link href="/inspirace" className="text-asul18 text-text-primary hover:text-primary-600 transition-colors">
              Inspirace
            </Link>
            <Link href="/o-mne" className="text-asul18 text-text-primary hover:text-primary-600 transition-colors">
              O mně
            </Link>
          </nav>

              {/* Contact Button */}
              <div className="hidden md:block">
                <Link
                  href="/kontakt"
                  className="bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2 text-asul18"
                >
                  <span>Kontakt</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
              <Link href="/koucink" onClick={closeMenu} className="block px-3 py-2 text-asul18 text-text-primary hover:text-primary-600">
                Koučing
              </Link>
              <Link href="/inspirace" onClick={closeMenu} className="block px-3 py-2 text-asul18 text-text-primary hover:text-primary-600">
                Inspirace
              </Link>
              <Link href="/o-mne" onClick={closeMenu} className="block px-3 py-2 text-asul18 text-text-primary hover:text-primary-600">
                O mně
              </Link>
                  <Link
                    href="/kontakt"
                    onClick={closeMenu}
                    className="block px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2 text-asul18"
                  >
                    <span>Kontakt</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
