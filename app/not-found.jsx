import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <Link 
          href="/" 
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
