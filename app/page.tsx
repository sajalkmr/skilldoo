import Layout from './components/Layout/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Skilldoo
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A comprehensive skill exchange platform where users can offer their expertise and request skills they want to learn.
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🎯 Project Setup Complete!
          </h2>
          <div className="text-left space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✅</span>
              <span>Next.js with TypeScript & Tailwind CSS</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✅</span>
              <span>Prisma ORM with SQLite database</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✅</span>
              <span>Database schema (Users, Skills, Swap Requests)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✅</span>
              <span>Project structure & components</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500 font-bold">✅</span>
              <span>TypeScript types & utilities</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-gray-600">
          <p>Ready to start Phase 2: User Authentication & Profile Backend</p>
        </div>
      </div>
    </Layout>
  )
}
