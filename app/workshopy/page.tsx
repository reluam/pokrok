import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAdminSetting } from '@/lib/admin-db'

export async function generateMetadata(): Promise<Metadata> {
  const workshopsEnabled = await getAdminSetting('workshops_enabled')
  
  if (workshopsEnabled?.value !== 'true') {
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
    title: 'Workshopy - Smysluplné žití',
    description: 'Objevte naše workshopy zaměřené na osobní rozvoj a nalezení životního smyslu.',
  }
}

export default async function WorkshopyPage() {
  const workshopsEnabled = await getAdminSetting('workshops_enabled')
  
  if (workshopsEnabled?.value !== 'true') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-h1 text-text-primary mb-8">Workshopy</h1>
            <p className="text-asul18 text-gray-600 mb-12">
              Objevte naše workshopy zaměřené na osobní rozvoj a nalezení životního smyslu.
            </p>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <h2 className="text-h3 text-text-primary mb-4">Workshopy budou brzy k dispozici</h2>
              <p className="text-asul16 text-gray-600">
                Připravujeme pro vás zajímavé workshopy. Sledujte naše stránky nebo nás kontaktujte pro více informací.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

