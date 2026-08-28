import { GoogleOAuthProvider } from '@react-oauth/google'
import ClientLayout from './ClientLayout'
import './globals.css'

export const metadata = {
  title: 'ScholarHub | Global Social Learning Network',
  description: 'Connect, learn, build projects, and earn coins with students and skill learners worldwide',
  icons: {
    icon: '/scholarhub-logo.svg',
    apple: '/scholarhub-logo.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://js.paystack.co/v1/inline.js" async />
        <script src="https://checkout.flutterwave.com/v3.js" async />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('darkMode') === 'true' || (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <GoogleOAuthProvider clientId="513890880200-6ndbr026fbjdesrn0j3lippsu2map8rg.apps.googleusercontent.com">
          <ClientLayout>
            {children}
          </ClientLayout>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
