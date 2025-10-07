import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ApplicationDetail } from './pages/ApplicationDetail';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/application/:id" element={<ApplicationDetail />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute adminOnly>
                      <AdminDashboard />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;
