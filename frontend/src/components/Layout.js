function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="nav-container sticky top-0 z-50">
        {/* ... navbar innehåll ... */}
      </nav>
      <main className="page-container">
        {children}
      </main>
    </div>
  );
} 