```
import React, { useContext } from 'react';
import { ImgContext } from '../../utils/ImgContext';
import IconRenderer from '../IconRenderer';

const PreviewTheme = ({ config, onOpenAI, onOpenUnsplash, onOpenUpload }) => {
    const { title, font, icon, customIcon, bgColor, iconColor, fontSize, textColor } = config;
    const { unsplashImage, setUnsplashImage } = useContext(ImgContext);

    return (
        <div className="w-full h-full bg-white">
            <div className={`overflow - y - hidden flex flex - col px - 4 pt - 4 w - full h - full`}
                style={{ backgroundColor: bgColor }}
            >
                <h1 className={`${ font } p - 10 font - bold text - center`} style={{ fontSize: `${ fontSize } px`, lineHeight: '1.2', color: textColor }}>{title}</h1>

                <div className="w-10/12 group mx-auto mt-auto mb-0 shadow-lg flex flex-col bg-white rounded-t-xl border-white">
                    <div className="bg-gray-800 h-8 w-full p-2 flex items-center rounded-t-xl">
                        <div className="bg-red-400 h-3 w-3 rounded-full mx-1"></div>
                        <div className="bg-yellow-400 h-3 w-3 rounded-full mx-1"></div>
                        <div className="bg-green-400 h-3 w-3 rounded-full mx-1"></div>
                        <button
                            onClick={() => setUnsplashImage('')}
                            className="ml-auto mr-4 cursor-pointer">
                            <svg className="group-hover:inline-block hidden w-4 h-4 text-white rounded-full z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    {unsplashImage ?
                        <div className="">
                            <img src={unsplashImage.url && unsplashImage.url} className="object-cover" alt="preview" />
                        </div>
                        :
                        <div className="flex flex-col p-6 bg-gray-50 items-center justify-center gap-4 min-h-[300px]">
                            <div className="items-center justify-center flex w-12 h-12 mb-4">
                                <IconRenderer icon={icon} customIcon={customIcon} iconColor={iconColor} />
                            </div>
                            <div className="flex gap-2 flex-wrap justify-center">
                                <button
                                    onClick={onOpenUnsplash}
                                    className="flex flex-col items-center justify-center w-28 h-28 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                                >
                                    <div className="w-10 h-10 mb-2 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Online Image</span>
                                </button>

                                <button
                                    onClick={onOpenAI}
                                    className="flex flex-col items-center justify-center w-28 h-28 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
                                >
                                    <div className="w-10 h-10 mb-2 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 group-hover:text-purple-600">AI Image</span>
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default PreviewTheme;