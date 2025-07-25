// src/components/Page.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

interface PageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const Page: React.FC<PageProps> = ({ title, description, children }) => {
  const siteName = "Helivault Gate";
  const fullTitle = title ? `${title} – ${siteName}` : siteName;

  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/helios-icon.png" />
        <meta property="og:site_name" content={siteName} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/helios-icon.png" />
      </Helmet>
      {children}
    </>
  );
};

export default Page;
