import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import HomePage from './pages/Home/HomePage';
import CreateProjectPage from './pages/CreateProject/CreateProjectPage';
import CreateProjectProfilePage from './pages/CreateProjectProfile/CreateProjectProfilePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PersonalInfoPage from './pages/PersonalInfo/PersonalInfoPage';
import HomeThemePage from './pages/HomeTheme/HomeThemePage';
import BootShutDownPage from './pages/BootShutDown/BootShutDownPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/createProject" element={<CreateProjectPage />} />
          <Route path="/project/:id" element={<CreateProjectProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/personalinfo" element={<PersonalInfoPage />} />
          <Route path="/:id/hometheme" element={<HomeThemePage />} />
          <Route path="/bootshutdown" element={<BootShutDownPage />} />
          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
