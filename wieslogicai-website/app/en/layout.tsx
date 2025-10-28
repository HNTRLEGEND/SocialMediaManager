import NavigationEN from '@/components/NavigationEN'
import FooterEN from '@/components/FooterEN'

export default function EnglishLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavigationEN />
      {children}
      <FooterEN />
    </>
  )
}
