import { redirect } from 'next/navigation'

export default function InspirationSlugRedirect({ params }: { params: { slug: string } }) {
  redirect(`/materialy/${params.slug}`)
}