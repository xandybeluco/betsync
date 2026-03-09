import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import BetRegistration from './pages/BetRegistration';
import Operations from './pages/Operations';
import ArbitrageCalculator from './pages/ArbitrageCalculator';
import ExchangeCalculator from './pages/ExchangeCalculator';
import OddsBoostCalculator from './pages/OddsBoostCalculator';
import Bookmakers from './pages/Bookmakers';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/bet-registration" element={<BetRegistration />} />
                  <Route path="/operations" element={<Operations />} />
                  <Route path="/arbitrage-calculator" element={<ArbitrageCalculator />} />
                  <Route path="/exchange-calculator" element={<ExchangeCalculator />} />
                  <Route path="/odds-boost-calculator" element={<OddsBoostCalculator />} />
                  <Route path="/bookmakers" element={<Bookmakers />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
