import "./globals.css";

export const metadata = {
  title: "Undangan Pernikahan",
  description: "Wedding Invitation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}