import { GoogleOAuthProvider } from "@react-oauth/google"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

function App({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Component {...pageProps} />
    </GoogleOAuthProvider>
  )
}

export default App
