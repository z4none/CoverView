import React from 'react';

const IconRenderer = ({ icon, customIcon, className = '' }) => {
    if (customIcon) {
        return (
            <div className={className}>
                <img src={customIcon} alt="custom icon" className={`rounded-full bg-white border-white ${className}`} />
            </div>
        );
    }

    if (!icon || !icon.value) {
        return null;
    }

    if (icon.source === 'simpleicons') {
        const iconSlug = icon.slug || icon.value;
        return (
            <div className={className}>
                <img
                    src={`https://cdn.simpleicons.org/${iconSlug}`}
                    alt={icon.label}
                    className="w-full h-full"
                    width="50"
                    height="50"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                        }
                    }}
                />
                <div className="hidden w-full h-full bg-gray-300 rounded flex items-center justify-center text-white font-bold text-2xl">
                    {icon.label ? icon.label.charAt(0).toUpperCase() : '?'}
                </div>
            </div>
        );
    }

    if (icon.source === 'devicon' || !icon.source) {
        return (
            <div className={className}>
                <i className={`devicon-${icon.value}-plain dev-icon ${className}`}></i>
            </div>
        );
    }

    return null;
};

const getHueFromHex = (hex) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;

    if (max !== min) {
        const d = max - min;

        if (max === r) {
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
            h = ((b - r) / d + 2) / 6;
        } else if (max === b) {
            h = ((r - g) / d + 4) / 6;
        }
    }

    return Math.round(h * 360);
};

export default IconRenderer;
