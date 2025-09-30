import { Book, Video, FileText, Lightbulb, Globe, Smartphone, MoreHorizontal } from 'lucide-react'
import { InspirationIcon as IconType } from '@/lib/cms'

interface InspirationIconProps {
  type: IconType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const iconMap = {
  book: Book,
  video: Video,
  article: FileText,
  thought: Lightbulb,
  webpage: Globe,
  application: Smartphone,
  other: MoreHorizontal
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

const colorMap = {
  book: 'text-primary-500',
  video: 'text-red-600',
  article: 'text-amber-600',
  thought: 'text-slate-600',
  webpage: 'text-purple-600',
  application: 'text-indigo-600',
  other: 'text-gray-600'
}

export default function InspirationIcon({ 
  type, 
  size = 'md', 
  className = '' 
}: InspirationIconProps) {
  const IconComponent = iconMap[type]
  const sizeClass = sizeMap[size]
  const colorClass = colorMap[type]

  return (
    <IconComponent 
      className={`${sizeClass} ${colorClass} ${className}`} 
    />
  )
}
