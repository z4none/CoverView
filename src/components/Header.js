import React, { Fragment } from 'react';
import { Link } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/icons/logo.png'

const Header = () => {
	const { user, signOut } = useAuth()
	const { t, i18n } = useTranslation()

	const changeLanguage = (lng) => {
		i18n.changeLanguage(lng);
	};

	return (
		<div className="bg-white text-xl md:px-2 flex items-center border-dashed border-b-2 border-gray-100 p-2 z-20 relative">
			<Link to="/" className="flex items-center">
				<img src={logo} alt="logo" className="w-8 h-8 mx-4" />
				<h1 className="font-semibold text-gray-800">Coverview</h1>
			</Link>

			<div className="ml-auto md:mr-4 flex items-center gap-2">
				<a href="https://github.com/z4none/CoverView" target="_blank" rel="noreferrer" className="bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-1.5 rounded-full text-gray-700 md:text-sm md:flex hidden items-center text-xs font-Nunito transition-colors">
					<span className="mr-2">⭐</span> {t('header.star')}
				</a>

				{/* Language Switcher */}
				<Menu as="div" className="relative inline-block text-left">
					<div>
						<Menu.Button className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
							<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.188 15.287 5.711 18.312M14.705 11c-1.692 2.525-4.596 4.475-7.994 5.5" />
							</svg>
							<span>{i18n.language === 'zh' ? '中文' : 'EN'}</span>
							<svg className="w-3 h-3 text-gray-400 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
						<Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
							<div className="py-1">
								<Menu.Item>
									{({ active }) => (
										<button
											onClick={() => changeLanguage('en')}
											className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
												} flex items-center justify-between w-full px-4 py-2 text-sm ${i18n.language === 'en' ? 'font-bold' : ''
												}`}
										>
											English
											{i18n.language === 'en' && <span className="text-purple-600">✓</span>}
										</button>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }) => (
										<button
											onClick={() => changeLanguage('zh')}
											className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
												} flex items-center justify-between w-full px-4 py-2 text-sm ${i18n.language === 'zh' ? 'font-bold' : ''
												}`}
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

				{user && (
					<Menu as="div" className="relative ml-3">
						<div>
							<Menu.Button className="flex items-center gap-2 max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 p-1 pr-3 border border-gray-200 hover:bg-gray-50 transition-colors">
								<div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold uppercase">
									{user.email?.[0] || 'U'}
								</div>
								<span className="text-sm font-medium text-gray-700 hidden md:block">
									{user.user_metadata?.full_name || user.email?.split('@')[0]}
								</span>
								<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
							<Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
								<div className="px-4 py-3">
									<p className="text-sm text-gray-900">{t('header.signedInAs')}</p>
									<p className="text-sm font-medium text-gray-500 truncate">{user.email}</p>
								</div>
								<div className="py-1">
									<Menu.Item>
										{({ active }) => (
											<Link
												to="/profile"
												className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
													} group flex w-full items-center px-4 py-2 text-sm`}
											>
												<svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												{t('header.profile')}
											</Link>
										)}
									</Menu.Item>
									<Menu.Item>
										{({ active }) => (
											<button
												onClick={() => signOut()}
												className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
													} group flex w-full items-center px-4 py-2 text-sm`}
											>
												<svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
												</svg>
												{t('header.signOut')}
											</button>
										)}
									</Menu.Item>
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				)}
			</div>
		</div>
	);
}

export default Header;