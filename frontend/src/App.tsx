import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home.tsx';
import Login from './components/Login.tsx';
import ArtistsList from './components/ArtistsList.tsx';
import InvestmentPage from './components/InvestmentPage.tsx';
import Wallet from './components/wallet.tsx';
import Register from './components/register.tsx';
import Transactions from './components/Transactions.tsx';
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/artists" element={<ArtistsList />} />
      <Route path="/invest/:projectId" element={<InvestmentPage />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/transactions" element={<Transactions />} />
    </Routes>
  </Router>
);

export default App;
