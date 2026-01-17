import React, { Fragment } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/icons/logo.png';
import heroMockup from '../assets/images/hero_mockup.png';
import hashnodeLogo from '../assets/images/hashnode-logo.png';
import devLogo from '../assets/images/dev-logo.png';
import GitHubAuthButton from './GitHubAuthButton';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const { user, loading, error } = useAuth();
    const { t, i18n } = useTranslation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-900">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="text-xs text-gray-400 p-3 bg-gray-50 rounded-lg border border-gray-100 uppercase tracking-widest">
                        Check .env.local configuration
                    </div>
                </div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/editor" replace />;
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-Inter">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-purple-100/50 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[30%] bg-blue-50/80 blur-[80px] rounded-full"></div>
            </div>

            {/* Nav */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="logo" className="w-10 h-10" />
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        CoverView
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors shadow-sm">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.188 15.287 5.711 18.312M14.705 11c-1.692 2.525-4.596 4.475-7.994 5.5" />
                                </svg>
                                <span>{i18n.language === 'zh' ? '中文' : 'EN'}</span>
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50">
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => i18n.changeLanguage('en')}
                                                className={`${active ? 'bg-gray-50 text-gray-900' : 'text-gray-600'} flex items-center justify-between w-full px-4 py-2.5 text-sm ${i18n.language === 'en' ? 'font-bold text-purple-600' : ''}`}
                                            >
                                                English
                                                {i18n.language === 'en' && <span className="text-purple-600">✓</span>}
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => i18n.changeLanguage('zh')}
                                                className={`${active ? 'bg-gray-50 text-gray-900' : 'text-gray-600'} flex items-center justify-between w-full px-4 py-2.5 text-sm ${i18n.language === 'zh' ? 'font-bold text-purple-600' : ''}`}
                                            >
                                                简体中文
                                                {i18n.language === 'zh' && <span className="text-purple-600">✓</span>}
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    <a
                        href="https://github.com/z4none/CoverView"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <span className="text-lg">⭐</span> {t('home.hero.star')}
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-600 mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    AI Powered Generation is Here
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-slate-900">
                    {t('home.hero.title').split(' ').map((word, i) => (
                        <span key={i} className={word === 'Stunning' || word === '精美' ? 'text-purple-600 transition-all duration-300 transform hover:scale-110 cursor-default inline-block' : ''}>
                            {word}{' '}
                        </span>
                    ))}
                </h1>

                <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed">
                    {t('home.hero.subtitle')}
                </p>

                <div className="mb-20">
                    <GitHubAuthButton />
                </div>

                {/* Hero Mockup */}
                <div className="relative w-full max-w-5xl">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-[2rem] blur-2xl opacity-50"></div>
                    <div className="relative rounded-2xl border border-gray-200 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white">
                        <img src={heroMockup} alt="Platform Mockup" className="w-full h-auto object-cover" />
                    </div>

                    {/* Floating elements for visual flair */}
                    <div className="absolute -top-6 -right-6 h-24 w-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center animate-bounce duration-[3000ms]">
                        <span className="text-4xl text-purple-600">✨</span>
                    </div>
                    <div className="absolute -bottom-10 -left-6 h-20 w-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center animate-bounce delay-700 duration-[4000ms]">
                        <span className="text-3xl text-blue-500">🎨</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900">{t('home.features.title')}</h2>
                    <div className="h-1.5 w-20 bg-purple-600 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon="✨"
                        title={t('home.features.ai.title')}
                        desc={t('home.features.ai.desc')}
                        color="purple"
                    />
                    <FeatureCard
                        icon="🧠"
                        title={t('home.features.optimize.title')}
                        desc={t('home.features.optimize.desc')}
                        color="blue"
                    />
                    <FeatureCard
                        icon="🎨"
                        title={t('home.features.icons.title')}
                        desc={t('home.features.icons.desc')}
                        color="pink"
                    />
                    <FeatureCard
                        icon="📷"
                        title={t('home.features.unsplash.title')}
                        desc={t('home.features.unsplash.desc')}
                        color="indigo"
                    />
                </div>
            </section>

            {/* Platforms */}
            <section className="relative z-10 py-20 px-6 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center px-4">
                    <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-12">
                        {t('home.platforms')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-700">
                        <img src={hashnodeLogo} alt="Hashnode" className="h-10 w-auto" />
                        <img src={devLogo} alt="Dev.to" className="h-10 w-auto" />
                        <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all">
                            <svg className="w-8 h-8 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            <span className="font-bold text-xl text-slate-700">LinkedIn</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-purple-600 to-indigo-700 p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-purple-200">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 blur-[80px] rounded-full"></div>

                    <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">
                        {t('home.cta.title')}
                    </h2>
                    <p className="text-xl text-purple-100 mb-12 max-w-xl mx-auto relative z-10 opacity-90 leading-relaxed">
                        {t('home.cta.subtitle')}
                    </p>
                    <div className="relative z-10 flex flex-col items-center">
                        <GitHubAuthButton />
                    </div>
                </div>

                <footer className="mt-40 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-t border-gray-100 pt-12 pb-12 gap-8 text-slate-500">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-2 mb-3">
                            <img src={logo} alt="logo" className="w-6 h-6" />
                            <span className="font-bold text-slate-900 tracking-tight">CoverView</span>
                        </div>
                        <p className="text-sm">
                            © {new Date().getFullYear()}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold tracking-wider">
                        <Link to="/faq" className="hover:text-purple-600 transition-colors uppercase">FAQ</Link>
                        <a href="https://github.com/z4none/CoverView" className="hover:text-purple-600 transition-colors uppercase">Github</a>
                    </div>
                </footer>
            </section>

            <style jsx>{`
        .feature-card {
          background: white;
          border: 1px solid #f1f5f9;
        }
      `}</style>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, color }) => {
    const colorMap = {
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        pink: 'bg-pink-50 text-pink-600 border-pink-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };

    return (
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-purple-200 transition-all duration-500 transform hover:-translate-y-2">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 border-2 ${colorMap[color]} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-900">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
};

export default Home;