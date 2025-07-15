import { Link } from "react-router-dom"
import "../css/Homepage.css"

const Homepage = () => {
  return (
    <div className="homepage">
      {/* Header Section */}
      <header className="header">
        <div className="container">
          <div className="logo-box">
            <div className="logo custom-logo">
              <svg className="logo-svg" width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="40" height="40" rx="12" fill="url(#docnest-gradient)" stroke="#667eea" strokeWidth="2.5"/>
                <path d="M18 26c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8-8-3.582-8-8z" fill="#fff" stroke="#feca57" strokeWidth="2"/>
                <path d="M26 22v8M22 26h8" stroke="#667eea" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="docnest-gradient" x1="6" y1="6" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#667eea"/>
                    <stop offset="1" stopColor="#feca57"/>
                  </linearGradient>
                </defs>
              </svg>
              <h1 className="logo-text">Doc</h1>
            </div>
          </div>
          <nav className="nav-buttons">
            <Link to="/signin" className="nav-link">
              Sign In
            </Link>
            <Link to="/signup" className="nav-link signup-link">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h2 className="hero-title">
                Your Health Records,
                <span className="highlight"> Simplified</span>
              </h2>
              <p className="hero-description">
                Empowering patients and doctors to manage, share, and access medical records securely and easily.
              </p>
              <p className="hero-tagline">Experience the future of digital healthcare management</p>
              <div className="cta-buttons">
                <Link to="/signup" className="btn btn-primary">
                  <i className="fas fa-user-plus"></i>
                  Get Started
                </Link>
                <Link to="/signin" className="btn btn-secondary">
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </Link>
              </div>
            </div>
            <div className="hero-illustration">
              <div className="illustration-container">
                <div className="medical-card">
                  <div className="card-header">
                    <div className="user-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="user-info">
                      <div className="user-name"></div>
                      <div className="user-id"></div>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="health-metric">
                      <i className="fas fa-heartbeat"></i>
                    </div>
                    <div className="health-metric">
                      <i className="fas fa-thermometer-half"></i>
                    </div>
                    <div className="health-metric">
                      <i className="fas fa-weight"></i>
                    </div>
                  </div>
                </div>
                <div className="floating-icons">
                  <div className="floating-icon icon-1">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="floating-icon icon-2">
                    <i className="fas fa-cloud"></i>
                  </div>
                  <div className="floating-icon icon-3">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h3>Secure & Private</h3>
              <p>Your medical data is encrypted and protected with industry-leading security standards.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-share-alt"></i>
              </div>
              <h3>Easy Sharing</h3>
              <p>Share your medical records with healthcare providers instantly and securely.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>Always Accessible</h3>
              <p>Access your health information anytime, anywhere, from any device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="logo-icon">
                <i className="fas fa-file-medical-alt"></i>
              </div>
              <span>DocNest</span>
            </div>
            <p className="footer-text">Revolutionizing healthcare record management for a better tomorrow.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Homepage
