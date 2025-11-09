// Minimal API service placeholder

export const API = {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

    async get(path: string) {
        const url = `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
    },
};
