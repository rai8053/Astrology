import { Helmet } from 'react-helmet-async';
import { brand } from '@/config/brand';

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function SEO({ title, description, ogImage, noindex }: SEOProps) {
  const fullTitle = `${title} — ${brand.name}`;
  const desc = description || brand.meta.description;
  const image = ogImage || '/og.svg';
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={`https://${brand.domain}${window.location.pathname}`} />
      <link rel="canonical" href={`https://${brand.domain}${window.location.pathname}`} />
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
