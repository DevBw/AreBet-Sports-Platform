import React from 'react';

// Base skeleton component
export const Skeleton = ({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = 'rounded',
  animate = true 
}) => (
  <div 
    className={`bg-gray-700 ${rounded} ${animate ? 'skeleton' : ''} ${className}`}
    style={{ width, height }}
    role="status"
    aria-label="Loading..."
  />
);

// Match card skeleton
export const MatchCardSkeleton = ({ showDetails = true }) => (
  <div className="match-card-pro p-6 space-y-4">
    {/* League header */}
    <div className="flex items-center space-x-3">
      <Skeleton width="32px" height="32px" rounded="rounded-full" />
      <Skeleton width="150px" height="20px" />
    </div>
    
    {/* Match teams */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <Skeleton width="40px" height="40px" rounded="rounded-full" />
        <Skeleton width="100px" height="18px" />
      </div>
      
      <div className="flex items-center space-x-4 px-4">
        <Skeleton width="60px" height="24px" />
      </div>
      
      <div className="flex items-center space-x-3 flex-1 justify-end">
        <Skeleton width="100px" height="18px" />
        <Skeleton width="40px" height="40px" rounded="rounded-full" />
      </div>
    </div>
    
    {/* Match details */}
    {showDetails && (
      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
        <Skeleton width="80px" height="14px" />
        <Skeleton width="60px" height="14px" />
        <Skeleton width="90px" height="14px" />
      </div>
    )}
  </div>
);

// League section skeleton
export const LeagueSectionSkeleton = ({ matchCount = 4 }) => (
  <div className="space-y-4">
    {/* League header */}
    <div className="league-header-pro">
      <div className="flex items-center space-x-3">
        <Skeleton width="24px" height="24px" rounded="rounded" />
        <Skeleton width="200px" height="24px" />
        <Skeleton width="30px" height="20px" rounded="rounded-full" />
      </div>
    </div>
    
    {/* Match cards grid */}
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: matchCount }).map((_, index) => (
        <MatchCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
    {/* Hero section skeleton */}
    <div className="text-center space-y-4">
      <Skeleton width="400px" height="36px" className="mx-auto" />
      <Skeleton width="600px" height="20px" className="mx-auto" />
    </div>
    
    {/* Tab navigation skeleton */}
    <div className="flex flex-wrap gap-3 justify-center">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} width="120px" height="40px" rounded="rounded-lg" />
      ))}
    </div>
    
    {/* Content skeleton */}
    <div className="space-y-8">
      <LeagueSectionSkeleton matchCount={6} />
      <LeagueSectionSkeleton matchCount={4} />
      <LeagueSectionSkeleton matchCount={5} />
    </div>
  </div>
);

// Stats card skeleton
export const StatsCardSkeleton = () => (
  <div className="card-enhanced p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton width="120px" height="20px" />
      <Skeleton width="60px" height="32px" rounded="rounded-lg" />
    </div>
    <Skeleton width="80px" height="36px" />
    <div className="space-y-2">
      <Skeleton width="100%" height="4px" rounded="rounded-full" />
      <div className="flex justify-between">
        <Skeleton width="60px" height="14px" />
        <Skeleton width="40px" height="14px" />
      </div>
    </div>
  </div>
);

// Table row skeleton
export const TableRowSkeleton = () => (
  <tr className="border-b border-gray-700">
    <td className="py-3 px-4">
      <div className="flex items-center space-x-3">
        <Skeleton width="24px" height="24px" />
        <Skeleton width="32px" height="32px" rounded="rounded-full" />
        <Skeleton width="120px" height="16px" />
      </div>
    </td>
    {Array.from({ length: 6 }).map((_, index) => (
      <td key={index} className="py-3 px-4">
        <Skeleton width="40px" height="16px" className="mx-auto" />
      </td>
    ))}
  </tr>
);

// Search results skeleton
export const SearchResultsSkeleton = ({ count = 5 }) => (
  <div className="search-results-pro">
    <div className="search-results-header">
      <Skeleton width="200px" height="16px" />
    </div>
    
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="search-result-item">
        <div className="flex items-center space-x-3">
          <Skeleton width="32px" height="32px" rounded="rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton width="80%" height="16px" />
            <Skeleton width="60%" height="14px" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Text content skeleton
export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => {
      const width = index === lines - 1 ? '75%' : '100%';
      return (
        <Skeleton 
          key={index} 
          width={width} 
          height="16px" 
        />
      );
    })}
  </div>
);

// Navigation skeleton
export const NavigationSkeleton = () => (
  <div className="flex items-center space-x-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton 
        key={index} 
        width="100px" 
        height="40px" 
        rounded="rounded-lg" 
      />
    ))}
  </div>
);

// Image skeleton
export const ImageSkeleton = ({ 
  width = '100%', 
  height = '200px', 
  rounded = 'rounded-lg',
  className = ''
}) => (
  <div 
    className={`bg-gray-700 skeleton ${rounded} ${className} flex items-center justify-center`}
    style={{ width, height }}
  >
    <svg 
      className="w-8 h-8 text-gray-500" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
      />
    </svg>
  </div>
);

export default {
  Skeleton,
  MatchCardSkeleton,
  LeagueSectionSkeleton,
  DashboardSkeleton,
  StatsCardSkeleton,
  TableRowSkeleton,
  SearchResultsSkeleton,
  TextSkeleton,
  NavigationSkeleton,
  ImageSkeleton
};