import useLang from "@/hooks/useLang";
import Head from "next/head";

export interface SeoData {
  title: string;
  description: string;
  url?: string;
  thumbnailUrl?: string;
}

export interface SeoProps {
  data: SeoData;
}

const Seo = ({ data }: SeoProps) => {
  const { title, description, url, thumbnailUrl } = data;
  const { locale } = useLang();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://resnow.renec.org";
  const thumbnail = thumbnailUrl || `${siteUrl}/thumbnail-${locale}.png`;

  return (
    <Head>
      {/* <!-- Primary Meta Tags --> */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* <!-- Open Graph / Facebook --> */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={thumbnail} />

      {/* <!-- Twitter --> */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={thumbnail} />
    </Head>
  );
};

export default Seo;
