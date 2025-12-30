// src/components/LeaderboardView.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSync } from '@fortawesome/free-solid-svg-icons';
import { searchTokens } from '../utils/api';

const LeaderboardView = ({ tokens, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // SAFE DEFAULT: If userVotes not passed, use empty Set
  // Remove userVotes from props since we don't need voting anymore
  // But keep the structure clean

  useEffect(() => {
    const go = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const r = await searchTokens(searchTerm);
      setSearchResults(r);
      setIsSearching(false);
    };
    go();
  }, [searchTerm]);

  const display = searchTerm.trim() && searchTerm.length >= 2 ? searchResults : tokens;

  return (
    <div className="leaderboard">
      <h2 className="gradient-heading mb-3 d-flex align-items-center gap-2">
        AI MEME INDEX LEADERBOARD
      </h2>

      {/* Search */}
      <div className="search-container position-relative mb-3">
        <input
          placeholder="Search ticker / name / CA..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input w-100"
        />
        {isSearching && <span className="search-loading"><FontAwesomeIcon icon={faSync} spin /> Scanning...</span>}
      </div>

      {/* List */}
      <div className="leaderboard-list">
        {display.slice(0, 50).map((t, i) => {
          // Safely check boost (no voting anymore)
          const hasBoost = t.boost && new Date(t.boost.expiresAt) > new Date();

          return (
            <div
              key={t.id}
              className={`leaderboard-item ${hasBoost ? 'golden' : ''} ${isMobile ? 'mobile-clickable' : ''}`}
            >
              {/* Rank */}
              <div className="item-rank">
                <span className="rank-number">#{i + 1}</span>
                {hasBoost && <span className="rank-boost">×{t.boost.multiplier}</span>}
              </div>

              {/* Token */}
              <div className="item-token">
                {t.logo && <img src={t.logo} alt={t.symbol} />}
                <div>
                  <div className="token-symbol">{t.symbol}</div>
                  <div className="token-name">{t.name}</div>
                </div>
              </div>

              {/* Score */}
              <div className="item-score">{t.memeScore.toFixed(1)}</div>

              {/* Stats */}
              <div className="item-stats">
                <span className={t.priceChange >= 0 ? 'positive' : 'negative'}>
                  {t.priceChange >= 0 ? '+' : ''}{t.priceChange.toFixed(2)}%
                </span>
                <span>${(t.volume24h / 1000).toFixed(0)}K vol</span>
              </div>

              {/* Votes */}
              <div className="item-votes">{t.votes || 0}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardView;