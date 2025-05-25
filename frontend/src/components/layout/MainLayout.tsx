import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="w-screen min-h-screen bg-gray-50 dark:bg-gray-900 ">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16">
        <Header onMenuClick={toggleSidebar} />
      </div>

      {/* Sidebar overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed top-16 left-0 z-50 w-64 h-[calc(100vh-4rem)]">
            <Sidebar
              isMobile={isMobile}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Sidebar static for desktop */}
      {!isMobile && isSidebarOpen && (
        <div className="fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] lg:block hidden">
          <Sidebar isMobile={false} />
        </div>
      )}

      {/* Main content always full width, with left padding on desktop if sidebar is open, and top padding for header */}
      <main
        className={`transition-all duration-300 pt-16 ${
          !isMobile && isSidebarOpen ? "lg:pl-64" : ""
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
