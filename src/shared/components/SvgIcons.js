// ===============================================
// SVG ICONS COMPONENT LIBRARY
// Modern, consistent icons for AreBet application
// ===============================================

import React from 'react';

// Base icon wrapper with consistent sizing and styling
const IconWrapper = ({ children, size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block ${className}`}
    {...props}
  >
    {children}
  </svg>
);

// Match/Sports Icons
export const SoccerIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12a14.5 14.5 0 0 1 20 0 14.5 14.5 0 0 1-20 0"/>
  </IconWrapper>
);

export const GoalIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M3 3v18h18V3"/>
    <path d="M8 12h8"/>
    <path d="M12 8v8"/>
    <circle cx="12" cy="12" r="2"/>
  </IconWrapper>
);

export const CardIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21l4-7 4 7"/>
  </IconWrapper>
);

export const SubstitutionIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M16 3h5v5"/>
    <path d="M8 21H3v-5"/>
    <path d="M21 3l-7.5 7.5"/>
    <path d="M3 21l7.5-7.5"/>
  </IconWrapper>
);

export const ClockIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </IconWrapper>
);

// Navigation Icons
export const LiveIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6"/>
    <path d="M1 12h6m6 0h6"/>
  </IconWrapper>
);

export const MatchesIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M7 8h10"/>
    <path d="M7 12h10"/>
    <path d="M7 16h6"/>
  </IconWrapper>
);

export const LeaguesIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
    <path d="M11 3L8 9l4 13 4-13-3-6"/>
  </IconWrapper>
);

export const InsightsIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M3 3v18h18"/>
    <path d="M7 16l4-4 4 4 6-6"/>
    <circle cx="7" cy="16" r="1"/>
    <circle cx="11" cy="12" r="1"/>
    <circle cx="15" cy="16" r="1"/>
    <circle cx="21" cy="10" r="1"/>
  </IconWrapper>
);

export const StatsIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="11" width="4" height="10"/>
    <rect x="10" y="7" width="4" height="14"/>
    <rect x="17" y="3" width="4" height="18"/>
  </IconWrapper>
);

// UI Icons
export const NotificationIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </IconWrapper>
);

export const UserIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </IconWrapper>
);

export const SettingsIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6"/>
    <path d="M21 12h-6m-6 0H3"/>
  </IconWrapper>
);

export const CloseIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 6L6 18"/>
    <path d="M6 6l12 12"/>
  </IconWrapper>
);

export const CheckIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M20 6L9 17l-5-5"/>
  </IconWrapper>
);

export const AlertIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4"/>
    <path d="M12 16h.01"/>
  </IconWrapper>
);

export const InfoIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </IconWrapper>
);

export const ArrowUpIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 19V5"/>
    <path d="M5 12l7-7 7 7"/>
  </IconWrapper>
);

export const ArrowDownIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 5v14"/>
    <path d="M19 12l-7 7-7-7"/>
  </IconWrapper>
);

export const FilterIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
  </IconWrapper>
);

export const SearchIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </IconWrapper>
);

// Premium/Subscription Icons
export const CrownIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M2 18h20l-2-12-3 7-5-7-5 7-3-7-2 12z"/>
    <path d="M6 18v4h12v-4"/>
  </IconWrapper>
);

export const StarIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </IconWrapper>
);

export const DiamondIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M6 3h12l4 6-10 13L2 9l4-6z"/>
  </IconWrapper>
);

// Match Status Icons
export const PlayIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M8 5v14l11-7z"/>
  </IconWrapper>
);

export const PauseIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </IconWrapper>
);

export const StopIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="5" y="5" width="14" height="14" rx="2"/>
  </IconWrapper>
);

// Prediction Icons
export const TargetIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </IconWrapper>
);

export const TrendUpIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M22 7l-8.5 8.5-5-5L2 17"/>
    <path d="M16 7h6v6"/>
  </IconWrapper>
);

export const TrendDownIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M22 17l-8.5-8.5-5 5L2 7"/>
    <path d="M16 17h6v-6"/>
  </IconWrapper>
);

// Export all icons as a collection for easy importing
export const Icons = {
  Soccer: SoccerIcon,
  Goal: GoalIcon,
  Card: CardIcon,
  Substitution: SubstitutionIcon,
  Clock: ClockIcon,
  Live: LiveIcon,
  Matches: MatchesIcon,
  Leagues: LeaguesIcon,
  Insights: InsightsIcon,
  Stats: StatsIcon,
  Notification: NotificationIcon,
  User: UserIcon,
  Settings: SettingsIcon,
  Close: CloseIcon,
  Check: CheckIcon,
  Alert: AlertIcon,
  Info: InfoIcon,
  ArrowUp: ArrowUpIcon,
  ArrowDown: ArrowDownIcon,
  Filter: FilterIcon,
  Search: SearchIcon,
  Crown: CrownIcon,
  Star: StarIcon,
  Diamond: DiamondIcon,
  Play: PlayIcon,
  Pause: PauseIcon,
  Stop: StopIcon,
  Target: TargetIcon,
  TrendUp: TrendUpIcon,
  TrendDown: TrendDownIcon
};

export default Icons;