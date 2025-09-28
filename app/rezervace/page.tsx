import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Calendar, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react'

const bookingOptions = [
  {
    id: 'koucovy-balicek',
    title: 'Koučovací balíček',
    subtitle: 'Plně přizpůsobitelný',
    description: 'Komplexní koučovací program na míru - od 6 sezení, s individuálním přístupem a cenou',
    price: 'Cena na domluvě',
    duration: 'Od 6 sezení',
    features: [
      'První konzultace zdarma (30 min)',
      'Minimálně 6 sezení',
      'Individuální frekvence a délka',
      'Flexibilní cena podle vašich možností',
      'E-mailová podpora mezi sezeními',
      'Materiály a cvičení na míru'
    ],
    color: 'bg-primary-500',
    textColor: 'text-primary-500',
    borderColor: 'border-primary-500',
    headerTextColor: 'text-white'
  },
  {
    id: 'jednorazovy-koucink',
    title: 'Jednorázový koučing',
    subtitle: '1 sezení',
    description: 'Jednotlivé koučovací sezení pro řešení konkrétních výzev',
    price: '2 500 Kč',
    duration: '60 minut',
    features: [
      'Fokus na konkrétní téma',
      'Okamžité praktické řešení',
      'Individuální přístup',
      'Materiály k sezení',
      'E-mailová podpora 7 dní'
    ],
    color: 'bg-primary-100',
    textColor: 'text-primary-600',
    borderColor: 'border-primary-500',
    headerTextColor: 'text-primary-500'
  },
  {
    id: 'vstupni-konzultace',
    title: 'Zkušební hodina zdarma',
    subtitle: '1 hodina',
    description: 'Vyzkoušejte si koučing zdarma a uvidíte, zda vám vyhovuje. Plnohodnotné sezení bez závazků.',
    price: 'Zdarma',
    duration: '60 minut',
    features: [
      'Plnohodnotné koučovací sezení',
      'Praktické ukázky technik',
      'Seznámení s koučovacím procesem',
      'Definování vašich cílů',
      'Doporučení dalšího postupu',
      'Bez závazků'
    ],
    color: 'bg-[#3E603B]',
    textColor: 'text-[#3E603B]',
    borderColor: 'border-[#3E603B]'
  }
]

export default function BookingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-h1 text-text-primary mb-4">
              Rezervace
            </h1>
            <p className="text-p18 text-gray-600 max-w-3xl mx-auto">
              Vyberte si koučovací službu, která nejlépe odpovídá vašim potřebám. 
              Začněte se zkušební hodinou zdarma a uvidíte, zda vám můj styl koučingu vyhovuje.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Options */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {bookingOptions.map((option, index) => (
              <div 
                key={option.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 ${option.borderColor} border-opacity-20 flex flex-col`}
              >
                {/* Header */}
                <div className={`${option.color} rounded-t-2xl p-6 ${option.headerTextColor || 'text-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-6 h-6" />
                      <span className="text-asul18 font-medium">Koučing</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{option.price}</div>
                      <div className="text-sm opacity-90">{option.duration}</div>
                    </div>
                  </div>
                  <h3 className="text-h3 mb-2">{option.title}</h3>
                  <p className="text-asul18 opacity-90">{option.subtitle}</p>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-p16 text-gray-600 mb-6">
                    {option.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className={`w-5 h-5 ${option.textColor} flex-shrink-0 mt-0.5`} />
                        <span className="text-p16 text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/rezervace/${option.id}`}
                    className={`w-full ${option.color} ${option.headerTextColor || 'text-white'} px-6 py-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 text-asul18 font-medium`}
                  >
                    <span>Rezervovat</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Info */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Jak rezervace probíhá
            </h2>
            <p className="text-p18 text-gray-600">
              Jednoduchý proces k rezervaci vašeho koučovacího sezení. Začněte se zkušební hodinou zdarma!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-h4 text-text-primary mb-2">Vyberte službu</h3>
              <p className="text-p16 text-gray-600">
                Klikněte na "Rezervovat" u služby, která vás zajímá
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-h4 text-text-primary mb-2">Vyberte termín</h3>
              <p className="text-p16 text-gray-600">
                V kalendáři si vyberte vhodný termín pro vaše sezení
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-h4 text-text-primary mb-2">Potvrďte rezervaci</h3>
              <p className="text-p16 text-gray-600">
                Vyplňte kontaktní údaje a potvrďte rezervaci
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Často kladené otázky
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-h4 text-text-primary mb-2">Jak probíhá koučovací sezení?</h3>
              <p className="text-p16 text-gray-600">
                Koučovací sezení probíhají online přes videohovor. Každé sezení je strukturované 
                a zaměřené na vaše konkrétní cíle. Používám různé koučovací techniky a nástroje 
                pro maximální efektivitu.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-h4 text-text-primary mb-2">Mohu změnit nebo zrušit rezervaci?</h3>
              <p className="text-p16 text-gray-600">
                Ano, rezervaci můžete změnit nebo zrušit nejpozději 24 hodin před plánovaným 
                termínem. V případě pozdějšího zrušení se účtuje 50% z ceny sezení.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-h4 text-text-primary mb-2">Jak probíhá platba?</h3>
              <p className="text-p16 text-gray-600">
                Platba probíhá online přes zabezpečený platební systém. Můžete platit kartou 
                nebo bankovním převodem. Faktura vám bude zaslána e-mailem.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
