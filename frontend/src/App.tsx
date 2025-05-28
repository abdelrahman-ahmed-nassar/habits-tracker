import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import Weekly from "./pages/Weekly";
import Monthly from "./pages/Monthly";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            {/* Add other routes here as we create them */}
            <Route path="daily" element={<Daily />} />
            <Route path="daily/:date" element={<Daily />} />
            <Route path="weekly" element={<Weekly />} />
            <Route path="weekly/:date" element={<Weekly />} />
            <Route path="monthly" element={<Monthly />} />
            <Route path="monthly/:year/:month" element={<Monthly />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="analytics/overview" element={<Analytics />} />
            <Route path="analytics/:habitId" element={<Analytics />} />
            <Route path="notes" element={<div>Notes</div>} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg"
      />
    </>
  );
}

export default App;
