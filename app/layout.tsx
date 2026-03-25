import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DouliaMed | Assistant Médical IA',
  description: 'Intelligence médicale exclusive pour le Docteur Charlotte Eposse.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
