export class ImageHistoryService {
    constructor() {
        this.STORAGE_KEY = 'ai_image_history';
        this.MAX_HISTORY = 50;
    }

    getHistory() {
        try {
            const history = localStorage.getItem(this.STORAGE_KEY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error('Failed to load history', e);
            return [];
        }
    }

    saveImage(image) {
        try {
            const history = this.getHistory();
            const newImage = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                // 只保存必要字段和远程URL，不保存 blob URL (因为它会失效)
                url: image.remoteUrl || image.url,
                remoteUrl: image.remoteUrl,
                prompt: image.prompt,
                style: image.style,
                model: image.model,
                width: image.width,
                height: image.height
            };

            // 去重：如果 URL 已存在，移到最前
            const existingIndex = history.findIndex(item => (item.remoteUrl || item.url) === newImage.url);
            if (existingIndex !== -1) {
                history.splice(existingIndex, 1);
            }

            history.unshift(newImage);

            // 限制数量
            if (history.length > this.MAX_HISTORY) {
                history.pop();
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
            return history;
        } catch (e) {
            console.error('Failed to save image to history', e);
            return [];
        }
    }

    clearHistory() {
        localStorage.removeItem(this.STORAGE_KEY);
        return [];
    }
}

const imageHistoryService = new ImageHistoryService();
export default imageHistoryService;
