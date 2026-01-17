import React from "react";
import { Popover } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
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
import { ImgContext } from "../utils/ImgContext";
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
	iconColor: '#ffffff',
	devIconOptions: [defaultIcon],
	font: 'font-Anek',
	fontSize: 60,
	theme: 'background',
	customIcon: '',
	platform: 'hashnode',
	textColor: '#ffffff'
};

class Editor extends React.Component {
	static contextType = ImgContext;
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

		this.lastAnalyzedBgColor = '';
		this.lastAnalyzedTheme = '';
		this.lastAnalyzedImageUrl = '';
	}

	componentDidMount() {
		// 初始化分析状态
		const { unsplashImage } = this.context || {};
		this.lastAnalyzedBgColor = this.state.bgColor;
		this.lastAnalyzedTheme = this.state.theme;
		this.lastAnalyzedImageUrl = unsplashImage?.url || '';

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
		const { unsplashImage } = this.context || {};
		const imageUrl = unsplashImage?.url || '';

		// 1. 检查背景是否发生变化（颜色、主题或图片）以触发自动配色
		const bgChanged =
			prevState.bgColor !== this.state.bgColor ||
			prevState.theme !== this.state.theme ||
			this.lastAnalyzedImageUrl !== imageUrl;

		if (bgChanged) {
			console.log("[AutoContrast] Background changed, triggering calculation...");
			// 更新分析记录，防止重复触发
			this.lastAnalyzedBgColor = this.state.bgColor;
			this.lastAnalyzedTheme = this.state.theme;
			this.lastAnalyzedImageUrl = imageUrl;

			this.handleAutoContrast();
			this.handleAutoTextContrast();
		}

		// 2. 将设置保存到 localStorage
		const hasChanged = Object.keys(defaultSettings).some(key => this.state[key] !== prevState[key]);

		if (hasChanged) {
			const settingsToSave = Object.keys(defaultSettings).reduce((acc, key) => {
				acc[key] = this.state[key];
				return acc;
			}, {});
			localStorage.setItem('coverview_settings', JSON.stringify(settingsToSave));
		}
	}

	// AI Title Optimization
	handleOptimizeTitle = async () => {
		if (!this.state.title || this.state.title.trim().length === 0) {
			alert('Please enter a title first');
			return;
		}

		this.setState({ aiLoading: true, aiError: null, showAISuggestions: true });

		try {
			const suggestions = await aiService.optimizeTitle(this.state.title, this.state.aiStyle);
			this.setState({ aiSuggestions: suggestions, aiError: null });
		} catch (error) {
			console.error('AI optimization failed:', error);
			this.setState({
				aiError: error.message || 'AI optimization failed, please try again later',
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
			// s is calculated but unused, commented out to fix lint error
			// const s = max === 0 ? 0 : d / (255 - Math.abs(max + min - 255));

			switch (max) {
				case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
				case g: h = ((b - r) / d + 2) / 6; break;
				case b: h = ((r - g) / d + 4) / 6; break;
				default: break;
			}
		}

		return Math.round(h * 360);
	}

	// 根据背景色计算对比色（黑或白）
	// RGB (0-255) 转 HSL (0-1)
	rgbToHsl = (r, g, b) => {
		r /= 255; g /= 255; b /= 255;
		const max = Math.max(r, g, b), min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;

		if (max === min) {
			h = s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
				default: break;
			}
			h /= 6;
		}
		return [h, s, l];
	}

	// HSL (0-1) 转 RGB (0-255)
	hslToRgb = (h, s, l) => {
		let r, g, b;
		if (s === 0) {
			r = g = b = l;
		} else {
			const hue2rgb = (p, q, t) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	// 计算高对比度文本颜色 (更偏向黑白以保证可读性)
	calculateContrastTextColor = (hex) => {
		if (!hex || typeof hex !== 'string') return '#ffffff';

		const cleanHex = hex.replace('#', '');
		let r, g, b;
		if (cleanHex.length === 3) {
			r = parseInt(cleanHex[0] + cleanHex[0], 16);
			g = parseInt(cleanHex[1] + cleanHex[1], 16);
			b = parseInt(cleanHex[2] + cleanHex[2], 16);
		} else {
			r = parseInt(cleanHex.substring(0, 2), 16);
			g = parseInt(cleanHex.substring(2, 4), 16);
			b = parseInt(cleanHex.substring(4, 6), 16);
		}

		// eslint-disable-next-line no-unused-vars
		const [h, _s, l] = this.rgbToHsl(r, g, b);

		// 文本需要更高的对比度，所以亮度阈值更极端
		let newL;
		// 如果背景亮度 > 0.5 (亮背景)，文本设为极暗 (几乎黑色)
		// 如果背景亮度 <= 0.5 (暗背景)，文本设为极亮 (白色)
		if (l > 0.5) {
			newL = 0.1; // 接近黑色
		} else {
			newL = 0.98; // 接近白色
		}

		let newS = 0.1; // 低饱和度，接近灰度

		const [nr, ng, nb] = this.hslToRgb(h, newS, newL);
		const result = "#" + ((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1);

		console.log(`[ColorCalc] Text Contrast Input: ${hex} -> Result: ${result}`);
		return result;
	}

	// 计算鲜艳的对比色
	calculateVibrantContrastColor = (hex) => {
		if (!hex || typeof hex !== 'string') return '#ffffff';

		const cleanHex = hex.replace('#', '');
		let r, g, b;
		if (cleanHex.length === 3) {
			r = parseInt(cleanHex[0] + cleanHex[0], 16);
			g = parseInt(cleanHex[1] + cleanHex[1], 16);
			b = parseInt(cleanHex[2] + cleanHex[2], 16);
		} else {
			r = parseInt(cleanHex.substring(0, 2), 16);
			g = parseInt(cleanHex.substring(2, 4), 16);
			b = parseInt(cleanHex.substring(4, 6), 16);
		}

		const [h, s, l] = this.rgbToHsl(r, g, b);

		// 1. 色相旋转 180 度获取补色
		let newH = (h + 0.5) % 1.0;

		// 2. 保证高饱和度（如果背景太灰，给一个默认色相）
		let newS = s < 0.1 ? 0.8 : Math.max(s, 0.7);
		if (s < 0.1) newH = 0.75; // 默认给个漂亮的紫色/蓝色调

		// 3. 极高对比度的亮度调整
		let newL;
		if (l > 0.5) {
			// 背景亮 -> 图标暗 (20%-35%)
			newL = 0.25;
		} else {
			// 背景暗 -> 图标亮 (75%-90%)
			newL = 0.85;
		}

		const [nr, ng, nb] = this.hslToRgb(newH, newS, newL);
		const result = "#" + ((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1);

		console.log(`[ColorCalc] Vibrant Input: ${hex} (HSL: ${h.toFixed(2)},${s.toFixed(2)},${l.toFixed(2)}) -> Result: ${result} (HSL: ${newH.toFixed(2)},${newS.toFixed(2)},${newL.toFixed(2)})`);

		return result;
	}

	// 颜色混合 (Alpha Blending)
	blendColors = (topColorHex, bottomColorHex, alpha) => {
		const parseHex = (hex) => {
			const clean = hex.replace('#', '');
			if (clean.length === 3) {
				return [
					parseInt(clean[0] + clean[0], 16),
					parseInt(clean[1] + clean[1], 16),
					parseInt(clean[2] + clean[2], 16)
				];
			}
			return [
				parseInt(clean.substring(0, 2), 16),
				parseInt(clean.substring(2, 4), 16),
				parseInt(clean.substring(4, 6), 16)
			];
		};

		const [r1, g1, b1] = parseHex(topColorHex);
		const [r2, g2, b2] = parseHex(bottomColorHex);

		const r = Math.round(r1 * alpha + r2 * (1 - alpha));
		const g = Math.round(g1 * alpha + g2 * (1 - alpha));
		const b = Math.round(b1 * alpha + b2 * (1 - alpha));

		const res = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		console.log(`[ColorCalc] Blending: Overlay ${topColorHex}(${alpha}) over ${bottomColorHex} -> Perceived: ${res}`);
		return res;
	}

	// 根据背景色计算对比色（黑或白）
	calculateContrastColor = (hex) => {
		if (!hex || typeof hex !== 'string') return '#000000';

		// 移除 # 号并确保是 6 位或 3 位
		const cleanHex = hex.replace('#', '');
		let r, g, b;

		if (cleanHex.length === 3) {
			r = parseInt(cleanHex[0] + cleanHex[0], 16);
			g = parseInt(cleanHex[1] + cleanHex[1], 16);
			b = parseInt(cleanHex[2] + cleanHex[2], 16);
		} else if (cleanHex.length === 6) {
			r = parseInt(cleanHex.substring(0, 2), 16);
			g = parseInt(cleanHex.substring(2, 4), 16);
			b = parseInt(cleanHex.substring(4, 6), 16);
		} else {
			console.log(`[ColorCalc] 格式不支持: ${hex}`);
			return '#000000'; // 格式不支持时默认黑
		}

		// 如果解析失败，返回黑
		if (isNaN(r) || isNaN(g) || isNaN(b)) {
			console.log(`[ColorCalc] 解析失败: ${hex}`);
			return '#000000';
		}

		// 使用 YIQ 亮度感知公式 (ITU-R BT.601)
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		const result = brightness > 128 ? '#000000' : '#ffffff';

		console.log(`[ColorCalc] 输入: ${hex} | RGB: (${r}, ${g}, ${b}) | 亮度值: ${brightness.toFixed(2)} | 结果: ${result === '#000000' ? '黑色' : '白色'}`);

		return result;
	}

	// 从远程图片提取平均色
	getAverageColorFromImage = (imageUrl) => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = "Anonymous";
			img.src = imageUrl;

			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				canvas.width = img.width;
				canvas.height = img.height;

				ctx.drawImage(img, 0, 0);

				try {
					const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
					let r = 0, g = 0, b = 0;

					// 采样，每隔 10 个像素采一个点以提高性能
					const step = 40; // imageData 是 rgba, 所以 4 * step
					let count = 0;
					for (let i = 0; i < imageData.length; i += step) {
						r += imageData[i];
						g += imageData[i + 1];
						b += imageData[i + 2];
						count++;
					}

					r = Math.floor(r / count);
					g = Math.floor(g / count);
					b = Math.floor(b / count);

					const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
					console.log(`[ColorCalc] Image Average Color: ${hex} (RGB: ${r}, ${g}, ${b})`);
					resolve(hex);
				} catch (e) {
					console.error("[ColorCalc] Image data extraction failed (likely CORS):", e);
					resolve(null);
				}
			};

			img.onerror = (e) => {
				console.error("[ColorCalc] Image load failed:", e);
				resolve(null);
			};
		});
	}

	// 智能自动对比度按钮回调
	handleAutoContrast = async () => {
		const { unsplashImage } = this.context;
		const themesWithImage = ['background', 'stylish', 'mobile', 'preview'];

		let baseColor = this.state.bgColor;

		// 如果当前主题支持图片且已选择图片
		if (themesWithImage.includes(this.state.theme) && unsplashImage && unsplashImage.url) {
			console.log("[ColorCalc] Analyzing background image...");
			this.setState({ aiLoading: true }); //借用 AI loading 状态
			const averageColor = await this.getAverageColorFromImage(unsplashImage.url);
			this.setState({ aiLoading: false });

			if (averageColor) {
				baseColor = averageColor;
			}

			// 背景主题背景图上有 bg-gray-800/60 蒙层
			if (this.state.theme === 'background') {
				baseColor = this.blendColors('#1f2937', baseColor, 0.6);
			}
		}

		const color = this.calculateVibrantContrastColor(baseColor);
		this.setState({ iconColor: color });
	}

	// 智能文本颜色自动对比度
	handleAutoTextContrast = async () => {
		// Themes that have a white background for text area -> always black text
		const staticTextThemes = ['stylish', 'basic', 'modern'];
		if (staticTextThemes.includes(this.state.theme)) {
			this.setState({ textColor: '#000000' });
			return;
		}

		const { unsplashImage } = this.context;
		const themesWithImage = ['background', 'stylish', 'mobile', 'preview'];

		let baseColor = this.state.bgColor;

		// 如果当前主题支持图片且已选择图片
		if (themesWithImage.includes(this.state.theme) && unsplashImage && unsplashImage.url) {
			// 复用已分析的颜色，或者重新获取 (getAverageColorFromImage 有缓存吗? 这里假设没缓存但很快)
			// 注意：getAverageColorFromImage 是异步的
			// 为了避免重复网络请求，其实 handleAutoContrast 可能已经跑过了
			// 但 React state batching 可能会掩盖这个问题。
			// 简单起见，这里重新跑一遍逻辑 (performance hit likely negligible for single user)

			const averageColor = await this.getAverageColorFromImage(unsplashImage.url);
			if (averageColor) {
				baseColor = averageColor;
			}

			// 背景主题背景图上有 bg-gray-800/60 蒙层
			if (this.state.theme === 'background') {
				baseColor = this.blendColors('#1f2937', baseColor, 0.6);
			}
		}

		const color = this.calculateContrastTextColor(baseColor);
		this.setState({ textColor: color });
	}



	render() {
		return (
			<div className="min-h-screen bg-gray-50 font-Inter selection:bg-purple-100 selection:text-purple-900">
				<Header />

				<ImageUploadHandler ref={el => this.imageUploader = el} />
				<div className="flex md:flex-row flex-col h-[calc(100vh-80px)]">

					<div className="bg-white flex flex-col h-full md:w-[350px] border-r border-gray-200 shadow-sm z-10 overflow-y-auto scrollbar-hide">

						<div className="p-6 space-y-6">
							<div className="flex flex-col">



								<div className="space-y-8">

									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<label className="text-sm font-medium text-gray-700">{this.props.t('editor.blogTitle')}</label>
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
															<div className="px-3 py-1.5 mb-1 border-b border-gray-50 text-[10px] uppercase tracking-wider font-semibold text-gray-400 bg-gray-50/50 rounded-t">
																{this.props.t('editor.styleCost')}
															</div>
															<button
																onClick={() => this.selectStyleAndOptimize('professional')}
																className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 text-left group transition-colors"
															>
																<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{this.props.t('editor.styleOptions.professional')}</span>
															</button>

															<button
																onClick={() => this.selectStyleAndOptimize('catchy')}
																className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 text-left group transition-colors"
															>
																<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{this.props.t('editor.styleOptions.catchy')}</span>
															</button>

															<button
																onClick={() => this.selectStyleAndOptimize('simple')}
																className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 text-left group transition-colors"
															>
																<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{this.props.t('editor.styleOptions.simple')}</span>
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
												placeholder={this.props.t('editor.placeholderTitle')}
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
										<label className="text-sm font-medium text-gray-700">{this.props.t('editor.author')}</label>
										<input
											type="text"
											value={this.state.author}
											placeholder={this.props.t('editor.placeholderAuthor')}
											className="w-full p-2.5 text-base border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white"
											onChange={(e) => this.setState({ author: e.target.value })}
										/>
									</div>

									<div className="flex items-center gap-3">
										<div className="flex-1 space-y-2">
											<label className="text-sm font-medium text-gray-700">{this.props.t('editor.icon')}</label>
											<button
												onClick={this.toggleEnhancedIconSelector}
												className="flex items-center justify-between w-full h-[44px] px-3 border border-gray-200 rounded-md shadow-sm bg-white hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all group"
											>
												<div className="flex-1 flex items-center overflow-hidden">
													{this.formatOptionLabel(this.state.icon)}
												</div>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-gray-600 ml-2" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
												</svg>
											</button>
										</div>

										<div className="w-28 space-y-2">
											<label className="text-sm font-medium text-gray-700">{this.props.t('editor.iconColor')}</label>


											<div className="flex items-center gap-2">
												<div className="relative group/color border border-gray-200 rounded-md p-1 bg-white shadow-sm flex items-center h-[44px] flex-1">
													<input type="color" value={this.state.iconColor || '#000000'}
														onChange={(e) => this.setState({ iconColor: e.target.value })}
														className="h-full w-full rounded cursor-pointer opacity-0 absolute inset-0 z-10"
													/>
													<div
														className="w-full h-full rounded border border-gray-100"
														style={{ backgroundColor: this.state.iconColor || 'transparent' }}
													>
														{!this.state.iconColor && (
															<div className="w-full h-full flex items-center justify-center">
																<div className="w-[1px] h-full bg-red-500 rotate-45 transform"></div>
															</div>
														)}
													</div>

													{this.state.iconColor && (
														<button
															onClick={() => this.setState({ iconColor: '' })}
															className="absolute -top-2 -right-2 bg-white rounded-full shadow-md border border-gray-100 p-0.5 opacity-0 group-hover/color:opacity-100 transition-opacity z-20"
															title="Reset to default"
														>
															<svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
																<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
															</svg>
														</button>
													)}
												</div>
												<button
													onClick={this.handleAutoContrast}
													className={`h-[44px] w-[44px] flex items-center justify-center border border-gray-200 rounded-md bg-white hover:bg-gray-50 hover:border-purple-300 text-gray-400 hover:text-purple-600 transition-all shadow-sm ${this.state.aiLoading ? 'animate-spin cursor-not-allowed opacity-50' : ''}`}
													disabled={this.state.aiLoading}
													title="Smart Contrast"
												>
													<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
														<path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
													</svg>
												</button>

											</div>
										</div>
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
											<span className="text-sm font-medium text-gray-700">{this.props.t('editor.font')}</span>
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
											<span className="text-sm font-medium text-gray-700">{this.props.t('editor.fontSize')} ({this.state.fontSize}px)</span>
											<div className="flex items-center h-[44px]">
												<input
													type="range"
													min="30"
													max="80"
													step="1"
													value={this.state.fontSize}
													onChange={(e) => this.setState({ fontSize: parseInt(e.target.value) })}
													className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
												/>
											</div>
										</div>
									</div>

									<div className="flex flex-col w-full space-y-2">
										<label className="text-sm font-medium text-gray-700">{this.props.t('editor.textColor')}</label>
										<div className="flex items-center gap-2">
											<div className="relative group/color border border-gray-200 rounded-md p-1 bg-white shadow-sm flex items-center h-[44px] flex-1">
												<input type="color" value={this.state.textColor || '#ffffff'}
													onChange={(e) => this.setState({ textColor: e.target.value })}
													className="h-full w-full rounded cursor-pointer opacity-0 absolute inset-0 z-10"
												/>
												<div
													className="w-full h-full rounded border border-gray-100"
													style={{ backgroundColor: this.state.textColor || '#ffffff' }}
												></div>
											</div>
											<button
												onClick={this.handleAutoTextContrast}
												className={`h-[44px] w-[44px] flex items-center justify-center border border-gray-200 rounded-md bg-white hover:bg-gray-50 hover:border-purple-300 text-gray-400 hover:text-purple-600 transition-all shadow-sm ${this.state.aiLoading ? 'animate-spin cursor-not-allowed opacity-50' : ''}`}
												disabled={this.state.aiLoading}
												title="Smart Text Contrast"
											>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
													<path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
												</svg>
											</button>
										</div>
									</div>

									<div className="flex flex-col w-full space-y-2">
										<span className="text-sm font-medium text-gray-700">{this.props.t('editor.color')}</span>
										<div className="border border-gray-200 rounded-md p-1 bg-white shadow-sm flex items-center h-[44px]">
											<input type="color" value={this.state.bgColor}
												onChange={(e) => this.setState({ bgColor: e.target.value })}
												className="h-full w-full rounded cursor-pointer border-none"
											/>
										</div>
									</div>

									<div className="flex flex-col w-full space-y-2">
										<span className="text-sm font-medium text-gray-700">{this.props.t('editor.platform')}</span>

										<select
											onChange={(e) => this.setState({ platform: e.target.value })}
											value={this.state.platform}
											className="w-full p-2.5 text-base border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none bg-white text-gray-800">
											<option>hashnode</option>
											<option>dev</option>
										</select>
									</div>

									<div className="flex items-center justify-center">
										<button
											className="flex items-center justify-center w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-md text-sm font-medium transition-colors shadow-sm"
											onClick={this.handleReset}>
											<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white mr-2 " fill="currentColor" viewBox="0 0 24 24" ><path d="M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3-3 1.331-3 3 1.329 3 3 3z"></path><path d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z"></path></svg>
											<span className="font-Inter">{this.props.t('editor.resetAll')}</span>
										</button>

									</div>
								</div>


							</div>
						</div>
					</div>

					{/* cover image preview */}

					<div className="flex-1 bg-gray-50/50 flex flex-col items-center justify-center p-8 overflow-y-auto relative min-h-0" >
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

					<div className="bg-white md:w-[280px] border-l border-gray-200 flex flex-col z-10 shadow-sm h-full" >
						<div className="p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
							<div className="flex items-center justify-between">
								<h2 className="text-sm font-semibold text-gray-900">{this.props.t('editor.themes')}</h2>
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
													: 'border-gray-200 hover:border-purple-300 hover:shadow-sm'}`}
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

					{/* AI 图片生成器弹窗 */}
					{
						this.state.showAIImageGenerator && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
								<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
									<AIImageGenerator
										title={this.state.title}
										onImageGenerated={this.handleAIImageGenerated}
										onClose={this.toggleAIImageGenerator}
										remainingQuota={this.props.usageTracker?.remainingQuota?.imageGenerations ?? 0}
										onUseQuota={(type) => this.props.usageTracker?.incrementUsage(type)}
									/>
								</div>
							</div>
						)
					}

					{/* Unsplash Search Modal */}
					{
						this.state.showUnsplashSearch && (
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
						)
					}

					{/* 增强图标选择器弹窗 */}
					{
						this.state.showEnhancedIconSelector && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
								<div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
									<EnhancedIconSelector
										value={this.state.icon}
										onChange={this.handleIconSelect}
										onClose={this.toggleEnhancedIconSelector}
									/>
								</div>
							</div>
						)
					}
				</div>
			</div>
		);
	}
}

const EditorWithUsage = (props) => {
	const usageTracker = useUsageTracker();
	const { t, i18n } = useTranslation();
	return (
		<ImgProvider>
			<Editor {...props} usageTracker={usageTracker} t={t} i18n={i18n} />
		</ImgProvider>
	);
};

export default EditorWithUsage;
