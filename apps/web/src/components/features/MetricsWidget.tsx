'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface MetricsWidgetProps {
  connectionId?: string;
  projectId?: string;
  metricType: string;
  label: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  comparison?: 'day' | 'week' | 'month' | 'year';
  icon?: React.ReactNode;
  color?: string;
}

interface MetricData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}

export default function MetricsWidget({
  connectionId,
  projectId,
  metricType,
  label,
  format = 'number',
  comparison = 'week',
  icon,
  color = '#3b82f6',
}: MetricsWidgetProps) {
  const [data, setData] = useState<MetricData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();

      // Calculate date ranges based on comparison
      let daysBack = 7;
      switch (comparison) {
        case 'day':
          daysBack = 1;
          break;
        case 'week':
          daysBack = 7;
          break;
        case 'month':
          daysBack = 30;
          break;
        case 'year':
          daysBack = 365;
          break;
      }

      startDate.setDate(startDate.getDate() - daysBack * 2);

      // Fetch metrics
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        metricTypes: metricType,
        ...(connectionId && { connectionId }),
        ...(projectId && { projectId }),
      });

      const response = await fetch(`/api/v1/analytics/metrics?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const metrics = await response.json();

      // Calculate current and previous period values
      const currentPeriodStart = new Date();
      currentPeriodStart.setDate(currentPeriodStart.getDate() - daysBack);

      const currentMetrics = metrics.filter((m: any) => new Date(m.date) >= currentPeriodStart);
      const previousMetrics = metrics.filter((m: any) => new Date(m.date) < currentPeriodStart);

      const current = currentMetrics.reduce((sum: number, m: any) => sum + m.value, 0);
      const previous = previousMetrics.reduce((sum: number, m: any) => sum + m.value, 0);

      const change = current - previous;
      const changePercent = previous > 0 ? (change / previous) * 100 : 0;

      let trend: 'up' | 'down' | 'neutral' = 'neutral';
      if (change > 0) {trend = 'up';}
      else if (change < 0) {trend = 'down';}

      setData({
        current,
        previous,
        change,
        changePercent,
        trend,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [connectionId, projectId, metricType, comparison]);

  const formatValue = (value: number): string => {
    switch (format) {
      case 'number':
        return new Intl.NumberFormat('de-DE').format(Math.round(value));
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }).format(value);
      case 'duration': {
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
      default:
        return value.toString();
    }
  };

  const getTrendIcon = () => {
    if (!data) {return null;}

    switch (data.trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!data) {return 'text-gray-500';}
    switch (data.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getComparisonLabel = () => {
    switch (comparison) {
      case 'day':
        return 'vs yesterday';
      case 'week':
        return 'vs last week';
      case 'month':
        return 'vs last month';
      case 'year':
        return 'vs last year';
      default:
        return 'vs previous period';
    }
  };

  if (error) {
    return (
      <div
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <div style={{ color: '#ef4444', fontSize: '14px' }}>Error: {error}</div>
        <button
          onClick={fetchMetrics}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
      }}
    >
      {/* Rainbow gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          opacity: 0.6,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon && (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#6b7280',
                marginBottom: '4px',
              }}
            >
              {label}
            </div>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          style={{
            padding: '6px',
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            opacity: loading ? 0.5 : 1,
          }}
          title="Refresh"
        >
          <RefreshCw
            size={16}
            style={{
              animation: loading ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </button>
      </div>

      {/* Value */}
      {loading && !data ? (
        <div
          style={{
            height: '48px',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ) : (
        <>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            {data ? formatValue(data.current) : '-'}
          </div>

          {/* Comparison */}
          {data && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background:
                    data.trend === 'up'
                      ? 'rgba(34, 197, 94, 0.1)'
                      : data.trend === 'down'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(156, 163, 175, 0.1)',
                }}
              >
                {getTrendIcon()}
                <span className={getTrendColor()} style={{ fontWeight: 600 }}>
                  {data.changePercent > 0 ? '+' : ''}
                  {data.changePercent.toFixed(1)}%
                </span>
              </div>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>{getComparisonLabel()}</span>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
