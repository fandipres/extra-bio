document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateCopyrightYear();

    const gridContainer = document.getElementById('project-grid');
    if (typeof projects !== 'undefined' && gridContainer) {
        
        window.devProjects = projects.filter(p => p.tags && (p.tags.includes('Android') || p.tags.includes('Web')));
        window.hiddenTags = ["Blog", "Video", "Social", "Religi", "Musik", "Pendidikan", "Ngoding"];
        window.hiddenLinkLabels = ["Facebook", "Instagram", "Tiktok", "YouTube"];

        initLanguage();
        initView();
        initGlobalShare();
        setupFilters();
        renderGrid('all');
    }
});

function updateCopyrightYear() {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
    }

    themeToggle.onclick = () => {
        let targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
        themeToggle.textContent = targetTheme === 'dark' ? '☀️' : '🌙';
    };
}

function initView() {
    const gridViewBtn = document.getElementById('view-grid');
    const listViewBtn = document.getElementById('view-list');
    if (!gridViewBtn || !listViewBtn) return;

    const savedView = localStorage.getItem('view') || 'grid';
    applyView(savedView);

    gridViewBtn.addEventListener('click', () => applyView('grid'));
    listViewBtn.addEventListener('click', () => applyView('list'));
}

function applyView(view) {
    const projectGrid = document.getElementById('project-grid');
    const gridViewBtn = document.getElementById('view-grid');
    const listViewBtn = document.getElementById('view-list');
    if (!projectGrid || !gridViewBtn || !listViewBtn) return;

    if (view === 'list') {
        projectGrid.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    } else {
        projectGrid.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    }
    localStorage.setItem('view', view);
}

let currentLang = localStorage.getItem('lang') || 'id';

const translations = {
    id: { 
        filterAll: "Semua", privacy: "Kebijakan Privasi", terms: "Syarat & Ketentuan", 
        disclaimer: "Penyangkalan", emptyMsg: "Belum ada aplikasi.", comingSoon: "Segera Hadir",
        personalSite: "Situs Utama",
        role: 'Daftar aplikasi buatan FanTech. Temukan profil developer saya di <a href="https://play.google.com/store/apps/dev?id=6656368610151840421" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: none; font-weight: 500;">Google Play</a>.' 
    },
    en: { 
        filterAll: "All", privacy: "Privacy Policy", terms: "Terms & Conditions", 
        disclaimer: "Disclaimer", emptyMsg: "No apps available.", comingSoon: "Coming Soon",
        personalSite: "Main Site",
        role: 'List of apps built by FanTech. Find my developer profile on <a href="https://play.google.com/store/apps/dev?id=6656368610151840421" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: none; font-weight: 500;">Google Play</a>.' 
    }
};

function initLanguage() {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;

    langToggle.textContent = currentLang.toUpperCase();
    applyStaticTranslations();

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'id' ? 'en' : 'id';
        localStorage.setItem('lang', currentLang);
        langToggle.textContent = currentLang.toUpperCase();
        
        applyStaticTranslations();
        
        const activeFilterBtn = document.querySelector('.filter-pill.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        renderGrid(activeFilter);
    });
}

function applyStaticTranslations() {
    const t = translations[currentLang];
    
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    setText('text-filter-all', t.filterAll);
    setText('text-privacy', t.privacy);
    setText('text-terms', t.terms);
    setText('text-disclaimer', t.disclaimer);
    setText('text-personal-site', t.personalSite);
    setHTML('text-role', t.role);
}

function initGlobalShare() {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', () => {
        const title = "FanTech";
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: title,
                text: currentLang === 'id' ? "Daftar aplikasi buatan @fandipres." : "List of apps built by @fandipres.",
                url: url
            }).catch(err => console.log('Gagal membagikan', err));
        } else {
            navigator.clipboard.writeText(url).then(() => {
                alert(currentLang === 'id' ? "Link disalin!" : "Link copied!");
            });
        }
    });
}

function setupFilters() {
    const filterContainer = document.getElementById('filter-container');
    if (!filterContainer) return;

    const allTags = new Set();
    
    devProjects.forEach(p => { 
        if(p.tags) {
            p.tags.forEach(t => {
                if (!hiddenTags.includes(t)) allTags.add(t);
            });
        } 
    });

    Array.from(allTags).sort().forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-pill';
        btn.setAttribute('data-filter', tag);
        btn.textContent = tag;
        btn.addEventListener('click', (e) => handleFilterClick(e, tag));
        filterContainer.appendChild(btn);
    });

    const filterAllBtn = document.getElementById('text-filter-all');
    if (filterAllBtn) {
        filterAllBtn.addEventListener('click', (e) => handleFilterClick(e, 'all'));
    }
}

function handleFilterClick(e, filterValue) {
    document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    renderGrid(filterValue);
}

function renderGrid(filter) {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    grid.innerHTML = ''; 

    const filtered = filter === 'all' ? devProjects : devProjects.filter(p => p.tags && p.tags.includes(filter));

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="text-align:center; color:var(--text-secondary); grid-column: 1 / -1; padding: 40px 0;">${translations[currentLang].emptyMsg}</p>`;
        return;
    }

    const linkIconSVG = `<svg fill="none" height="11" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="11"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>`;

    filtered.forEach(project => {
        const card = document.createElement('article');
        card.className = 'project-card saas-panel';

        const titleText = (project.title[currentLang] && project.title[currentLang].trim() !== "") ? project.title[currentLang] : project.title['id'];
        const descText = (project.description[currentLang] && project.description[currentLang].trim() !== "") ? project.description[currentLang] : project.description['id'];

        let linksHtml = '<div class="card-links-minimal">';
        
        let visibleLinks = [];
        if (project.links && project.links.length > 0) {
            visibleLinks = project.links.filter(link => !hiddenLinkLabels.includes(link.label));
        }

        if (visibleLinks.length > 0) {
            visibleLinks.forEach((link, index) => {
                if (index === 0) {
                    linksHtml += `<a href="${link.url}" target="_blank" rel="noopener" class="minimal-link primary">${link.label} ${linkIconSVG}</a>`;
                } else {
                    linksHtml += `<a href="${link.url}" target="_blank" rel="noopener" class="minimal-link">${link.label}</a>`;
                }
            });
        } else {
            linksHtml += `<span class="minimal-link disabled">${translations[currentLang].comingSoon}</span>`;
        }
        linksHtml += '</div>';

        card.innerHTML = `
            <div class="card-content">
                <h3 class="card-title">${titleText}</h3>
                <p class="card-desc">${descText}</p>
            </div>
            ${linksHtml}
        `;

        grid.appendChild(card);
    });
}