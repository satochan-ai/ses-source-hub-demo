/**
 * 描画処理
 */
const Renderer = {
    /**
     * スキルタグの生成
     */
    createSkillTags(skillsStr, isRequired = false) {
        if (!skillsStr) return `<span class="text-muted">${Utils.escapeHtml('未設定')}</span>`;
        const skills = skillsStr.split(/[,、/ ]+/).filter(s => s.trim());
        if (skills.length === 0) return `<span class="text-muted">${Utils.escapeHtml('未設定')}</span>`;
        
        return `
            <div class="skill-tag-container">
                ${skills.map(s => `<span class="skill-tag ${isRequired ? 'required' : ''}">${Utils.escapeHtml(s)}</span>`).join('')}
            </div>
        `;
    },

    /**
     * 案件カードのHTML生成
     */
    createProjectCard(project) {
        return `
            <div class="card type-project">
                <div class="card-header">
                    <span class="card-type-badge">案件</span>
                    <h3 class="card-title">${Utils.escapeHtml(Utils.displayValue(project.title))}</h3>
                    <div class="partner-badge">${Utils.escapeHtml(Utils.displayValue(project.partner_name))}</div>
                </div>
                <div class="card-body">
                    <div class="card-info-item">
                        <div class="label">必須スキル</div>
                        <div class="value">${this.createSkillTags(project.required_skills, true)}</div>
                    </div>
                    <div class="card-info-item">
                        <div class="label">尚可スキル</div>
                        <div class="value">${this.createSkillTags(project.preferred_skills)}</div>
                    </div>
                    <div class="card-info-item">
                        <div class="label">概要</div>
                        <div class="value">${Utils.escapeHtml(Utils.displayValue(project.overview))}</div>
                    </div>
                    <div class="card-info-item">
                        <div class="label">勤務地 / リモート</div>
                        <div class="value">${Utils.escapeHtml(Utils.displayValue(project.location))} / ${Utils.escapeHtml(Utils.displayValue(project.remote_type))}</div>
                    </div>
                    <div class="card-info-item">
                        <div class="label">開始時期</div>
                        <div class="value">${Utils.escapeHtml(Utils.displayValue(project.start_date))}</div>
                    </div>
                    ${project.note ? `
                    <div class="card-info-item">
                        <div class="label">備考</div>
                        <div class="value">${Utils.escapeHtml(project.note)}</div>
                    </div>` : ''}
                </div>
                <div class="card-footer">
                    <div class="price-tag">${Utils.escapeHtml(Utils.formatPriceManYen(project.price))}</div>
                    <div class="update-date">${Utils.escapeHtml(Utils.displayValue(project.imported_at))} 取得</div>
                </div>
            </div>
        `;
    },

    /**
     * 人材カードのHTML生成
     */
    createEngineerCard(engineer) {
        return `
            <div class="card type-engineer">
                <div class="card-header">
                    <span class="card-type-badge">人材</span>
                    <h3 class="card-title">${Utils.escapeHtml(Utils.displayValue(engineer.name))}</h3>
                    <div class="partner-badge">${Utils.escapeHtml(Utils.displayValue(engineer.partner_name))}</div>
                </div>
                <div class="card-body">
                    <div class="card-info-item">
                        <div class="label">職種</div>
                        <div class="value">${Utils.escapeHtml(Utils.displayValue(engineer.role))} (${Utils.escapeHtml(Utils.displayValue(engineer.age))}歳)</div>
                    </div>
                    <div class="card-info-item">
                        <div class="label">スキル</div>
                        <div class="value">${this.createSkillTags(engineer.skills, true)}</div>
                    </div>
                    <div class="card-info-item">
                        <div class="label">最寄り / リモート希望</div>
                        <div class="value">${Utils.escapeHtml(Utils.displayValue(engineer.nearest_station))} / ${Utils.escapeHtml(Utils.displayValue(engineer.remote_preference))}</div>
                    </div>
                    <div class="card-info-item">
                        <div class="label">稼働開始日</div>
                        <div class="value">${Utils.escapeHtml(Utils.displayValue(engineer.available_date))}</div>
                    </div>
                    ${engineer.note ? `
                    <div class="card-info-item">
                        <div class="label">備考</div>
                        <div class="value">${Utils.escapeHtml(engineer.note)}</div>
                    </div>` : ''}
                </div>
                <div class="card-footer">
                    <div class="price-tag">${Utils.escapeHtml(Utils.formatPriceManYen(engineer.price))}</div>
                    <div class="update-date">${Utils.escapeHtml(Utils.displayValue(engineer.imported_at))} 取得</div>
                </div>
            </div>
        `;
    },

    /**
     * 結果一覧の描画
     */
    renderResults(items, type) {
        const container = document.getElementById('results-container');
        const countText = document.getElementById('results-count-text');
        
        container.innerHTML = '';
        countText.textContent = `表示件数：${items.length}件`;

        if (items.length === 0) {
            container.innerHTML = '<div class="no-results">検索条件に一致するデータはありません。</div>';
            return;
        }

        const html = items.map(item => {
            return type === DATA_TYPE.PROJECT 
                ? this.createProjectCard(item) 
                : this.createEngineerCard(item);
        }).join('');

        container.innerHTML = html;
    },

    /**
     * サマリー情報の描画
     */
    renderSummary(projects, engineers) {
        document.getElementById('summary-projects-count').textContent = projects.length;
        document.getElementById('summary-engineers-count').textContent = engineers.length;
        
        const partners = new Set([
            ...projects.map(p => p.partner_id),
            ...engineers.map(e => e.partner_id)
        ]);
        document.getElementById('summary-partners-count').textContent = partners.size;

        const dates = [
            ...projects.map(p => p.imported_at),
            ...engineers.map(e => e.imported_at)
        ].filter(d => d).sort();
        
        document.getElementById('summary-last-update').textContent = dates.length > 0 ? dates[dates.length - 1] : '-';
    },

    /**
     * フィルタオプションの生成
     */
    renderFilters(projects, engineers, skillDict) {
        const skillSelect = document.getElementById('filter-skill');
        const partnerSelect = document.getElementById('filter-partner');
        const remoteSelect = document.getElementById('filter-remote');

        // スキル選択（辞書から取得）
        if (skillDict) {
            Object.keys(skillDict).sort().forEach(skill => {
                const opt = document.createElement('option');
                opt.value = skill;
                opt.textContent = skill;
                skillSelect.appendChild(opt);
            });
        }

        // 取引先
        const partners = new Map();
        [...projects, ...engineers].forEach(item => {
            if (item.partner_id) partners.set(item.partner_id, item.partner_name);
        });

        const sortedPartners = Array.from(partners.entries()).sort((a, b) => a[1].localeCompare(b[1]));
        sortedPartners.forEach(([id, name]) => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = name;
            partnerSelect.appendChild(opt);
        });

        // リモート
        REMOTE_TYPES.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.textContent = type;
            remoteSelect.appendChild(opt);
        });
    }
};
