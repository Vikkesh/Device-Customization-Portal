import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import HomePage from './pages/Home/HomePage';
import CreateProjectPage from './pages/CreateProject/CreateProjectPage';
import CreateProjectProfilePage from './pages/CreateProjectProfile/CreateProjectProfilePage';
import ProjectProfilePage from './pages/ProjectProfile/ProjectProfilePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PersonalInfoPage from './pages/PersonalInfo/PersonalInfoPage';
import HomeThemePage from './pages/HomeTheme/HomeThemePage';
import BootShutDownPage from './pages/BootShutDown/BootShutDownPage';
import AppsPage from './pages/Apps/AppsPage';
import Header from './components/Header/Header';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAuthenticated = localStorage.getItem('token');

  return (
    <div className="App">
      {!isAuthPage && isAuthenticated && <Header />}
      <div className={!isAuthPage && isAuthenticated ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/createProject" element={<CreateProjectPage />} />
          <Route path="/project/:id" element={<CreateProjectProfilePage />} />
          <Route path="/:project_id/projectprofile" element={<ProjectProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/personalinfo" element={<PersonalInfoPage />} />
          <Route path="/:project_id/hometheme" element={<HomeThemePage />} />
          <Route path="/:project_id/bootshutdown" element={<BootShutDownPage />} />
          <Route path="/:project_id/apps" element={<AppsPage />} />
          {/* Add other routes here */}
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
