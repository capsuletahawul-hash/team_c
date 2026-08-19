import React from 'react';
import SkeletonLoader, { SkeletonLoaderProps } from './SkeletonLoader';

interface DashboardSkeletonProps extends SkeletonLoaderProps {
  variant?: 'admin' | 'simple';
  statCards?: number;
  sidebarRows?: number;
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ dir = 'rtl' }) => (
  <SkeletonLoader variant="dashboard" dir={dir} />
);

export default DashboardSkeleton;
