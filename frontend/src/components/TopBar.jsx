import { useState, useEffect } from "react"
import "../css/TopBar.css"

export default function TopBar({ user }) {
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide topbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true)
      } else if (currentScrollY < lastScrollY) {
        setIsHidden(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    // Check for image modals or dialogs that should hide the topbar
    const checkForModals = () => {
      const modals = document.querySelectorAll('.image-modal-overlay, .dialog-overlay, .modal-overlay')
      const hasVisibleModal = Array.from(modals).some(modal => 
        window.getComputedStyle(modal).display !== 'none'
      )
      setIsHidden(hasVisibleModal)
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Add mutation observer to detect modal changes
    const observer = new MutationObserver(checkForModals)
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['class', 'style'] 
    })
    
    // Initial check
    checkForModals()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [lastScrollY])

  return (
    <header className={`top-bar ${isHidden ? 'hidden' : ''}`}>
      <div className="top-bar-content">
        <div className="logo-section">
          <div className="logo">
            <span className="logo-text">Doc</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-slate-300 mx-4"></div>
          <div className="hidden md:block text-sm text-slate-600 font-medium">{user?.role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}</div>
        </div>

        <div className="center-section">
          <div className="greeting">Good evening, {user?.name || "Patient"}</div>
        </div>

        <div className="actions-section">
          <button className="icon-button notification-button">
            <i className="fa fa-bell"></i>
            <span className="notification-dot"></span>
          </button>
          <button className="icon-button">
            <i className="fa fa-cog"></i>
          </button>
          <div className="user-avatar">
            <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
