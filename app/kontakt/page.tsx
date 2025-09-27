import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

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
              Ready to start your journey? Let's connect and discuss how I can help you find meaning and purpose in your life.
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
                <h2 className="text-2xl font-bold text-text-primary mb-6">Let's Connect</h2>
                <p className="text-gray-600 mb-8">
                  I'm here to help you unlock your potential and create a life you truly love. 
                  Whether you're looking for mindset coaching, career guidance, or life direction, 
                  I'm ready to support you on your journey.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">📧</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Email</p>
                    <a href="mailto:info@harmonix.com" className="text-primary-600 hover:text-primary-700">
                      info@harmonix.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">📞</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Phone</p>
                    <a href="tel:+390123456789" className="text-primary-600 hover:text-primary-700">
                      +39 012 345 6789
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">⏰</span>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Response Time</p>
                    <p className="text-gray-600">Within 24 hours</p>
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
