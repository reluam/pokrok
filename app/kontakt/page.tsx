import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import { getBaseUrl } from '@/lib/utils'

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Kontakt
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Máte otázky ohledně aplikace Pokrok? Rádi vám pomůžeme a zodpovíme všechny vaše dotazy.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Spojte se s námi</h2>
                <p className="text-gray-600 mb-8">
                  Jsme tu, abychom vám pomohli s aplikací Pokrok a vaší cestou k lepšímu životu. 
                  Ať už máte technické otázky, potřebujete pomoc s používáním aplikace, 
                  nebo chcete sdílet zpětnou vazbu, rádi vás vyslechneme.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">📧</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Email</p>
                    <a href="mailto:info@pokrok.app" className="text-primary-600 hover:text-primary-700">
                      info@pokrok.app
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">⏰</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Doba odpovědi</p>
                    <p className="text-gray-600">Do 24 hodin</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">💬</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Aplikace</p>
                    <a href={`${getBaseUrl()}/muj`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                      Otevřít aplikaci Pokrok
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
