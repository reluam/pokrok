'use client'

import { usePathname } from 'next/navigation'
import { CestaLayout } from './CestaLayout'
import { PageProvider, usePageContext } from './PageContext'

interface DynamicCestaLayoutProps {
  children: React.ReactNode
}

function DynamicCestaLayoutContent({ children }: DynamicCestaLayoutProps) {
  const pathname = usePathname()
  const { title, subtitle } = usePageContext()

  return (
    <CestaLayout 
      title={title}
      subtitle={subtitle}
      currentPage={pathname}
    >
      {children}
    </CestaLayout>
  )
}

export function DynamicCestaLayout({ children }: DynamicCestaLayoutProps) {
  return (
    <PageProvider>
      <DynamicCestaLayoutContent>
        {children}
      </DynamicCestaLayoutContent>
    </PageProvider>
  )
}
