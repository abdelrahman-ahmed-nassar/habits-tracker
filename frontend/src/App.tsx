import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import Weekly from "./pages/Weekly";
import Streaks from "./pages/Streaks";
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
            <Route path="monthly" element={<div>Monthly View</div>} />
            <Route path="analytics" element={<div>Analytics</div>} />
            <Route path="streaks" element={<Streaks />} />
            <Route path="notes" element={<div>Notes</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
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
