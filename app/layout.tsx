export const metadata = { title: 'Aplikasi Absensi' };
import '../styles/globals.css';
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div className="container">
          <h1>📋 Aplikasi Absensi</h1>
          {children}
          <footer className="hint">Made with ❤️ + Next.js + Firebase</footer>
        </div>
      </body>
    </html>
  );
}
