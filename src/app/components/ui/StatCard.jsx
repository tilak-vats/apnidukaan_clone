import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
}) => {
  const colorMap = {
    primary: 'bg-indigo-50 text-indigo-700',
    secondary: 'bg-sky-50 text-sky-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700',
    accent: 'bg-orange-50 text-orange-700',
  };

  const trendColor = trend
    ? trend.direction === 'up'
      ? 'text-green-600'
      : trend.direction === 'down'
      ? 'text-red-600'
      : 'text-slate-600'
    : '';

  return (
    <div className="card p-6 animate-scale-in">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm ${trendColor}`}>
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;