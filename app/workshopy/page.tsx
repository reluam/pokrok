import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAdminSetting } from '@/lib/admin-db'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Materiály - Pokrok',
    description: 'Objevte užitečné materiály a zdroje pro váš osobní rozvoj a smysluplné žití.',
  }
}

export default async function MaterialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-h1 text-text-primary mb-8">Materiály</h1>
            <p className="text-asul18 text-gray-600 mb-12">
              Objevte užitečné materiály a zdroje pro váš osobní rozvoj a smysluplné žití.
            </p>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <h2 className="text-h3 text-text-primary mb-4">Materiály jsou dostupné v aplikaci</h2>
              <p className="text-asul16 text-gray-600 mb-6">
                Všechny materiály pro osobní rozvoj najdete přímo v aplikaci Pokrok. 
                Otevřete aplikaci a začněte svou cestu k lepšímu životu.
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

