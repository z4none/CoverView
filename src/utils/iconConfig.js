// src/utils/iconConfig.js

// 图标库配置
export const ICON_LIBRARIES = {
  DEVICONS: {
    name: 'Devicons',
    description: '编程语言和开发工具图标',
    url: 'https://raw.githubusercontent.com/devicons/devicon/master/devicon.json',
    source: 'devicon',
    totalIcons: '~200'
  },
  SIMPLEICONS: {
    name: 'Simple Icons',
    description: '品牌和技术栈图标',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/refs/heads/develop/data/simple-icons.json',
    source: 'simpleicons',
    totalIcons: '~3000'
  }
};

// 图标库名称映射
export const ICON_LIBRARY_NAMES = {
  devicon: 'Devicons',
  simpleicons: 'Simple Icons'
};

// 图标显示配置
export const ICON_DISPLAY_CONFIG = {
  simpleicons: {
    baseUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/',
    fallbackColor: '#666666',
    size: '20px'
  },
  devicon: {
    cssClass: 'devicon-{name}-plain',
    cssBaseClass: 'dev-icon'
  }
};

// 热门图标（用于快速选择）
export const POPULAR_ICONS = [
  // 编程语言
  { name: 'javascript', library: 'devicon', category: 'language' },
  { name: 'python', library: 'devicon', category: 'language' },
  { name: 'typescript', library: 'devicon', category: 'language' },
  { name: 'java', library: 'devicon', category: 'language' },
  { name: 'go', library: 'devicon', category: 'language' },
  { name: 'rust', library: 'devicon', category: 'language' },
  
  // 框架和库
  { name: 'react', library: 'devicon', category: 'framework' },
  { name: 'vue', library: 'devicon', category: 'framework' },
  { name: 'angular', library: 'devicon', category: 'framework' },
  { name: 'nextjs', library: 'simpleicons', category: 'framework' },
  { name: 'nuxtjs', library: 'simpleicons', category: 'framework' },
  
  // 数据库
  { name: 'mongodb', library: 'devicon', category: 'database' },
  { name: 'postgresql', library: 'devicon', category: 'database' },
  { name: 'mysql', library: 'devicon', category: 'database' },
  
  // 云服务
  { name: 'aws', library: 'simpleicons', category: 'cloud' },
  { name: 'google-cloud', library: 'simpleicons', category: 'cloud' },
  { name: 'azure', library: 'simpleicons', category: 'cloud' },
  { name: 'vercel', library: 'simpleicons', category: 'cloud' },
  { name: 'netlify', library: 'simpleicons', category: 'cloud' },
  
  // 开发工具
  { name: 'git', library: 'devicon', category: 'tool' },
  { name: 'docker', library: 'devicon', category: 'tool' },
  { name: 'kubernetes', library: 'devicon', category: 'tool' },
  { name: 'vscode', library: 'simpleicons', category: 'tool' },
  { name: 'github', library: 'simpleicons', category: 'tool' }
];

// 图标分类
export const ICON_CATEGORIES = {
  language: { name: '编程语言', color: '#3178c6' },
  framework: { name: '框架/库', color: '#61dafb' },
  database: { name: '数据库', color: '#4caf50' },
  cloud: { name: '云服务', color: '#ff9800' },
  tool: { name: '开发工具', color: '#9c27b0' },
  social: { name: '社交媒体', color: '#e91e63' },
  os: { name: '操作系统', color: '#795548' }
};

// 图标搜索功能
export const searchIcons = (icons, searchTerm) => {
  if (!searchTerm) return icons;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return icons.filter(icon => 
    icon.label.toLowerCase().includes(lowerSearchTerm) ||
    (icon.hex && icon.hex.toLowerCase().includes(lowerSearchTerm)) ||
    (icon.slug && icon.slug.toLowerCase().includes(lowerSearchTerm))
  );
};

// 图标统计
export const getIconStats = (icons) => {
  const stats = {
    total: icons.length,
    byLibrary: {},
    byCategory: {}
  };
  
  icons.forEach(icon => {
    // 按库统计
    if (icon.source) {
      stats.byLibrary[icon.source] = (stats.byLibrary[icon.source] || 0) + 1;
    }
    
    // 按分类统计
    const popularIcon = POPULAR_ICONS.find(pop => pop.name === icon.value);
    if (popularIcon) {
      stats.byCategory[popularIcon.category] = (stats.byCategory[popularIcon.category] || 0) + 1;
    }
  });
  
  return stats;
};