import React, { useState, useEffect, useRef } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import TrendingBar from './TrendingBar';
import LeaderboardView from './LeaderboardView';
import TreeMapView from './TreeMapView';
import NewsSection from './NewsSection';
import BoostModal from './BoostModal';
import MobileActionModal from './MobileActionModal';
import { calculateScore, fetchTokens } from '../utils/api';

const Dashboard = ({ isMobile }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('leaderboard');
  const [selectedToken, setSelectedToken] = useState(null);
  const [lineTop, setLineTop] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);
  const [error, setError] = useState(null);

  const mainContentRef = useRef(null);

  const db = window.firebase?.db;

  const loadData = async () => {
    console.log('Refresh Data button clicked');
    try {
      setError(null);
      const tokenData = await fetchTokens();
      if (!tokenData || tokenData.length === 0) {
        setError('No tokens found');
        return;
      }

      let voteCounts = {};

      try {
        const votesSnap = await getDocs(collection(db, 'votes'));
        const twelveHoursAgo = new Date(
          Date.now() - 12 * 60 * 60 * 1000
        ).toISOString();

        votesSnap.forEach(doc => {
          const data = doc.data();
          if (data.createdAt > twelveHoursAgo) {
            voteCounts[data.tokenId] =
              (voteCounts[data.tokenId] || 0) + 1;
          }
        });
      } catch (err) {
        console.warn('Votes fetch failed', err);
      }

      let boostsData = {};
      try {
        const boostsSnap = await getDocs(collection(db, 'boosts'));
        boostsSnap.forEach(doc => {
          const data = doc.data();
          if (new Date(data.expiresAt) > new Date()) {
            if (
              !boostsData[data.tokenId] ||
              data.multiplier > boostsData[data.tokenId].multiplier
            ) {
              boostsData[data.tokenId] = data;
            }
          }
        });
      } catch (err) {
        console.warn('Boosts fetch failed', err);
      }

      const scored = calculateScore(
        tokenData,
        voteCounts,
        boostsData
      );

      setTokens(scored);
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load data');
    }
  };

  useEffect(() => {
    setSidebarVisible(!isMobile);
  }, [isMobile]);

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

  // ✅ Scroll-following line effect
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current) return;
      const el = mainContentRef.current;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const maxTop = el.clientHeight - 50; // 50 = line height
      setLineTop((scrollTop / scrollHeight) * maxTop);
    };

    const el = mainContentRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>AI SCANNING SOLANA MEME TOKENS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p style={{ color: '#ff4d4d' }}>{error}</p>
        <button onClick={loadData} className="refresh" style={{ marginTop: '20px' }}>
          RETRY
        </button>
      </div>
    );
  }

  if (isMobile && sidebarVisible) {
    return (
      <div className="dashboard">
        <div className="sidebar mobile-full">
          <button onClick={() => setSidebarVisible(false)} className="sidebar-close">
            ×
          </button>
          <div className="ai-indicator">
            <div className="ai-pulse"></div>
            <span>AI POWERED ANALYSIS</span>
          </div>
          <NewsSection />
        </div>

        <MobileActionModal
          token={selectedToken}
          isOpen={!!selectedToken && isMobile}
          onClose={() => setSelectedToken(null)}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Scroll line */}
      <div
        className="scroll-line"
        style={{ top: `${lineTop}px` }}
      />

      <div className="main-content" ref={mainContentRef}>
        <TrendingBar tokens={tokens} />

        <div className="controls">
          <div className="view-tabs">
            <button
              className={viewMode === 'leaderboard' ? 'active' : ''}
              onClick={() => setViewMode('leaderboard')}
            >
              LEADERBOARD
            </button>
            <button
              className={viewMode === 'treemap' ? 'active' : ''}
              onClick={() => setViewMode('treemap')}
            >
              TREEMAP
            </button>
          </div>

          <div className="control-buttons">
            {isMobile && (
              <button onClick={() => setSidebarVisible(true)} className="sidebar-toggle">
                SHOW SIDEBAR
              </button>
            )}
            <button onClick={loadData} className="refresh">
              REFRESH DATA
            </button>
          </div>
        </div>

        {viewMode === 'leaderboard' && (
          <LeaderboardView
            tokens={tokens}
            isMobile={isMobile}
            onItemClick={setSelectedToken}
          />
        )}

        {viewMode === 'treemap' && (
          <TreeMapView tokens={tokens} isMobile={isMobile} />
        )}
      </div>

      {!isMobile && sidebarVisible && (
        <div className="sidebar">
          <div className="ai-indicator">
            <div className="ai-pulse"></div>
            <span>AI POWERED ANALYSIS</span>
          </div>
          <NewsSection />
        </div>
      )}

      <BoostModal
        token={selectedToken}
        isOpen={!!selectedToken && !isMobile}
        onClose={() => setSelectedToken(null)}
      />

      <MobileActionModal
        token={selectedToken}
        isOpen={!!selectedToken && isMobile}
        onClose={() => setSelectedToken(null)}
      />
    </div>
  );
};

const onVote = (token) => {
  // Placeholder for vote functionality
  console.log('Vote for', token.symbol);
};

const onBoost = (token) => {
  // Placeholder for boost functionality
  console.log('Boost for', token.symbol);
};

export default Dashboard;
