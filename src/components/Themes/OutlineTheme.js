import React from 'react';
import IconRenderer from '../IconRenderer';

const OutlineTheme = ({ config }) => {
    const { title, bgColor, author, icon, font, customIcon, iconColor, fontSize, textColor } = config;

    return (
        <div className="w-full h-full bg-white ">
            <div className={`overflow-y-hidden flex flex-col text-gray-800 px-10 h-full`}
                style={{ backgroundColor: bgColor }}
            >
                <div className={`${font} rounded-2xl py-6 flex flex-col  `}>
                    <div className="m-6 w-24 h-24">
                        <IconRenderer icon={icon} customIcon={customIcon} iconColor={iconColor} />
                    </div>
                    <h1 className="p-4 font-bold" style={{ fontSize: `${fontSize}px`, lineHeight: '1.2', color: textColor }}>{title}</h1>

                    <div className={`${font} w-full h-16  flex  mt-auto mb-0 p-2 px-6  items-center`}>
                        <h2 className="text-2xl font-semibold" style={{ color: textColor }}>{author}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OutlineTheme;