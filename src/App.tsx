import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/Home';
import { Communities } from './pages/Communities';
import { CommunityView } from './pages/CommunityView';
import { PostView } from './pages/PostView';
import { Profile } from './pages/Profile';
import { AuthProvider } from './components/ui/Header';
export function App() {
  return <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/:id" element={<CommunityView />} />
            <Route path="/posts/:id" element={<PostView />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>;
}