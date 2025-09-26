'use client'

export default function Footer() {
  return (
    <footer className="bg-background relative border-t">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <p className="text-text-primary text-sm">
              © 2025 Smysluplné žití
            </p>
          </div>

          {/* About Column */}
          <div className="md:col-span-1">
                <h3 className="text-h4 text-text-primary mb-4">About</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#o-mne" className="text-asul16 text-gray-600 hover:text-primary-600 transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#blog" className="text-asul16 text-gray-600 hover:text-primary-600 transition-colors">
                      Blog
                    </a>
                  </li>
                </ul>
          </div>

          {/* Services Column */}
          <div className="md:col-span-1">
            <h3 className="text-h4 text-text-primary mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#mindset-coaching" className="text-asul16 text-gray-600 hover:text-primary-600 transition-colors">
                  Mindset coaching
                </a>
              </li>
              <li>
                <a href="#career-coaching" className="text-asul16 text-gray-600 hover:text-primary-600 transition-colors">
                  Career coaching
                </a>
              </li>
              <li>
                <a href="#life-coaching" className="text-asul16 text-gray-600 hover:text-primary-600 transition-colors">
                  Life coaching
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-1">
            <h3 className="text-h4 text-text-primary mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:info@harmonix.com" className="text-asul16 text-gray-600 hover:text-primary-600 transition-colors">
                  info@harmonix.com
                </a>
              </li>
              <li>
                <a href="tel:+390123456789" className="text-asul16 text-gray-600 hover:text-primary-600 transition-colors">
                  +39 012 345 6789
                </a>
              </li>
              <li>
                <a href="#kontakt" className="text-asul16 text-gray-600 hover:text-primary-600 transition-colors font-medium">
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
