import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-h1 text-text-primary mb-4">
              O mně
            </h1>
            <p className="text-p18 text-gray-600 max-w-3xl mx-auto">
              Pojďme se poznat a objevit, jak můžu podpořit vaši cestu k smysluplnému životu.
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-h2 text-text-primary">
                Můj příběh
              </h2>
              <p className="text-p16 text-gray-600">
                Jsem kouč a průvodce na cestě k smysluplnému životu. Pomáhám lidem najít jejich 
                skutečný účel a vytvořit život, který je naplňuje a dává jim smysl.
              </p>
              <p className="text-p16 text-gray-600">
                S více než 10 lety zkušeností v oblasti osobního rozvoje a koučingu jsem podpořil 
                stovky lidí v jejich transformaci. Věřím, že každý z nás má v sobě potenciál 
                pro úspěch a štěstí.
              </p>
              <p className="text-p16 text-gray-600">
                Můj přístup je založen na empatii, respektu a praktických řešeních, které 
                skutečně fungují v každodenním životě.
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <p className="text-asul16 text-gray-600">Přidejte svou fotku</p>
                    <p className="text-asul10 text-gray-500 mt-2">do /public/images/about-photo.jpg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-h2 text-text-primary mb-3">
              Moje hodnoty
            </h2>
            <p className="text-p16 text-gray-600">
              Principy, které mě vedou v práci s klienty
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-h4 text-text-primary">Zvídavost</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Aktivně objevuji a poznávám nové způsoby, jak žít smysluplněji.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">🌱</div>
              <h3 className="text-h4 text-text-primary">Růst</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Aspiruji k tomu být lepší verzí sama sebe.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">💭</div>
              <h3 className="text-h4 text-text-primary">Otevřenost</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Přijímám nové nápady, myšlenky i kritiku s otevřenou myslí.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">💎</div>
              <h3 className="text-h4 text-text-primary">Upřímnost</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Věci popisuji tak, jak jsou.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">✨</div>
              <h3 className="text-h4 text-text-primary">Radost</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Jsem rád za příležitost být aktivním členem našeho světa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 text-text-primary mb-4">
            Pojďme se potkat
          </h2>
          <p className="text-p18 text-gray-600 mb-8">
            Rád bych vás poznal a diskutoval o tom, jak můžu podpořit vaši cestu.
          </p>
          <a
            href="/rezervace"
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors text-asul18"
          >
            <span>Rezervujte si konzultaci</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
