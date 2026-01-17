import React, { useContext } from 'react';
import { ImgContext } from '../../utils/ImgContext';
import IconRenderer from '../IconRenderer';

const MobileMockupTheme = ({ config, onOpenAI, onOpenUnsplash, onOpenUpload }) => {
    const { title, author, icon, font, customIcon, bgColor, iconColor, fontSize, textColor } = config;
    const { unsplashImage, setUnsplashImage } = useContext(ImgContext);

    return (
        <div className={`bg-white w-full h-full`}>
            <div className={`overflow-y-hidden flex flex-row px-10 items-center w-full h-full justify-center pt-4`}
                style={{ backgroundColor: bgColor }}
            >
                <h1 className={`${font} w-1/2 px-4 font-bold text-left`} style={{ fontSize: `${fontSize}px`, lineHeight: '1.2', color: textColor }}>{title}</h1>

                <div className="w-5/12 mx-auto m-4 mt-10 group h-full shadow-lg flex flex-col bg-white border-t-8 border-x-8 border-gray-800 rounded-t-3xl border-white relative">
                    <div className="bg-gray-800 h-8 w-full p-2 pb-3 flex items-center rounded-t">
                        <div className="flex mx-auto items-center">
                            <div className="bg-white h-3 w-3 rounded-full mx-1"></div>
                            <div className="bg-white h-2 w-20 rounded-full mx-1"></div>
                        </div>
                    </div>

                    {unsplashImage ?
                        <div className="group relative h-full">
                            <img src={unsplashImage.url && unsplashImage.url} className="object-cover rounded -translate-y-1 h-full w-full" alt="preview" />
                            <button
                                onClick={() => setUnsplashImage('')}
                                className="ml-auto mr-4 cursor-pointer">
                                <svg className="group-hover:inline-block absolute top-4 right-2 bg-gray-500 hidden w-8 h-8 p-2 text-white rounded-full z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        :
                        <div className="flex flex-col p-6 bg-gray-50 items-center justify-center gap-4 h-full relative">
                            <div className="items-center justify-center flex w-12 h-12 mb-4">
                                <IconRenderer icon={icon} customIcon={customIcon} iconColor={iconColor} />
                            </div>
                            <div className="flex gap-2 flex-wrap justify-center">
                                <button
                                    onClick={onOpenUnsplash}
                                    className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                                >
                                    <div className="w-8 h-8 mb-1 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-700 group-hover:text-blue-600 text-center">Online</span>
                                </button>

                                <button
                                    onClick={onOpenAI}
                                    className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
                                >
                                    <div className="w-8 h-8 mb-1 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-700 group-hover:text-purple-600 text-center">AI</span>
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default MobileMockupTheme;