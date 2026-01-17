// src/utils/iconConfig.js

// Icon Library Configuration
export const ICON_LIBRARIES = {
  DEVICONS: {
    name: 'Devicons',
    description: 'Programming languages and dev tools icons',
    url: 'https://raw.githubusercontent.com/devicons/devicon/master/devicon.json',
    source: 'devicon',
    totalIcons: '~200'
  },
  SIMPLEICONS: {
    name: 'Simple Icons',
    description: 'Brand and tech stack icons',
    url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/refs/heads/develop/data/simple-icons.json',
    source: 'simpleicons',
    totalIcons: '~3000'
  }
};

// Icon Library Name Mapping
export const ICON_LIBRARY_NAMES = {
  devicon: 'Devicons',
  simpleicons: 'Simple Icons'
};

// Icon Display Configuration
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

// Popular Icons (for quick selection)
export const POPULAR_ICONS = [
  // Languages
  { name: 'javascript', library: 'devicon', category: 'language' },
  { name: 'python', library: 'devicon', category: 'language' },
  { name: 'typescript', library: 'devicon', category: 'language' },
  { name: 'java', library: 'devicon', category: 'language' },
  { name: 'go', library: 'devicon', category: 'language' },
  { name: 'rust', library: 'devicon', category: 'language' },

  // Frameworks and Libraries
  { name: 'react', library: 'devicon', category: 'framework' },
  { name: 'vue', library: 'devicon', category: 'framework' },
  { name: 'angular', library: 'devicon', category: 'framework' },
  { name: 'nextjs', library: 'simpleicons', category: 'framework' },
  { name: 'nuxtjs', library: 'simpleicons', category: 'framework' },

  // Databases
  { name: 'mongodb', library: 'devicon', category: 'database' },
  { name: 'postgresql', library: 'devicon', category: 'database' },
  { name: 'mysql', library: 'devicon', category: 'database' },

  // Cloud Services
  { name: 'aws', library: 'simpleicons', category: 'cloud' },
  { name: 'google-cloud', library: 'simpleicons', category: 'cloud' },
  { name: 'azure', library: 'simpleicons', category: 'cloud' },
  { name: 'vercel', library: 'simpleicons', category: 'cloud' },
  { name: 'netlify', library: 'simpleicons', category: 'cloud' },

  // Dev Tools
  { name: 'git', library: 'devicon', category: 'tool' },
  { name: 'docker', library: 'devicon', category: 'tool' },
  { name: 'kubernetes', library: 'devicon', category: 'tool' },
  { name: 'vscode', library: 'simpleicons', category: 'tool' },
  { name: 'github', library: 'simpleicons', category: 'tool' }
];

// Icon Categories
export const ICON_CATEGORIES = {
  language: { name: 'Languages', color: '#3178c6' },
  framework: { name: 'Frameworks', color: '#61dafb' },
  database: { name: 'Databases', color: '#4caf50' },
  cloud: { name: 'Cloud', color: '#ff9800' },
  tool: { name: 'Dev Tools', color: '#9c27b0' },
  social: { name: 'Social Media', color: '#e91e63' },
  os: { name: 'OS', color: '#795548' }
};

// Icon Search Function
export const searchIcons = (icons, searchTerm) => {
  if (!searchTerm) return icons;

  const lowerSearchTerm = searchTerm.toLowerCase();
  return icons.filter(icon =>
    icon.label.toLowerCase().includes(lowerSearchTerm) ||
    (icon.hex && icon.hex.toLowerCase().includes(lowerSearchTerm)) ||
    (icon.slug && icon.slug.toLowerCase().includes(lowerSearchTerm))
  );
};

// Icon Statistics
export const getIconStats = (icons) => {
  const stats = {
    total: icons.length,
    byLibrary: {},
    byCategory: {}
  };

  icons.forEach(icon => {
    // Stats by Library
    if (icon.source) {
      stats.byLibrary[icon.source] = (stats.byLibrary[icon.source] || 0) + 1;
    }

    // Stats by Category
    const popularIcon = POPULAR_ICONS.find(pop => pop.name === icon.value);
    if (popularIcon) {
      stats.byCategory[popularIcon.category] = (stats.byCategory[popularIcon.category] || 0) + 1;
    }
  });

  return stats;
};