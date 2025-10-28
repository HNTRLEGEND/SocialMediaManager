import NavigationDE from '@/components/NavigationDE'
import FooterDE from '@/components/FooterDE'

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  return (
    <>
      <NavigationDE />
      {children}
      <FooterDE />
    </>
  )
}
