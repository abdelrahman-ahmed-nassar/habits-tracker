import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  showBreadcrumbs?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  isLoading = false,
  error = null,
  showBreadcrumbs = true,
}) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { path, label };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
        <div className="text-red-500 text-lg text-center">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <nav className="mb-4 overflow-x-auto">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 min-w-max">
            <li>
              <Link
                to="/"
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                Home
              </Link>
            </li>
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.path} className="flex items-center space-x-2">
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
                <Link
                  to={crumb.path}
                  className={`hover:text-gray-700 dark:hover:text-gray-300 ${
                    index === breadcrumbs.length - 1
                      ? "text-gray-900 dark:text-gray-100 font-medium"
                      : ""
                  }`}
                >
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Page Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
        {title}
      </h1>

      {/* Page Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
