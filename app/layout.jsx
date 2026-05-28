import { GoogleOAuthProvider } from '@react-oauth/google'
import ClientLayout from './ClientLayout'
import './globals.css'

export const metadata = {
  title: 'ScholarHub - Africa\'s Student Platform',
  description: 'Connect, learn, and earn coins with fellow African students',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId="513890880200-2v1en01v816i01g0sj2hvhc1vl4dn6um.apps.googleusercontent.com">
          <ClientLayout>
            {children}
          </ClientLayout>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
