import Layout from './components/Layout/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="text-center py-16">
          <h1 className="display-1 text-gray-900 mb-6">
            Welcome to <span className="text-purple-600">Skilldoo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            A comprehensive skill exchange platform where users can offer their expertise and request skills they want to learn.
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto mb-12">
            <h2 className="display-3 text-gray-800 mb-6">
              🎯 System Ready! User Authentication & Profile Management
            </h2>
            <div className="text-left space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-green-500 font-bold text-lg">✅</span>
                <span className="text-gray-700">User registration and login system</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 font-bold text-lg">✅</span>
                <span className="text-gray-700">JWT authentication with protected routes</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 font-bold text-lg">✅</span>
                <span className="text-gray-700">Profile management with skills system</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 font-bold text-lg">✅</span>
                <span className="text-gray-700">Skills tagging (offered/wanted) with colors</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 font-bold text-lg">✅</span>
                <span className="text-gray-700">Responsive forms with validation</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 font-bold text-lg">✅</span>
                <span className="text-gray-700">Authentication state management</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
              <h3 className="font-bold text-purple-900 mb-3 text-lg">Try It Out!</h3>
              <p className="text-purple-700 mb-4">
                Create an account and set up your profile with skills you can offer and want to learn.
              </p>
              <div className="space-y-3">
                <a
                  href="/register"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Sign Up Now
                </a>
                <a
                  href="/login"
                  className="block w-full bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-center py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Sign In
                </a>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <h3 className="font-bold text-green-900 mb-3 text-lg">What's Next?</h3>
              <p className="text-green-700 mb-4">
                Coming soon: user browsing, search functionality, and swap requests.
              </p>
              <div className="text-green-700 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Browse all users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Search by skills</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Send swap requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Request management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
