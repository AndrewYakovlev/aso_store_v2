import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  variant?: 'primary' | 'secondary'
  noLink?: boolean
}

export function Logo({ className = '', width = 200, height = 50, variant = 'primary', noLink = false }: LogoProps) {
  const logoSrc = variant === 'primary' ? '/logo.png' : '/logo2.png'
  const logoAlt = variant === 'primary' 
    ? 'АСО - интернет-магазин автозапчастей' 
    : 'АСО - символ'
  
  const imageElement = (
    <Image
      src={logoSrc}
      alt={logoAlt}
      width={width}
      height={height}
      priority
    />
  )
  
  if (noLink) {
    return <div className={`inline-block ${className}`}>{imageElement}</div>
  }
  
  return (
    <Link href="/" className={`inline-block ${className}`}>
      {imageElement}
    </Link>
  )
}