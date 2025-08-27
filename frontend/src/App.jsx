import { useState, useEffect } from 'react'

function App() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [totalSignups, setTotalSignups] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '' 
    : 'http://0.0.0.0:8000'

  // Fetch current signup count on component mount
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`)
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
      const response = await fetch(`${API_BASE}/api/signup`, {
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

  const shareData = {
    title: "Websites Deserve Fair Pay for AI Training",
    text: "Join the movement to protect your content and get paid when AI companies use it. Stop AI theft - demand fair licensing!",
    url: window.location.href
  }

  const handleShare = (platform) => {
    const encodedTitle = encodeURIComponent(shareData.title)
    const encodedText = encodeURIComponent(shareData.text)
    const encodedUrl = encodeURIComponent(shareData.url)
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`
    }
    
    if (platform === 'native' && navigator.share) {
      navigator.share(shareData).catch(console.error)
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowShare(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
              aria-label="Share this page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Share</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Join Now
            </button>
          </div>
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
              onClick={() => setShowLearnMore(true)}
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

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Our Mission: Preserving Websites Through Fair AI</h2>
              <button
                onClick={() => setShowLearnMore(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-8">
              {/* RAG/CAG Section */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  RAG-Based Information Architecture
                </h3>
                <p className="text-blue-800 leading-relaxed mb-4">
                  The future of AI information dissemination relies on <strong>Retrieval-Augmented Generation (RAG)</strong> and <strong>Context-Aware Generation (CAG)</strong> systems. Instead of training models on scraped data, AI companies should:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-2">
                  <li><strong>Query licensed content APIs</strong> in real-time for accurate, up-to-date information</li>
                  <li><strong>Maintain source attribution</strong> and provide proper citations to original publishers</li>
                  <li><strong>Pay per query</strong> based on content usage, ensuring fair compensation</li>
                  <li><strong>Preserve content integrity</strong> by accessing original sources rather than derivative copies</li>
                </ul>
              </div>

              {/* Website Preservation Mission */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-green-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Preserving the Web Ecosystem
                </h3>
                <p className="text-green-800 leading-relaxed mb-4">
                  Our mission extends beyond fair compensation—we're preserving the fundamental structure of the internet:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-green-900 mb-2">🌐 Website Sustainability</h4>
                    <p className="text-green-800 text-sm">Ensuring publishers can maintain quality content through fair revenue streams</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-2">📚 Content Diversity</h4>
                    <p className="text-green-800 text-sm">Protecting niche and specialized knowledge sources from being devalued</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-2">🔗 Source Attribution</h4>
                    <p className="text-green-800 text-sm">Maintaining the connection between AI responses and original creators</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 mb-2">⚖️ Digital Rights</h4>
                    <p className="text-green-800 text-sm">Establishing legal precedents for content ownership in the AI era</p>
                  </div>
                </div>
              </div>

              {/* Technical Implementation */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  How It Works
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-bold text-purple-900">Publishers Set Terms</h4>
                      <p className="text-purple-800 text-sm">Define pricing, usage rights, and access permissions through our unified API</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-bold text-purple-900">AI Companies Query</h4>
                      <p className="text-purple-800 text-sm">Access content through licensed APIs with real-time attribution and payment</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-bold text-purple-900">Fair Compensation</h4>
                      <p className="text-purple-800 text-sm">Publishers receive payment based on actual usage, not one-time licensing fees</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center bg-gray-800 text-white rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-4">Join the Movement</h3>
                <p className="text-gray-300 mb-6">
                  Together, we can build a sustainable future where AI innovation coexists with content creator rights.
                </p>
                <button
                  onClick={() => {
                    setShowLearnMore(false);
                    setShowForm(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold transition-colors"
                >
                  Add My Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Share the Movement</h2>
              <button
                onClick={() => setShowShare(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 text-center">
              Help spread awareness about fair AI licensing and website preservation
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Twitter */}
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>Twitter</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>

              {/* Reddit */}
              <button
                onClick={() => handleShare('reddit')}
                className="flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
                <span>Reddit</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                onClick={() => handleShare('telegram')}
                className="flex items-center justify-center space-x-2 bg-blue-400 hover:bg-blue-500 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span>Telegram</span>
              </button>

              {/* Email */}
              <button
                onClick={() => handleShare('email')}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors col-span-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </button>

              {/* Native Share (Mobile) */}
              {navigator.share && (
                <button
                  onClick={() => handleShare('native')}
                  className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors col-span-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
