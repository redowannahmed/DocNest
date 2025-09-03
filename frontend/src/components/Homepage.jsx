import { Link } from "react-router-dom"
import "../css/Homepage.css"

const Homepage = () => {
  return (
    <div className="homepage">
      {/* Header Section */}
      <header className="main-header">
        <div className="container">
          <nav className="main-nav">
            <Link to="/" className="logo">
              <div className="logo-icon">+</div>
              <span>DocNest</span>
            </Link>
            <div className="nav-links">
              <Link to="#">Features</Link>
              <Link to="#">Security</Link>
              <Link to="/signin" className="sign-in-link">Sign In</Link>
              <Link to="/signup" className="cta-button nav-button">
                Get Started
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="hero">
          <div className="container" style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: '100%'}}>
            
            <div className="hero-content">
              <h1>Your Health Records, <br/><span className="gradient-text">Unified & Secure.</span></h1>
              <p>
                The effortless, modern way to manage, share, and control your medical records. Welcome to the future of healthcare management.
              </p>
              <Link to="/signup" className="cta-button hero-button">Create Your Free Account</Link>
            </div>
            
            <div className="hero-illustration">
              <svg viewBox="0 0 502 502" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="svgTitle">
                <title id="svgTitle">An abstract illustration of secure, layered digital documents.</title>
                <circle cx="251" cy="251" r="251" fill="url(#paint0_linear_404_13)"/>
                <g opacity="0.8" filter="url(#filter0_f_404_13)">
                  <circle cx="251" cy="251" r="151" fill="url(#paint1_linear_404_13)"/>
                </g>
                <rect x="100" y="176" width="302" height="184" rx="24" fill="rgba(255, 255, 255, 0.5)" style={{backdropFilter: 'blur(5px)'}}/>
                <rect x="100" y="176" width="302" height="184" rx="24" stroke="white" strokeOpacity="0.7"/>
                <path d="M239 252H265" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round"/>
                <path d="M252 265V239" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round"/>
                <rect x="132" y="304" width="238" height="8" rx="4" fill="#E2E8F0"/>
                <rect x="132" y="280" width="180" height="8" rx="4" fill="#E2E8F0"/>
                <g filter="url(#filter1_d_404_13)">
                  <rect x="290" y="200" width="48" height="48" rx="12" fill="white"/>
                  <path d="M310 226V220C310 217.791 311.791 216 314 216C316.209 216 318 217.791 318 220V226C319.105 226 320 226.895 320 228V234C320 235.105 319.105 236 318 236H306C304.895 236 304 235.105 304 234V228C304 226.895 304.895 226 306 226H310ZM316 226H312V220C312 218.895 312.895 218 314 218C315.105 218 316 218.895 316 220V226Z" fill="#A0AEC0"/>
                </g>
                <defs>
                  <filter id="filter0_f_404_13" x="0" y="0" width="502" height="502" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                    <feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur_404_13"/>
                  </filter>
                  <filter id="filter1_d_404_13" x="282" y="196" width="64" height="64" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feOffset dy="4"/>
                    <feGaussianBlur stdDeviation="4"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.101961 0 0 0 0 0.231373 0 0 0 0.05 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_404_13"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_404_13" result="shape"/>
                  </filter>
                  <linearGradient id="paint0_linear_404_13" x1="-4.33215e-06" y1="251" x2="502" y2="251" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F0F3FF"/>
                    <stop offset="1" stopColor="#E2E8FF"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_404_13" x1="100" y1="251" x2="402" y2="251" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4A55FF"/>
                    <stop offset="1" stopColor="#00F5D4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}

export default Homepage