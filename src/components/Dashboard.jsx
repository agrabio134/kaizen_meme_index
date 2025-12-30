import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import TrendingBar from './TrendingBar';
import LeaderboardView from './LeaderboardView';
import TreeMapView from './TreeMapView';
import NewsSection from './NewsSection';
import { calculateScore, fetchTokens } from '../utils/api';

const Dashboard = ({ isMobile }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('leaderboard');

  const db = window.firebase?.db;

  const loadData = async () => {
    try {
      const tokenData = await fetchTokens();
      if (tokenData.length === 0) return [];

      let voteCounts = {};
      try {
        const votesSnap = await getDocs(collection(db, 'votes'));
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        votesSnap.forEach(doc => {
          const data = doc.data();
          if (data.createdAt > twelveHoursAgo) {
            voteCounts[data.tokenId] = (voteCounts[data.tokenId] || 0) + 1;
          }
        });
      } catch (err) {}

      let boostsData = {};
      try {
        const boostsSnap = await getDocs(collection(db, 'boosts'));
        boostsSnap.forEach(doc => {
          const data = doc.data();
          if (new Date(data.expiresAt) > new Date()) {
            if (!boostsData[data.tokenId] || data.multiplier > boostsData[data.tokenId].multiplier) {
              boostsData[data.tokenId] = data;
            }
          }
        });
      } catch (err) {}

      const scored = calculateScore(tokenData, voteCounts, boostsData);
      setTokens(scored);
    } catch (err) {
      console.error('Load error:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();

    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>AI SCANNING SOLANA MEME TOKENS...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="main-content">
        <TrendingBar tokens={tokens} />

        <div className="controls">
          <div className="view-tabs">
            <button className={viewMode === 'leaderboard' ? 'active' : ''} onClick={() => setViewMode('leaderboard')}>
              LEADERBOARD
            </button>
            <button className={viewMode === 'treemap' ? 'active' : ''} onClick={() => setViewMode('treemap')}>
              TREEMAP
            </button>
          </div>
          <button onClick={loadData} className="refresh">
            REFRESH DATA
          </button>
        </div>

        {viewMode === 'leaderboard' && <LeaderboardView tokens={tokens} isMobile={isMobile} />}
        {viewMode === 'treemap' && <TreeMapView tokens={tokens} isMobile={isMobile} />}
      </div>

      <div className="sidebar">
        <div className="ai-indicator">
          <div className="ai-pulse"></div>
          <span>AI POWERED ANALYSIS</span>
        </div>
        <NewsSection />
      </div>
    </div>
  );
};

export default Dashboard;