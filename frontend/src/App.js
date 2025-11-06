import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/Layout/AppHeader';
import AppSider from './components/Layout/AppSider';
import SearchPage from './pages/SearchPage';
import DetailPage from './pages/DetailPage';
import ComparePage from './pages/ComparePage';
import CrawlerPage from './pages/CrawlerPage';
import AIModelPage from './pages/AIModelPage';
import TutorialPage from './pages/TutorialPage';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <AppSider />
          <Layout style={{ padding: '24px' }}>
            <Content
              style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280,
                borderRadius: 8,
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/search" replace />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/detail/:id" element={<DetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/crawler" element={<CrawlerPage />} />
                <Route path="/ai-model" element={<AIModelPage />} />
                <Route path="/tutorial" element={<TutorialPage />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;

