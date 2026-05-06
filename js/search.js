/**
 * 検索ロジック
 */
const Search = {
    /**
     * データのフィルタリング
     * @param {Array} data 対象データ
     * @param {Object} criteria 検索条件
     * @param {string} dataType データ種別
     * @param {Object} skillDict スキル辞書
     */
    filter(data, criteria, dataType, skillDict = {}) {
        return data.filter(item => {
            // キーワード検索（案件名、スキル、概要、名前など）
            if (criteria.keyword) {
                const kw = criteria.keyword.toLowerCase();
                const searchableText = dataType === DATA_TYPE.PROJECT
                    ? `${item.title} ${item.required_skills} ${item.overview} ${item.partner_name}`
                    : `${item.name} ${item.skills} ${item.role} ${item.partner_name}`;
                
                if (!searchableText.toLowerCase().includes(kw)) return false;
            }

            // スキル辞書検索 (criteria.skill が指定されている場合)
            if (criteria.skill) {
                const dictEntry = skillDict[criteria.skill];
                const targetText = dataType === DATA_TYPE.PROJECT
                    ? `${item.required_skills} ${item.preferred_skills}`
                    : item.skills;
                
                if (dictEntry) {
                    // ポジティブリスト (本人 + aliases + related)
                    const searchTerms = [criteria.skill, ...(dictEntry.aliases || []), ...(dictEntry.related || [])];
                    const hasPositiveMatch = searchTerms.some(term => Utils.includes(targetText, term));

                    // ネガティブリスト (exclude)
                    const excludeTerms = dictEntry.exclude || [];
                    const hasExcludeMatch = excludeTerms.some(term => Utils.includes(targetText, term));

                    // ロジック:
                    // 1. ポジティブ一致がない場合は除外
                    if (!hasPositiveMatch) return false;

                    // 2. ネガティブ一致があり、かつ「本人/aliases」の一致がない場合は除外（JavaScriptのみ等を防ぐ）
                    if (hasExcludeMatch) {
                        const mainTerms = [criteria.skill, ...(dictEntry.aliases || [])];
                        const hasMainMatch = mainTerms.some(term => Utils.includes(targetText, term));
                        if (!hasMainMatch) return false;
                    }
                } else {
                    // 辞書にない場合は単純一致
                    if (!Utils.includes(targetText, criteria.skill)) return false;
                }
            }

            // 取引先フィルタ
            if (criteria.partnerId && item.partner_id !== criteria.partnerId) {
                return false;
            }

            // リモートフィルタ
            if (criteria.remoteType) {
                const remoteVal = dataType === DATA_TYPE.PROJECT ? item.remote_type : item.remote_preference;
                if (!Utils.includes(remoteVal, criteria.remoteType)) return false;
            }

            // 単価フィルタ (UI側は万円単位で入力)
            const price = Utils.parsePrice(item.price);
            if (criteria.priceMin && price < (criteria.priceMin * 10000)) return false;
            if (criteria.priceMax && price > (criteria.priceMax * 10000)) return false;

            return true;
        });
    }
};
