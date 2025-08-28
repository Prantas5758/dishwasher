export const metadata = {
  title: "Absensi Kerja",
  description: "Aplikasi absensi sederhana & profesional di Vercel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="/globals.css" rel="stylesheet" />
        {children}
      </body>
    </html>
  );
}
