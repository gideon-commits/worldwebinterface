import { useState, useEffect } from 'react'

function App() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [totalSignups, setTotalSignups] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://0.0.0.0:8000'

  // Fetch current signup count on component mount
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`)
      const data = await response.json()
      setTotalSignups(data.total_signups || 0)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setTotalSignups(0) // Start with 0 if API fails
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    // Client-side validation
    if (!email.trim()) {
      setIsSuccess(false)
      setMessage('Email is required')
      setIsLoading(false)
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setIsSuccess(false)
      setMessage('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), website: website.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setIsSuccess(true)
        setMessage(data.message)
        setTotalSignups(data.total_signups)
        setEmail('')
        setWebsite('')
        setTimeout(() => setShowForm(false), 2000) // Auto-close after success
      } else {
        setIsSuccess(false)
        setMessage(data.message)
        if (data.total_signups) {
          setTotalSignups(data.total_signups)
        }
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage('Unable to connect to server. Please try again later.')
      console.error('Network error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-900">Web Interface</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Websites Deserve <span className="text-blue-500">Fair Pay</span><br />
            for AI Training
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join the movement to protect your content and get paid when AI companies use it.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 focus:ring-4 focus:ring-blue-200 focus:outline-none"
              aria-label="Join the waitlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Join the Waitlist</span>
            </button>
            <button 
              className="border-2 border-blue-500 text-blue-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors focus:ring-4 focus:ring-blue-200 focus:outline-none"
              aria-label="Learn more about the movement"
            >
              Learn More
            </button>
          </div>

          {/* Stats Card */}
          <div className="flex justify-center mb-20">
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center max-w-md w-full">
              <div className="text-6xl font-bold text-blue-500 mb-4">{totalSignups}</div>
              <div className="text-xl text-gray-600 font-medium">Websites Joined</div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="text-center mb-32">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
              A simple three-step process to protect your content and earn fair compensation
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Publishers */}
              <div className="bg-blue-50 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Publishers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sign up, set your terms, and protect your content from unauthorized AI training use.
                </p>
              </div>

              {/* AI Companies */}
              <div className="bg-green-50 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Companies</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access licensed data legally through our unified platform and pay fair rates.
                </p>
              </div>

              {/* Everyone */}
              <div className="bg-purple-50 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Everyone</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build a fair web where creators are rewarded and innovation continues ethically.
                </p>
              </div>
            </div>
          </div>

          {/* Why Join the Movement Section */}
          <div className="bg-gray-100 py-20 -mx-6">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Join the Movement?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Stand up for content creators' rights and build a sustainable digital economy
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Stop Unauthorized Scraping */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Stop Unauthorized Scraping</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Protect your content from being used without permission. Set clear boundaries and enforce your rights.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Earn Revenue from AI Training */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Revenue from AI Training</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Get paid fairly when AI companies use your content for training. Turn your data into sustainable income.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Join a United Front */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Join a United Front</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Strength in numbers. Unite with thousands of publishers to negotiate better terms and fair treatment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content API Standard */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Content API Standard</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Push for industry-wide adoption of standardized, fair licensing through our unified Content API.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Union Message Section */}
          <div className="bg-gray-800 text-white py-20 -mx-6">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                This isn't just a tool — <span className="text-blue-400">it's a union</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                The more websites join, the stronger our voice becomes. Together, we can force AI companies to respect content ownership and build a fair digital economy.
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-green-400 font-semibold">Collective Bargaining Power</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-blue-400 font-semibold">Legal Protection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-purple-400 font-semibold">Fair Compensation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20 -mx-6">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="inline-flex items-center bg-blue-500 text-blue-100 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Limited Time
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Be part of the first <span className="text-yellow-300">1,000 sites</span><br />
                to unionize
              </h2>
              
              <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                Early members get priority access, better terms, and a voice in shaping the future of content licensing.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add My Website</span>
                </button>
                
                <div className="flex items-center text-blue-200 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Free to join • No commitments
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Join the Waitlist</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  aria-label="Email address"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>
              
              <div>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com (optional)"
                  aria-label="Website URL (optional)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 text-white px-8 py-4 text-xl font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Joining...' : 'Join the Movement'}
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div className={`mt-4 p-4 rounded-lg text-center font-semibold ${
                isSuccess 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
