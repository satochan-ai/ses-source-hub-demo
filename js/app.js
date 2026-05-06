/**
 * メインアプリケーション制御
 */
class App {
    constructor() {
        this.allProjects = [];
        this.allEngineers = [];
        this.skillDict = {};
        
        this.init();
    }

    async init() {
        // データロード
        const data = await DataLoader.loadAllData();
        this.allProjects = data.projects;
        this.allEngineers = data.engineers;
        this.skillDict = data.skillDict;

        // エラー表示
        if (data.errors && data.errors.length > 0) {
            this.showErrors(data.errors);
        }

        // UI初期化
        Renderer.renderSummary(this.allProjects, this.allEngineers);
        Renderer.renderFilters(this.allProjects, this.allEngineers, this.skillDict);
        
        // 初回表示（案件一覧）
        this.executeSearch();

        // イベント登録
        this.bindEvents();
    }

    showErrors(errors) {
        const container = document.getElementById('error-container');
        if (!container) return;
        
        errors.forEach(err => {
            const div = document.createElement('div');
            div.className = 'error-message';
            div.textContent = `データファイルの読み込みに失敗しました: ${err}`;
            container.appendChild(div);
        });
    }

    bindEvents() {
        const form = document.getElementById('search-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.executeSearch();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            // フォームをクリア
            form.reset();
            
            // 明示的にセレクトボックス等もリセット（ブラウザの挙動対策）
            const selects = form.querySelectorAll('select');
            selects.forEach(s => s.selectedIndex = 0);
            
            // 再検索（現在のタブで全件表示）
            this.executeSearch();
        });

        // タブ切り替え・セレクトボックス変更で自動検索
        const autoTriggerElements = form.querySelectorAll('input[name="dataType"], select');
        autoTriggerElements.forEach(el => {
            el.addEventListener('change', () => this.executeSearch());
        });
    }

    executeSearch() {
        const form = document.getElementById('search-form');
        const formData = new FormData(form);
        
        const dataType = formData.get('dataType');
        const criteria = {
            keyword: document.getElementById('keyword').value,
            skill: document.getElementById('filter-skill').value,
            partnerId: document.getElementById('filter-partner').value,
            remoteType: document.getElementById('filter-remote').value,
            priceMin: parseInt(document.getElementById('price-min').value, 10) || null,
            priceMax: parseInt(document.getElementById('price-max').value, 10) || null
        };

        const targetData = dataType === DATA_TYPE.PROJECT ? this.allProjects : this.allEngineers;
        const filteredData = Search.filter(targetData, criteria, dataType, this.skillDict);

        Renderer.renderResults(filteredData, dataType);
    }
}

// 起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
