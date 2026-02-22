import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Diagnosis from './pages/Diagnosis';
import History from './pages/History';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import ForensicClinical from './pages/ForensicClinical';
import ForensicPathology from './pages/ForensicPathology';
import ForensicToxicology from './pages/ForensicToxicology';
import ForensicPsychiatry from './pages/ForensicPsychiatry';
import ForensicEvidence from './pages/ForensicEvidence';
import ExpertConsult from './pages/ExpertConsult';
import Profile from './pages/Profile';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clinical" element={<ForensicClinical />} />
        <Route path="pathology" element={<ForensicPathology />} />
        <Route path="toxicology" element={<ForensicToxicology />} />
        <Route path="psychiatry" element={<ForensicPsychiatry />} />
        <Route path="evidence" element={<ForensicEvidence />} />
        <Route path="expert" element={<ExpertConsult />} />
        <Route path="profile" element={<Profile />} />
        <Route path="diagnosis" element={<Diagnosis />} />
        <Route path="history" element={<History />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
};

export default App;
