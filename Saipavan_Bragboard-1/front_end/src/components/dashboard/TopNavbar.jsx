import React from 'react';

function TopNavbar() {
  return (
    <header className="top-navbar">
      <div className="flex justify-end items-center">
        {/* Search, Notifications, and Profile Avatar can go here */}
        <p className="font-semibold">Welcome, User!</p>
      </div>
    </header>
  );
}

export default TopNavbar;