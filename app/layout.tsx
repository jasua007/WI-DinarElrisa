import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wi-dinar-elrisa.vercel.app"),
  title: "The Wedding of Elrisa & Dinar",
  description: "Undangan Pernikahan Dinar Suherlan & Elrisa Salsabilla",
  icons: {
    icon: "/assets/icon.svg",
    shortcut: "/assets/icon.svg",
    apple: "/assets/icon.svg",
  },
  openGraph: {
    title: "The Wedding of Elrisa & Dinar",
    description: "Undangan Pernikahan Dinar Suherlan & Elrisa Salsabilla",
    url: "https://wi-dinar-elrisa.vercel.app",
    siteName: "The Wedding of Elrisa & Dinar",
    images: [
      {
        url: "/assets/2.png",
        width: 1200,
        height: 630,
        alt: "The Wedding of Elrisa & Dinar",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Wedding of Elrisa & Dinar",
    description: "Undangan Pernikahan Dinar Suherlan & Elrisa Salsabilla",
    images: ["/assets/2.png"],
  },
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Beth+Ellen&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Pinyon+Script&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" href="/assets/Background.png" as="image" />
        <link rel="preload" href="/assets/backgroundchosecaharacter.png" as="image" />
        <link rel="preload" href="/assets/background3.png" as="image" />
        <link rel="preload" href="/assets/man-walk2.png" as="image" />
        <link rel="preload" href="/assets/woman-walk.png" as="image" />
        <link rel="preload" href="/assets/Flower.png" as="image" />
        <link rel="preload" href="/assets/cat.png" as="image" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}