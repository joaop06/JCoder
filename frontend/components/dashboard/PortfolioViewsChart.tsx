'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DashboardService } from '@/services/administration-by-user/dashboard.service';
import {
  PortfolioEngagementStatsDto,
  DateRangeType,
} from '@/types/api/dashboard';

interface PortfolioViewsChartProps {
  username: string;
}

const rangeOptions = [
  { value: DateRangeType.DAY, label: 'Day' },
  { value: DateRangeType.WEEK, label: 'Week' },
  { value: DateRangeType.MONTH, label: 'Month' },
  { value: DateRangeType.YEAR, label: 'Year' },
] as const;

export default function PortfolioViewsChart({
  username,
}: PortfolioViewsChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PortfolioEngagementStatsDto | null>(null);
  const [rangeType, setRangeType] = useState<DateRangeType>(DateRangeType.MONTH);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await DashboardService.getPortfolioEngagementStats(
          username,
          rangeType,
        );
        setStats(data);
      } catch (err: any) {
        console.error('Error loading portfolio engagement stats:', err);
        setError('Failed to load portfolio views data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadStats();
    }
  }, [username, rangeType]);

  // Formatar dados para o gráfico
  const chartData = useMemo(() => {
    if (!stats?.dailyStats) return [];

    return stats.dailyStats.map((item) => {
      const date = new Date(item.date);
      let label = '';

      switch (rangeType) {
        case DateRangeType.DAY:
          label = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
          break;
        case DateRangeType.WEEK:
          label = date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
          });
          break;
        case DateRangeType.MONTH:
          label = date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
          });
          break;
        case DateRangeType.YEAR:
          label = date.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
          });
          break;
        default:
          label = date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
          });
      }

      return {
        date: item.date,
        label,
        views: item.views,
        uniqueVisitors: item.uniqueVisitors,
      };
    });
  }, [stats, rangeType]);

  // Função estável para formatar legendas
  const formatLegend = useCallback((value: string) => {
    return value === 'views' ? 'Views' : 'Unique Visitors';
  }, []);

  // Função estável para formatar tooltip
  const formatTooltip = useCallback((value: number, name: string) => {
    return [
      value.toLocaleString('en-US'),
      name === 'views' ? 'Views' : 'Unique Visitors',
    ];
  }, []);

  if (loading) {
    return (
      <div className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl shadow-jcoder-primary/10">
        <div className="h-64 sm:h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jcoder-primary mx-auto mb-4"></div>
            <p className="text-jcoder-muted">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl shadow-jcoder-primary/10">
        <div className="h-64 sm:h-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setRangeType(DateRangeType.MONTH);
                setError(null);
              }}
              className="px-4 py-2 bg-jcoder-primary text-black font-semibold rounded-lg hover:bg-jcoder-accent transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl shadow-jcoder-primary/10">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-1 sm:mb-2">
            Portfolio Views
          </h3>
          <p className="text-xs sm:text-sm text-jcoder-muted">
            Views and unique visitors visualization
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-jcoder-muted whitespace-nowrap">
            Period:
          </span>
          <div className="flex gap-1 sm:gap-2 bg-jcoder-secondary/50 rounded-lg p-1">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRangeType(option.value)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded transition-all duration-200 ${
                  rangeType === option.value
                    ? 'bg-jcoder-gradient text-black shadow-md'
                    : 'text-jcoder-muted hover:text-jcoder-foreground hover:bg-jcoder-secondary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-jcoder-secondary/30 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-jcoder-muted mb-1">Total Views</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground">
              {stats.totalViews.toLocaleString('en-US')}
            </p>
          </div>
          <div className="bg-jcoder-secondary/30 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-jcoder-muted mb-1">Unique Visitors</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-primary">
              {stats.uniqueVisitors.toLocaleString('en-US')}
            </p>
          </div>
          <div className="bg-jcoder-secondary/30 rounded-lg p-3 sm:p-4 col-span-2 sm:col-span-1">
            <p className="text-xs sm:text-sm text-jcoder-muted mb-1">Owner Views</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-muted">
              {stats.ownerViews.toLocaleString('en-US')}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="w-full h-64 sm:h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#80808020"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="#80808060"
                fontSize={12}
                tick={{ fill: '#80808080' }}
                angle={rangeType === DateRangeType.YEAR ? 0 : -45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#80808060"
                fontSize={12}
                tick={{ fill: '#80808080' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#00c8ff' }}
                formatter={formatTooltip}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={formatLegend}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#00c8ff"
                strokeWidth={2}
                dot={{ fill: '#00c8ff', r: 4 }}
                activeDot={{ r: 6 }}
                name="views"
              />
              <Line
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="#00a0ff"
                strokeWidth={2}
                dot={{ fill: '#00a0ff', r: 4 }}
                activeDot={{ r: 6 }}
                name="uniqueVisitors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 sm:h-80 flex items-center justify-center">
          <div className="text-center">
            <p className="text-jcoder-muted text-sm sm:text-base">
              No data available for the selected period
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

