'use client'

export default function Footer() {
  return (
        <footer className="bg-primary-500 relative border-t">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">H</span>
            </div>
                <p className="text-white text-sm">
                  © 2025 Smysluplné žití
                </p>
          </div>

          {/* About Column */}
          <div className="md:col-span-1">
                <h3 className="text-h4 text-white mb-4">O projektu</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="/o-mne" className="text-asul16 text-white hover:text-gray-200 transition-colors">
                      O mně
                    </a>
                  </li>
                  <li>
                    <a href="/inspirace" className="text-asul16 text-white hover:text-gray-200 transition-colors">
                      Inpirace
                    </a>
                  </li>
                </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-1">
            <h3 className="text-h4 text-white mb-4">Kontakt</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:matej@smysluplneziti.cz" className="text-asul16 text-white hover:text-gray-200 transition-colors">
                  matej@smysluplneziti.cz
                </a>
              </li>
              <li>
                <a href="tel:+420725527052" className="text-asul16 text-white hover:text-gray-200 transition-colors">
                  +420 725 527 052
                </a>
              </li>
              <li>
                <a href="/kontakt" className="text-asul16 text-white hover:text-gray-200 transition-colors font-medium">
                  Kontaktujte mě
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
