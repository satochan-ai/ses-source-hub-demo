/**
 * データ取得・管理
 */
const DataLoader = {
    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} (File: ${url})`);
            const data = await response.json();
            return { data, error: null };
        } catch (e) {
            console.error(`Failed to fetch ${url}:`, e);
            return { data: [], error: e.message };
        }
    },

    async loadAllData() {
        const [projectsRes, engineersRes, skillDictRes] = await Promise.all([
            this.fetchJSON(CONFIG.PROJECT_JSON),
            this.fetchJSON(CONFIG.ENGINEER_JSON),
            this.fetchJSON(CONFIG.SKILL_DICT_JSON)
        ]);

        const errors = [projectsRes.error, engineersRes.error, skillDictRes.error].filter(err => err !== null);

        return {
            projects: projectsRes.data,
            engineers: engineersRes.data,
            skillDict: skillDictRes.data,
            errors: errors
        };
    }
};
