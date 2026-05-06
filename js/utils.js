/**
 * ユーティリティ関数
 */
const Utils = {
    /**
     * HTMLエスケープ処理 (XSS対策)
     */
    escapeHtml(str) {
        if (!str) return '';
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, function(m) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[m];
        });
    },

    /**
     * 空値の表示用変換
     */
    displayValue(val, fallback = '-') {
        return (val === null || val === undefined || val === '') ? fallback : val;
    },

    /**
     * 単価の数値化
     */
    parsePrice(val) {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseInt(val.toString().replace(/[^0-9]/g, ''), 10) || 0;
    },

    /**
     * 数値を金額形式（3桁区切り）に変換
     */
    formatPrice(num) {
        if (!num) return '-';
        return num.toLocaleString() + '円';
    },

    /**
     * SES業界向け「万円」表記に変換
     */
    formatPriceManYen(val) {
        if (!val) return '-';
        if (typeof val === 'string' && val.includes('万')) return val;
        
        const num = this.parsePrice(val);
        if (num === 0) return '-';
        
        const manyen = num / 10000;
        return manyen.toLocaleString() + '万円';
    },

    /**
     * キーワード正規化（小文字化、トリム）
     */
    normalizeStr(str) {
        if (!str) return '';
        return str.toString().toLowerCase().trim();
    },

    /**
     * 文字列が含まれているか判定（大文字小文字無視）
     */
    includes(target, query) {
        if (!target) return false;
        if (!query) return true;
        return target.toString().toLowerCase().includes(query.toLowerCase());
    }
};
