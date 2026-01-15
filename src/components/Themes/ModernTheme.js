import React from 'react';
import IconRenderer from '../IconRenderer';

const ModernTheme = ({ config }) => {

    const { title, bgColor, pattern, author, icon, font, customIcon } = config;

    return (
        <div className="w-full h-full bg-white ">
            <div className=" overflow-y-hidden w-full h-full flex  items-center">
                <div className={`  h-full w-full p-4 text-gray-800 flex  items-center ${pattern} `}
                    style={{ backgroundColor: bgColor }}
                >

                    {
                        customIcon ?
                            <div className="  mx-auto items-center justify-center flex w-28 h-28">
                                <IconRenderer icon={icon} customIcon={customIcon} />
                            </div>
                            :
                            <div className=" rounded-full p-6 w-32 h-32 bg-white mx-auto items-center justify-center flex">
                                <IconRenderer icon={icon} customIcon={customIcon} />
                            </div>
                    }


                    <div className="h-full w-2/3">
                        <div className={`${font} bg-white px-12 justify-center text-left rounded-xl h-full p-4 flex flex-col`}>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-800">{title}</h1>
                            <h2 className="text-xl mt-10 font-semibold text-left ">{author}</h2>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default ModernTheme;