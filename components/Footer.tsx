'use client'

export default function Footer() {
  return (
    <footer className="bg-primary-500 relative">
      {/* Decorative border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-blue-500"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-primary-500 font-bold text-xl">H</span>
            </div>
            <p className="text-white text-sm">
              © 2025 Harmonix
            </p>
          </div>

          {/* About Column */}
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <a href="#o-mne" className="text-white hover:text-primary-100 transition-colors text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#blog" className="text-white hover:text-primary-100 transition-colors text-sm">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Services Column */}
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#mindset-coaching" className="text-white hover:text-primary-100 transition-colors text-sm">
                  Mindset coaching
                </a>
              </li>
              <li>
                <a href="#career-coaching" className="text-white hover:text-primary-100 transition-colors text-sm">
                  Career coaching
                </a>
              </li>
              <li>
                <a href="#life-coaching" className="text-white hover:text-primary-100 transition-colors text-sm">
                  Life coaching
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:info@harmonix.com" className="text-white hover:text-primary-100 transition-colors text-sm">
                  info@harmonix.com
                </a>
              </li>
              <li>
                <a href="tel:+390123456789" className="text-white hover:text-primary-100 transition-colors text-sm">
                  +39 012 345 6789
                </a>
              </li>
              <li>
                <a href="#kontakt" className="text-white hover:text-primary-100 transition-colors text-sm font-medium">
                  Get in touch
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
