import React, { useContext } from 'react';
import { ImgContext } from '../../utils/ImgContext';
import UnsplashSearch from '../UnsplashSearch';
import IconRenderer from '../IconRenderer';

const StylishTheme = ({ config, onOpenAI, onOpenUnsplash, onOpenUpload }) => {
    const { title, author, font, icon, customIcon, bgColor } = config;
    const { unsplashImage, setUnsplashImage } = useContext(ImgContext);


    return (
        <div className=" bg-white w-full h-full">


            <div className={` overflow-y-hidden flex flex-col`}
                style={{ backgroundColor: bgColor }}
            >

                <div className="flex flex-row  items-center bg-white  justify-center">

                    <div className="h-full w-1/2  bg-white rounded-l-xl">
                        <div className={`${font} px-12 justify-center text-left rounded-xl h-full p-4 flex flex-col`}>
                            <h1 className=" text-4xl font-bold text-gray-800" style={{ color: bgColor }}>{title}</h1>
                            <div className="flex items-center mt-10 text-left">
                                <div className="mr-2 items-center justify-center flex w-12 h-12">
                                    <IconRenderer icon={icon} customIcon={customIcon} />
                                </div>
                                <h2 className="text-xl  font-semibold text-left " style={{ color: bgColor }}>{author}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 h-full">


                        {unsplashImage ?
                            <div className='relative w-full h-max flex group'>

                                <img src={unsplashImage.url && unsplashImage.url} className=" object-cover w-full h-full  " alt="preview" crossOrigin="anonymous" />


                                <button
                                    onClick={() => setUnsplashImage('')}
                                    className="absolute  top-4 right-2 cursor-pointer">
                                    <svg className="group-hover:inline-block hidden w-6 h-6 text-gray-800 bg-white p-1 rounded-full z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>

                                </button>

                                <div className="absolute  bottom-4 right-4 opacity-80">
                                    <div className=" group-hover:flex hidden items-center">
                                        <span className="text-sm text-white mx-2">Photo by</span>
                                        <a href={unsplashImage.profile} target="_blank" rel="noreferrer" className="cursor-pointer flex items-center bg-gray-300 rounded-full text-sm">
                                            <img src={unsplashImage.avatar && unsplashImage.avatar} alt={unsplashImage.name} className="h-6 w-6 rounded-full mr-2" crossOrigin="anonymous" />

                                            <span className="pr-2">{unsplashImage.name}</span>
                                        </a>

                                        <a href="https://unsplash.com/?utm_source=https://coverview.vercel.app&utm_medium=referral" className="text-sm text-white mx-2">Unsplash</a>
                                    </div>

                                </div>
                            </div>
                            :
                            <div className="flex flex-col p-6 bg-gray-50 items-center justify-center gap-4 min-h-[400px] border-l border-gray-100">
                                <div className="text-center mb-2">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">选择背景图片</h3>
                                    <p className="text-gray-500 text-sm">搜索 Unsplash 图库或使用 AI 生成</p>
                                </div>
                                <div className="flex gap-3 flex-wrap justify-center">
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

                                    <button
                                        onClick={onOpenUpload}
                                        className="flex flex-col items-center justify-center w-28 h-28 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                                    >
                                        <div className="w-10 h-10 mb-2 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 group-hover:text-green-600">Upload Image</span>
                                    </button>
                                </div>
                            </div>

                        }

                    </div>
                </div>


            </div>

        </div>
    );
}

export default StylishTheme;