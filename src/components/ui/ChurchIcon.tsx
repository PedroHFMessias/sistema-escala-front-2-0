import React from 'react';

interface ChurchIconProps {
  size?: number;
  color?: string;
}

export const ChurchIcon: React.FC<ChurchIconProps> = ({ size = 20, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Torre principal */}
    <rect x="9" y="4" width="6" height="16" stroke={color} strokeWidth="1.5" fill="none"/>
    
    {/* Torres laterais */}
    <rect x="5" y="8" width="4" height="12" stroke={color} strokeWidth="1.5" fill="none"/>
    <rect x="15" y="8" width="4" height="12" stroke={color} strokeWidth="1.5" fill="none"/>
    
    {/* Cruz no topo */}
    <line x1="12" y1="2" x2="12" y2="6" stroke={color} strokeWidth="1.5"/>
    <line x1="10" y1="3" x2="14" y2="3" stroke={color} strokeWidth="1.5"/>
    
    {/* Porta principal */}
    <rect x="10.5" y="15" width="3" height="5" stroke={color} strokeWidth="1.5" fill="none"/>
    
    {/* Janelas */}
    <rect x="11" y="10" width="2" height="2" stroke={color} strokeWidth="1" fill="none"/>
    <circle cx="12" cy="7" r="1" stroke={color} strokeWidth="1" fill="none"/>
    
    {/* Janelas laterais */}
    <rect x="6" y="12" width="1.5" height="2" stroke={color} strokeWidth="1" fill="none"/>
    <rect x="16.5" y="12" width="1.5" height="2" stroke={color} strokeWidth="1" fill="none"/>
    
    {/* Base */}
    <line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth="1.5"/>
  </svg>
);