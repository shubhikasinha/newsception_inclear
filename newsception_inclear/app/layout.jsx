import './globals.css';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export const metadata = {
  title: 'InClear - AI-Moderated Debates',
  description: 'Real-time AI-moderated debate platform with newspaper-style UI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

