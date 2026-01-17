import React from 'react';

const IconRenderer = ({ icon, customIcon, iconColor, className = '' }) => {
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
        const colorParam = (iconColor && iconColor !== '') ? `/${iconColor.replace('#', '')}` : '';
        return (
            <div className={className}>
                <img
                    src={`https://cdn.simpleicons.org/${iconSlug}${colorParam}`}
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



    return null;
};



export default IconRenderer;
