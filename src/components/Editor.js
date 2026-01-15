import React from "react";
import { Popover } from '@headlessui/react';
import CoverImage from "./CoverImage";
import ComponentToImg from "./ComponentToImg";

import RandomTheme from './RandomTheme';
import { ImgProvider } from '../utils/ImgContext'
import Header from "./Header";
import AISuggestions from "./AISuggestions";
import AIImageGenerator from "./AIImageGenerator";
import EnhancedIconSelector from "./EnhancedIconSelector";
import UnsplashSearch from "./UnsplashSearch";
import ImageUploadHandler from "./ImageUploadHandler";
import aiService from '../services/aiService';
import { useUsageTracker } from '../hooks/useUsageTracker';


import { THEMES } from "../utils/constants";

const defaultIcon = { 'label': 'Python', 'value': 'python', 'source': 'simpleicons', 'slug': 'python', 'hex': '3776AB' }

const defaultSettings = {
	title: "A beginners guide to python development",
	bgColor: "#949ee5",
	pattern: "",
	download: "PNG",
	author: 'zi',
	icon: defaultIcon,
	devIconOptions: [defaultIcon],
	font: 'font-Anek',
	theme: 'background',
	customIcon: '',
	platform: 'hashnode'
};

class Editor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			...defaultSettings,
			showAISuggestions: false,
			aiSuggestions: [],
			aiLoading: false,
			aiError: null,
			aiStyle: 'professional',
			showStylePopover: false,
			showAIImageGenerator: false,
			generatedImage: null,
			showEnhancedIconSelector: false,
			showUnsplashSearch: false
		};
	}

	componentDidMount() {
		// Icon loading is now handled by EnhancedIconSelector

		// Load settings from localStorage
		try {
			const savedSettings = localStorage.getItem('coverview_settings');
			if (savedSettings) {
				const parsed = JSON.parse(savedSettings);
				// Only restore keys that exist in defaultSettings to avoid stale data issues
				const validSettings = Object.keys(defaultSettings).reduce((acc, key) => {
					if (parsed.hasOwnProperty(key)) {
						acc[key] = parsed[key];
					}
					return acc;
				}, {});

				this.setState(validSettings);
			}
		} catch (e) {
			console.error("Failed to load settings:", e);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		// Save settings to localStorage whenever they change
		// Check if any setting changed
		const hasChanged = Object.keys(defaultSettings).some(key => this.state[key] !== prevState[key]);

		if (hasChanged) {
			const settingsToSave = Object.keys(defaultSettings).reduce((acc, key) => {
				acc[key] = this.state[key];
				return acc;
			}, {});
			localStorage.setItem('coverview_settings', JSON.stringify(settingsToSave));
		}
	}

	// AI 标题优化
	handleOptimizeTitle = async () => {
		if (!this.state.title || this.state.title.trim().length === 0) {
			alert('请先输入标题内容');
			return;
		}

		this.setState({ aiLoading: true, aiError: null, showAISuggestions: true });

		try {
			const suggestions = await aiService.optimizeTitle(this.state.title, this.state.aiStyle);
			this.setState({ aiSuggestions: suggestions, aiError: null });
		} catch (error) {
			console.error('AI optimization failed:', error);
			this.setState({
				aiError: error.message || 'AI 优化失败，请稍后重试',
				aiSuggestions: []
			});
		} finally {
			this.setState({ aiLoading: false });
		}
	}

	// 选择 AI 建议的标题
	handleSelectSuggestion = (suggestion) => {
		this.setState({ title: suggestion, selectedSuggestion: suggestion });
	}

	// 关闭 AI 建议
	closeAISuggestions = () => {
		this.setState({ showAISuggestions: false });
	}

	// 改变 AI 优化风格
	handleAIStyleChange = (style) => {
		this.setState({ aiStyle: style });
	}

	// 选择风格并开始优化
	selectStyleAndOptimize = (style) => {
		this.setState({ aiStyle: style }, () => {
			this.handleOptimizeTitle();
		});
	}

	// 打开/关闭 AI 图片生成器
	toggleAIImageGenerator = () => {
		this.setState({ showAIImageGenerator: !this.state.showAIImageGenerator });
	}

	// 处理 AI 生成的图片
	handleAIImageGenerated = (imageData) => {
		this.setState({
			generatedImage: imageData,
			showAIImageGenerator: false
		});
	}

	// 打开/关闭 Unsplash 搜索
	toggleUnsplashSearch = () => {
		this.setState({ showUnsplashSearch: !this.state.showUnsplashSearch });
	}

	// 打开/关闭增强图标选择器
	toggleEnhancedIconSelector = () => {
		this.setState({ showEnhancedIconSelector: !this.state.showEnhancedIconSelector });
	}

	// 处理图标选择
	handleIconSelect = (icon) => {
		this.setState({
			icon: {
				label: icon.label,
				value: icon.value,
				source: icon.source,
				hex: icon.hex,
				slug: icon.slug
			},
			showEnhancedIconSelector: false
		});
	}
	handleReset = () => {
		this.setState({
			...defaultSettings,
			devIconOptions: this.state.devIconOptions,
		});
	};

	getRandomTheme = (theme, Pattern) => {
		this.setState({ bgColor: theme.bgColor, borderColor: theme.bdColor, pattern: Pattern });
	}

	formatOptionLabel = ({ value, label, source, slug }) => {
		const iconSlug = slug || value;
		return (
			<div className="flex items-center justify-between w-full">
				<span className="mr-2 text-sm flex-1 truncate">{label}</span>
				<div className="ml-auto mr-2 flex items-center">
					{source === 'simpleicons' ? (
						// SimpleIcons - 使用官方 CDN 直接显示品牌色图标
						<img
							src={`https://cdn.simpleicons.org/${iconSlug}`}
							alt={label}
							className="w-5 h-5"
							onError={(e) => {
								// 如果加载失败，显示默认图标
								e.target.style.display = 'none';
								e.target.nextSibling.style.display = 'block';
							}}
						/>
					) : (
						// Devicons - 使用 CSS 类
						<i className={`devicon-${value}-plain dev-icon text-2xl`}></i>
					)}
					{/* 备用图标 */}
					<div className="hidden w-5 h-5 bg-gray-300 rounded flex items-center justify-center text-xs text-white font-bold">
						{label.charAt(0).toUpperCase()}
					</div>
				</div>
			</div>
		);
	}

	// 从十六进制色相获取色相角度（用于单色图标变色）
	getHueFromHex = (hex) => {
		// 移除 # 号
		const cleanHex = hex.replace('#', '');

		// 转换为 RGB
		const r = parseInt(cleanHex.substr(0, 2), 16);
		const g = parseInt(cleanHex.substr(2, 2), 16);
		const b = parseInt(cleanHex.substr(4, 2), 16);

		// 转换为 HSL
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0;

		if (max !== min) {
			const d = max - min;
			const s = max === 0 ? 0 : d / (255 - Math.abs(max + min - 255));

			switch (max) {
				case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
				case g: h = ((b - r) / d + 2) / 6; break;
				case b: h = ((r - g) / d + 4) / 6; break;
			}
		}

		return Math.round(h * 360);
	}



	render() {
		return (
			<div className="min-h-screen bg-gray-50 font-Inter selection:bg-purple-100 selection:text-purple-900">
				<Header />

				<ImgProvider>
					<ImageUploadHandler ref={el => this.imageUploader = el} />
					<div className="flex md:flex-row flex-col h-[calc(100vh-80px)]">

						<div className="bg-white flex flex-col h-full md:w-[350px] border-r border-gray-200 shadow-sm z-10 overflow-y-auto scrollbar-hide">

							<div className="p-6 space-y-6">
								<div className="flex flex-col">



									<div className="w-full">
										<div className="space-y-6">

											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<label className="text-sm font-medium text-gray-700">Blog Title</label>
													{this.state.title.trim() && (
														<Popover className="relative">
															<Popover.Button
																className="p-1 rounded-md border border-gray-200 transition-all shadow-sm flex items-center gap-1 text-xs font-medium"
																onClick={() => this.setState({ showStylePopover: !this.state.showStylePopover })}
															>
																✨
															</Popover.Button>
															<Popover.Panel className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-gray-100 bg-white shadow-xl overflow-hidden p-1">
																<div className="flex flex-col gap-0.5">
																	<button
																		onClick={() => this.selectStyleAndOptimize('professional')}
																		className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 text-left group transition-colors"
																	>
																		<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">专业风格</span>
																	</button>

																	<button
																		onClick={() => this.selectStyleAndOptimize('catchy')}
																		className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 text-left group transition-colors"
																	>
																		<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">头条风格</span>
																	</button>

																	<button
																		onClick={() => this.selectStyleAndOptimize('simple')}
																		className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 text-left group transition-colors"
																	>
																		<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">简短风格</span>
																	</button>
																</div>
															</Popover.Panel>
														</Popover>
													)}
												</div>
												<div className="relative group">
													<textarea
														type="text"
														value={this.state.title}
														placeholder="Enter title here"
														className="w-full p-3 text-base border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none h-32 text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white"
														onChange={(e) => this.setState({ title: e.target.value })}
													/>
												</div>

												{this.state.title.trim() && (
													<Popover className="relative">
														<Popover.Panel static className="absolute z-50">
															{/* This is just a placeholder to keep logic if needed, but the popover button is above */}
														</Popover.Panel>
													</Popover>
												)}
												{/* Wait, the popover logic was inside the label flex container. I need to replace the content INSIDE the label flex container. */}

												{/* AI 建议显示 */}
												{this.state.showAISuggestions && (
													<AISuggestions
														suggestions={this.state.aiSuggestions}
														loading={this.state.aiLoading}
														error={this.state.aiError}
														onSelectSuggestion={this.handleSelectSuggestion}
														onClose={this.closeAISuggestions}
													/>
												)}

												{/* AI 图片生成按钮已移除 */}
											</div>

											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">Author</label>
												<input
													type="text"
													value={this.state.author}
													placeholder="Author"
													className="w-full p-2.5 text-base border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white"
													onChange={(e) => this.setState({ author: e.target.value })}
												/>
											</div>

											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">Icon</label>
												<button
													onClick={this.toggleEnhancedIconSelector}
													className="flex items-center justify-between w-full p-2.5 border border-gray-200 rounded-md shadow-sm bg-white hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all group"
												>
													<div className="flex-1 flex items-center overflow-hidden">
														{this.formatOptionLabel(this.state.icon)}
													</div>
													<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-gray-600 ml-2" viewBox="0 0 20 20" fill="currentColor">
														<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
													</svg>
												</button>
											</div>
											<div className="w-full">

												{this.state.icon.label === 'upload your own' ?
													<div className="flex items-center justify-center w-64 mx-auto">
														<input type="file"
															className="focus:outline-none w-full text-sm cursor-pointer bg-white rounded border"
															onChange={(e) => this.setState({ 'customIcon': URL.createObjectURL(e.target.files[0]) })}
														/>
													</div>
													:
													<div></div>
												}

											</div>

											<div className="flex items-center gap-4">

												<div className="flex flex-col w-1/2 space-y-2">
													<span className="text-sm font-medium text-gray-700">Font</span>

													<select
														value={this.state.font}
														onChange={(e) => this.setState({ font: e.target.value })}
														className="w-full p-2.5 text-base border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none bg-white text-gray-800">
														<option>font-serif</option>
														<option>font-sans</option>
														<option>font-mono</option>
														<option>font-Inter</option>
														<option>font-Poppins</option>
														<option>font-Anek</option>
													</select>
												</div>
												<div className="flex flex-col w-1/2 space-y-2">
													<span className="text-sm font-medium text-gray-700">Color</span>
													<div className="border border-gray-200 rounded-md p-1 bg-white shadow-sm flex items-center">
														<input type="color" value={this.state.bgColor}
															onChange={(e) => this.setState({ bgColor: e.target.value })}
															className="h-9 w-full rounded cursor-pointer"
														/>
													</div>
												</div>

											</div>


											<div className="flex items-center">
												{/* <div className="flex flex-col m-2 w-1/2">
													<span className="font-medium text-sm pb-1">Pattern</span>
													<select
														onChange={(e) => this.setState({ pattern: e.target.value })}
														className="focus:outline-none border text-lg p-2 rounded"
														value={this.state.pattern}>

														<option>none</option>
														<option>graph-paper</option>
														<option>jigsaw</option>
														<option>hideout</option>
														<option>dots</option>
														<option>falling-triangles</option>
														<option>circuit-board</option>
														<option>temple</option>
														<option>anchors</option>
														<option>brickwall</option>
														<option>overlapping-circles</option>
														<option>wiggle</option>
														<option>tic-tac-toe</option>
														<option>leaf</option>
														<option>bubbles</option>
														<option>squares</option>
														<option>explorer</option>
														<option>jupiter</option>
														<option>sun</option>
													</select>
												</div> */}

												<div className="flex flex-col w-full space-y-2">
													<span className="text-sm font-medium text-gray-700">Platform</span>

													<select
														onChange={(e) => this.setState({ platform: e.target.value })}
														value={this.state.platform}
														className="w-full p-2.5 text-base border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none bg-white text-gray-800">
														<option>hashnode</option>
														<option>dev</option>
													</select>
												</div>

											</div>

											<button
												className="flex items-center justify-center w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-md text-sm font-medium transition-colors shadow-sm"
												onClick={this.handleReset}>
												<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white mr-2 " fill="currentColor" viewBox="0 0 24 24" ><path d="M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3-3 1.331-3 3 1.329 3 3 3z"></path><path d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z"></path></svg>
												<span className="font-Inter">Reset All</span>
											</button>

										</div>



									</div>


								</div>
							</div>
						</div>
						{/* cover image preview */}

						<div className="flex-1 bg-gray-50/50 flex flex-col items-center justify-center p-8 overflow-y-auto relative min-h-0">
							<div className="absolute inset-0 z-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
							<div className="z-10 w-full flex justify-center items-center">
								<ComponentToImg downloadAs={this.state.download}>
									<CoverImage
										{...this.state}
										onOpenAI={this.toggleAIImageGenerator}
										onOpenUnsplash={this.toggleUnsplashSearch}
										onOpenUpload={() => this.imageUploader?.click()}
									/>
								</ComponentToImg>
							</div>
						</div>

						{/* themes section */}

						<div className="bg-white md:w-[280px] border-l border-gray-200 flex flex-col z-10 shadow-sm h-full">
							<div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
								<div className="flex items-center justify-between">
									<h2 className="text-sm font-semibold text-gray-900">Themes</h2>
									<RandomTheme onThemeChange={this.getRandomTheme} />
								</div>
							</div>

							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								<div className="grid grid-cols-1 gap-4">
									{
										THEMES.map(themePlaceholder => (
											<div
												className={`
													group relative rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer
													${themePlaceholder.label === this.state.theme
														? 'border-purple-600 ring-2 ring-purple-100 shadow-md'
														: 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
													}
												`}
												key={themePlaceholder.label}
												onClick={() => this.setState({ theme: themePlaceholder.label })}
											>
												<img
													src={themePlaceholder.preview}
													alt={themePlaceholder.label}
													className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
												/>
												<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 pointer-events-none" />
											</div>
										))
									}
								</div>
							</div>
						</div>

					</div>



					{/* AI 图片生成器弹窗 */}
					{this.state.showAIImageGenerator && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
							<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
								<AIImageGenerator
									title={this.state.title}
									onImageGenerated={this.handleAIImageGenerated}
									onClose={this.toggleAIImageGenerator}
									remainingQuota={this.props.usageTracker?.remainingQuota?.imageGenerations ?? 0}
									onUseQuota={(type) => true} // 这里的检查已移至服务端，但为了UI反馈保持true
								/>
							</div>
						</div>
					)}

					{/* Unsplash Search Modal */}
					{this.state.showUnsplashSearch && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
							<div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
								<div className="flex items-center justify-between p-4 border-b">
									<h3 className="text-lg font-semibold text-gray-800">
										🔍 Select Online Image
									</h3>
									<button
										onClick={this.toggleUnsplashSearch}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								<div className="flex-1 overflow-y-auto p-4">
									<UnsplashSearch
										largeImgPreview
										onImageSelected={this.toggleUnsplashSearch}
									/>
								</div>
							</div>
						</div>
					)}

				</ImgProvider>

				{/* 增强图标选择器弹窗 */}
				{this.state.showEnhancedIconSelector && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
							<EnhancedIconSelector
								value={this.state.icon}
								onChange={this.handleIconSelect}
								onClose={this.toggleEnhancedIconSelector}
							/>
						</div>
					</div>
				)}
			</div>
		);
	}
}

const EditorWithUsage = (props) => {
	const usageTracker = useUsageTracker();
	return <Editor {...props} usageTracker={usageTracker} />;
};

export default EditorWithUsage;
