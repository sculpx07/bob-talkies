import { Helmet } from 'react-helmet-async'
import { config } from '@/lib/config'

interface SeoProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: string
  noindex?: boolean
}

export function Seo({ title, description, canonical, ogImage, ogType = 'website', noindex }: SeoProps) {
  const fullTitle = title.includes('BOB Talkies') ? title : `${title} | BOB Talkies`
  const url = canonical ? `${config.siteUrl}${canonical}` : config.siteUrl
  const image = ogImage ?? `${config.siteUrl}/og-default.jpg`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="BOB Talkies" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
