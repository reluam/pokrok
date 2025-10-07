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
              O aplikaci Pokrok
            </h1>
            <p className="text-p18 text-gray-600 max-w-3xl mx-auto">
              Objevte aplikaci, která vám pomůže najít smysl života a dosáhnout osobního růstu.
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
                Co je Pokrok?
              </h2>
              <p className="text-p16 text-gray-600">
                Pokrok je aplikace pro osobní rozvoj, která vám pomůže najít smysl života, 
                stanovit si jasné cíle a systematicky je dosahovat. Aplikace kombinuje 
                osvědčené metody koučingu s moderními technologiemi.
              </p>
              <p className="text-p16 text-gray-600">
                Pomocí inteligentních nástrojů můžete sledovat svůj pokrok, oslavovat úspěchy 
                a vytvářet trvalé pozitivní změny ve svém životě. Aplikace je navržena tak, 
                aby byla vaším osobním průvodcem na cestě k lepšímu životu.
              </p>
              <p className="text-p16 text-gray-600">
                Všechny funkce jsou založeny na vědecky podložených metodách osobního rozvoje 
                a jsou přizpůsobeny vašim individuálním potřebám a cílům.
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <p className="text-asul16 text-gray-600">Screenshot aplikace</p>
                    <p className="text-asul10 text-gray-500 mt-2">do /public/images/app-screenshot.jpg</p>
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
              Klíčové funkce
            </h2>
            <p className="text-p16 text-gray-600">
              Co aplikace Pokrok umí a jak vám může pomoci
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-h4 text-text-primary">Stanovování cílů</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Vytvářejte si jasné a dosažitelné cíle s pomocí inteligentních nástrojů.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-h4 text-text-primary">Sledování pokroku</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Měřte svůj pokrok a oslavujte úspěchy na cestě k lepšímu životu.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">🧠</div>
              <h3 className="text-h4 text-text-primary">Osobní rozvoj</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Rozvíjejte se systematicky pomocí personalizovaných cvičení.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">💡</div>
              <h3 className="text-h4 text-text-primary">Inspirace</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Získejte motivaci a inspiraci pro každý den vašeho života.
              </p>
            </div>

            <div className="text-center space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-4xl mb-2">🤝</div>
              <h3 className="text-h4 text-text-primary">Podpora</h3>
              <p className="text-p14 text-gray-600 leading-relaxed">
                Získejte podporu a vedení na vaší cestě k osobnímu růstu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 text-text-primary mb-4">
            Začněte svou cestu k lepšímu životu
          </h2>
          <p className="text-p18 text-gray-600 mb-8">
            Stáhněte si aplikaci Pokrok a začněte svou transformaci ještě dnes.
          </p>
          <a
            href="/moje"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors text-asul18"
          >
            <span>Otevřít aplikaci</span>
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
