import React from 'react'
import { NotificationBell } from './notification-bell'

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold tracking-wider hover:text-gray-300 transition-colors">
            Droply
          </a>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <a 
            href="/restaurant" 
            className="text-gray-300 hover:text-white font-medium transition-colors"
          >
            Restaurant
          </a>
          <a 
            href="/restaurant" 
            className="text-gray-300 hover:text-white font-medium transition-colors"
          >
            Browse Restaurants
          </a>
          <a 
            href="/" 
            className="text-gray-300 hover:text-white font-medium transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Actions Section */}
        <div className="flex items-center">
          <NotificationBell />
        </div>

      </div>
    </nav>
  )
}

export default Navbar