import React from 'react';
import type { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="row">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="col-md-2 mb-3">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border spinner-border-sm text-muted"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Tourists',
      value: stats.total_tourists,
      icon: 'fas fa-users',
      color: 'primary'
    },
    {
      title: 'Active Tourists',
      value: stats.active_tourists,
      icon: 'fas fa-user-check',
      color: 'success'
    },
    {
      title: 'Active Alerts',
      value: stats.active_alerts,
      icon: 'fas fa-exclamation-triangle',
      color: 'warning'
    },
    {
      title: 'Critical Alerts',
      value: stats.critical_alerts,
      icon: 'fas fa-exclamation-circle',
      color: 'danger'
    },
    {
      title: 'Monitored Zones',
      value: stats.zones_count,
      icon: 'fas fa-map',
      color: 'info'
    },
    {
      title: 'Avg Safety Score',
      value: `${Math.round(stats.avg_safety_score)}%`,
      icon: 'fas fa-shield-alt',
      color: stats.avg_safety_score >= 80 ? 'success' : stats.avg_safety_score >= 60 ? 'warning' : 'danger'
    }
  ];

  return (
    <div className="row">
      {cards.map((card, index) => (
        <div key={index} className="col-md-2 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className={`text-${card.color} mb-2`}>
                <i className={`${card.icon}`} style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className={`text-${card.color} mb-1`}>{card.value}</h4>
              <p className="text-muted small mb-0">{card.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;