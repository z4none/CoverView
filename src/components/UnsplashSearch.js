import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import unsplash from '../utils/unsplashConfig';
import { ImgContext } from '../utils/ImgContext';

const UnsplashSearch = ({ largeImgPreview, onImageSelected }) => {
    const { t } = useTranslation();
    const [imageList, setImageList] = useState([]);
    const [searchText, setSearchText] = useState('setup');
    const [provider, setProvider] = useState('unsplash');
    const { setUnsplashImage } = useContext(ImgContext);

    const getRandomAnimeImage = () => {
        const timestamp = new Date().getTime();
        const targetUrl = `https://t.alcy.cc/ai?t=${timestamp}`;
        // Use Supabase proxy to avoid CORS issues
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const proxyUrl = `${supabaseUrl}/functions/v1/proxy-image?url=${encodeURIComponent(targetUrl)}`;

        setUnsplashImage({
            url: proxyUrl,
            name: 'Licyuan AI',
            avatar: 'https://cdn.simpleicons.org/juejin',
            profile: 'https://t.alcy.cc/ai',
            downloadLink: ''
        });
        if (onImageSelected) {
            onImageSelected();
        }
    };

    // Mock data for when API key is missing or request fails
    const mockImages = React.useMemo(() => [
        {
            id: 'mock1',
            urls: { regular: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80' },
            alt_description: 'Coding setup',
            user: {
                name: 'Mock User',
                profile_image: { small: 'https://images.unsplash.com/placeholder-avatars/extra-large.jpg' },
                links: { html: 'https://unsplash.com' }
            },
            links: { download_location: '' }
        },
        {
            id: 'mock2',
            urls: { regular: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
            alt_description: 'Desk setup',
            user: {
                name: 'Mock User',
                profile_image: { small: 'https://images.unsplash.com/placeholder-avatars/extra-large.jpg' },
                links: { html: 'https://unsplash.com' }
            },
            links: { download_location: '' }
        },
        {
            id: 'mock3',
            urls: { regular: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
            alt_description: 'Code screen',
            user: {
                name: 'Mock User',
                profile_image: { small: 'https://images.unsplash.com/placeholder-avatars/extra-large.jpg' },
                links: { html: 'https://unsplash.com' }
            },
            links: { download_location: '' }
        }
    ], []);


    const searchImages = (query = searchText) => {
        unsplash.search
            .getPhotos({
                query: query,
                page: 1,
                per_page: 30,
            })
            .then(response => {
                console.log('Unsplash response:', response);
                if (response && response.response && response.response.results) {
                    setImageList(response.response.results)
                } else {
                    console.warn('Unsplash API failed, using mock data');
                    setImageList(mockImages);
                }
            })
            .catch(error => {
                console.error('Error searching images:', error);
                setImageList(mockImages);
            });
    }


    const selectImage = (image) => {
        setUnsplashImage({
            url: image.urls.regular,
            name: image.user.name,
            avatar: image.user.profile_image.small,
            profile: `${image.user.links.html}?utm_source=https://coverview.vercel.app&utm_medium=referral`,
            downloadLink: image.links.download_location
        })

        if (onImageSelected) {
            onImageSelected();
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        searchImages(searchText);

    }

    useEffect(() => {
        unsplash.search
            .getPhotos({
                query: 'setup',
                page: 1,
                per_page: 30
            })
            .then(response => {
                console.log('Initial Unsplash response:', response);
                if (response && response.response && response.response.results) {
                    setImageList(response.response.results)
                } else {
                    console.warn('Unsplash API failed, using mock data');
                    setImageList(mockImages);
                }
            })
            .catch(error => {
                console.error('Error loading initial images:', error);
                setImageList(mockImages);
            });
    }, [mockImages]);

    return (
        <div className='w-full h-full'>
            <div className="flex flex-col p-2  bg-white items-center justify-center">

                <div className="flex items-center w-full px-6 mb-4 gap-4">
                    <button
                        onClick={() => setProvider('unsplash')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${provider === 'unsplash' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Unsplash
                    </button>
                    <button
                        onClick={() => setProvider('licyuan')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${provider === 'licyuan' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}
                    >
                        Licyuan (Anime)
                    </button>
                </div>

                {provider === 'unsplash' ? (
                    <div className="flex items-center w-full px-6 ">
                        <form onSubmit={(e) => handleSearchSubmit(e)} className=" mx-auto w-full flex bg-gray-50 rounded-full border border-gray-50 mb-2">
                            <input type="text"
                                value={searchText}
                                placeholder={t('unsplash.searchPlaceholder')}
                                className="focus:outline-none w-full text-lg bg-gray-50  p-1 px-4  rounded-full  "
                                onChange={(e) => setSearchText(e.target.value)}
                            />

                            <button type="submit" onClick={() => searchImages(searchText)}>
                                <svg className="w-9 h-9 ml-auto  p-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full px-6 py-8">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('unsplash.animeTitle')}</h3>
                            <p className="text-gray-500 text-sm">{t('unsplash.animeSubtitle')}</p>
                        </div>
                        <button
                            onClick={() => getRandomAnimeImage()}
                            className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            {t('unsplash.getRandom')}
                        </button>
                    </div>
                )}


                {provider === 'unsplash' && (
                    <div className="overflow-y-scroll w-full pb-12 overflow-x-hidden h-max justify-center flex flex-wrap">
                        {
                            imageList.map(image => {
                                return <div key={image.id}
                                    className={`rounded-lg relative cursor-pointer m-3 ${largeImgPreview ? ' h-44 w-60' : 'h-24 w-40'
                                        }`}
                                >
                                    <span className="font-Inter top-2 left-2 absolute text-sm font-semibold text-white opacity-50 ">{t('unsplash.clickToSelect')}</span>
                                    <img src={image.urls.regular}
                                        alt={image.alt_description}
                                        onClick={() => selectImage(image)
                                        }
                                        className="rounded-lg object-cover h-full w-full"
                                    />
                                </div>
                            })
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

export default UnsplashSearch;