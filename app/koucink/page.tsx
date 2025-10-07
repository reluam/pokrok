import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Lightbulb, Target, Users, Clock, CheckCircle, Calendar, ArrowRight } from 'lucide-react'
import { getAdminSetting } from '@/lib/admin-db'
import CoachingPackagesSection from '@/components/CoachingPackagesSection'

export async function generateMetadata(): Promise<Metadata> {
  const coachingEnabled = await getAdminSetting('coaching_enabled')
  
  if (coachingEnabled?.value !== 'true') {
    return {
      robots: {
        index: false,
        follow: false,
        nocache: true,
        noarchive: true,
        nosnippet: true,
        noimageindex: true,
      }
    }
  }

  return {
    title: 'Koučing - Smysluplné žití',
    description: 'Transformujte svůj život pomocí profesionálního koučingu. Najděte svůj smysl a vytvořte život, který vás skutečně naplňuje.',
  }
}


const processSteps = [
  {
    step: '1',
    title: 'Úvodní konzultace',
    description: 'Společně probereme vaše cíle a očekávání, abychom vytvořili plán na míru.'
  },
  {
    step: '2',
    title: 'Analýza situace',
    description: 'Prozkoumáme vaši současnou situaci a identifikujeme oblasti pro růst.'
  },
  {
    step: '3',
    title: 'Vytvoření plánu',
    description: 'Společně vytvoříme konkrétní kroky a strategie pro dosažení vašich cílů.'
  },
  {
    step: '4',
    title: 'Implementace a podpora',
    description: 'Budu vás podporovat při realizaci plánu a pomohu překonat překážky.'
  }
]

export default async function CoachingPage() {
  const coachingEnabled = await getAdminSetting('coaching_enabled')
  
  if (coachingEnabled?.value !== 'true') {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-h1 text-text-primary mb-4">
              Koučing
            </h1>
            <p className="text-p18 text-gray-600 max-w-3xl mx-auto">
              Transformujte svůj život pomocí profesionálního koučingu. Najděte svůj smysl a 
              vytvořte život, který vás skutečně naplňuje.
            </p>
          </div>
        </div>
      </section>

      {/* Coaching Packages Section */}
      <CoachingPackagesSection />

      {/* Process Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Jak koučing probíhá
            </h2>
            <p className="text-p18 text-gray-600">
              Strukturovaný proces, který vás dovede k vašim cílům
            </p>
          </div>

          <div className="space-y-8">
            {processSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-h3 text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-p16 text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 text-text-primary mb-4">
              Co získáte
            </h2>
            <p className="text-p18 text-gray-600">
              Konkrétní výsledky, které můžete očekávat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-primary-500" />
                <h3 className="text-h4 text-text-primary">Jasnost a směr</h3>
              </div>
              <p className="text-p16 text-gray-600">
                Získáte jasnou představu o tom, kam chcete směřovat a jak toho dosáhnout.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-primary-500" />
                <h3 className="text-h4 text-text-primary">Konkrétní kroky</h3>
              </div>
              <p className="text-p16 text-gray-600">
                Dostanete praktický plán s konkrétními kroky, které můžete okamžitě začít realizovat.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-primary-500" />
                <h3 className="text-h4 text-text-primary">Podpora a motivace</h3>
              </div>
              <p className="text-p16 text-gray-600">
                Budu vás podporovat po celou dobu procesu a pomohu překonat překážky.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-6 h-6 text-primary-500" />
                <h3 className="text-h4 text-text-primary">Nové dovednosti</h3>
              </div>
              <p className="text-p16 text-gray-600">
                Naučíte se techniky a nástroje, které můžete používat i po skončení koučingu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 text-text-primary mb-4">
            Začněte svou transformaci
          </h2>
          <p className="text-p18 text-gray-600 mb-8">
            Pojďme společně vytvořit plán, který vás dovede k vašim cílům a naplněnému životu.
          </p>
          <a
            href="/kontakt"
            className="inline-flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors text-asul18"
          >
            <span>Kontaktovat</span>
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
