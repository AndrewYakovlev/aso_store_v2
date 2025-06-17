import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = '', width = 200, height = 50 }: LogoProps) {
  return (
    <Link href="/" className={`inline-block ${className}`}>
      <Image
        src="/logo.png"
        alt="АСО - интернет-магазин автозапчастей"
        width={width}
        height={height}
        priority
      />
    </Link>
  )
}