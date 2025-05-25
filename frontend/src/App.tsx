import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Daily from "./pages/Daily";
import { ToastProvider } from "./contexts/ToastContext";
import Streaks from "./pages/Streaks";

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            {/* Add other routes here as we create them */}
            <Route path="daily" element={<Daily />} />
            <Route path="weekly" element={<div>Weekly View</div>} />
            <Route path="monthly" element={<div>Monthly View</div>} />
            <Route path="analytics" element={<div>Analytics</div>} />
            <Route path="streaks" element={<Streaks />} />
            <Route path="notes" element={<div>Notes</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
