import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DouliaMed | Assistant Médical IA',
  description: 'Intelligence médicale exclusive pour le Docteur Charlotte Eposse.',
  icons: {
    icon: 'https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg',
    apple: 'https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg',
  },
  openGraph: {
    title: 'DouliaMed | Assistant Médical IA',
    description: 'Intelligence médicale exclusive pour le Docteur Charlotte Eposse.',
    images: ['https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DouliaMed | Assistant Médical IA',
    description: 'Intelligence médicale exclusive pour le Docteur Charlotte Eposse.',
    images: ['https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg'],
  },
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
