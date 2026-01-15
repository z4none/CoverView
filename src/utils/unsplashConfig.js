import { createApi } from 'unsplash-js';

const key = process.env.REACT_APP_UNSPLASH_ACCESS_KEY

if (!key) {
    console.warn('Unsplash API key not configured. Please add REACT_APP_UNSPLASH_ACCESS_KEY to your .env.local file');
}

const unsplash = createApi({
    accessKey: key || 'demo' // 使用 demo key 避免崩溃
});

export default unsplash;