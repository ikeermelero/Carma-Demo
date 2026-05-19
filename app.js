/**
 * Carma — Plataforma de Gestión de Talleres
 * app.js — Lógica principal de navegación e interactividad
 */

document.addEventListener('DOMContentLoaded', () => {

    // =====================================================
    // THEME
    // =====================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    const applyTheme = (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
        darkIcon.classList.toggle('hidden', isDark);
        lightIcon.classList.toggle('hidden', !isDark);
    };

    const savedTheme = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));

    themeToggleBtn?.addEventListener('click', () => {
        const isDark = document.documentElement.classList.contains('dark');
        applyTheme(!isDark);
        localStorage.setItem('color-theme', !isDark ? 'dark' : 'light');
    });

    // =====================================================
    // SIDEBAR MOBILE
    // =====================================================
    const sidebar = document.getElementById('sidebar');
    const sidebarOpen = document.getElementById('sidebar-open');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    const toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    };

    sidebarOpen?.addEventListener('click', toggleSidebar);
    sidebarOverlay?.addEventListener('click', toggleSidebar);

    // =====================================================
    // NAVIGATION
    // =====================================================

    // Map: nav id → { viewId, title, subtitle }
    const navMap = {
        'nav-dashboard':    { view: 'view-dashboard',       title: 'Dashboard',        subtitle: 'Vista general del taller — Mayo 2026' },
        'nav-repairs':      { view: 'view-repairs',         title: 'Reparaciones',     subtitle: 'Listado y kanban de todas las reparaciones activas' },
        'nav-appointments': { view: 'view-appointments',    title: 'Citas',            subtitle: 'Agenda y gestión de citas del taller' },
        'nav-mechanics':    { view: 'view-mechanics',       title: 'Mecánicos',        subtitle: 'Carga de trabajo y rendimiento por mecánico' },
        'nav-vehicles':     { view: 'view-vehicles',        title: 'Vehículos',        subtitle: 'Flota registrada e historial de reparaciones' },
        'nav-clients':      { view: 'view-clients',         title: 'Clientes',         subtitle: 'Directorio de clientes y su historial' },
        'nav-workshops':    { view: 'view-workshops',       title: 'Talleres',         subtitle: 'Gestión multisede — todas las sedes activas' },
        'nav-users':        { view: 'view-users',           title: 'Configuración',    subtitle: 'Usuarios, roles y preferencias del sistema' },
    };

    const pageTitle    = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    const allViews   = document.querySelectorAll('#content > div');
    const allNavLinks = document.querySelectorAll('.nav-link');

    const showView = (viewId, titleText, subtitleText) => {
        allViews.forEach(v => {
            if (v.id === viewId) {
                v.classList.remove('hidden');
                // Stagger fade-in on cards inside the view
                const cards = v.querySelectorAll('.bg-white, [class*="dark-card"]');
                cards.forEach((card, i) => {
                    card.style.opacity = '0';
                    card.style.animationDelay = `${i * 0.025}s`;
                    card.classList.remove('animate-fade-in');
                    void card.offsetWidth;
                    card.classList.add('animate-fade-in');
                });
            } else {
                v.classList.add('hidden');
            }
        });
        if (pageTitle)    pageTitle.textContent    = titleText    || '';
        if (pageSubtitle) pageSubtitle.textContent = subtitleText || '';
    };

    const activateNav = (navId) => {
        allNavLinks.forEach(l => {
            l.classList.remove('text-brand-primary', 'bg-brand-primary/8', 'active-nav');
            l.classList.add('text-gray-500', 'dark:text-gray-400');
        });
        const el = document.getElementById(navId);
        if (el) {
            el.classList.add('text-brand-primary', 'bg-brand-primary/8', 'active-nav');
            el.classList.remove('text-gray-500', 'dark:text-gray-400');
        }
    };

    Object.entries(navMap).forEach(([navId, cfg]) => {
        const link = document.getElementById(navId);
        if (!link) return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            activateNav(navId);
            showView(cfg.view, cfg.title, cfg.subtitle);
            // Close sidebar on mobile
            if (!sidebar.classList.contains('-translate-x-full')) toggleSidebar();
        });
    });

    // =====================================================
    // AUTH
    // =====================================================
    const authApp   = document.getElementById('auth-app');
    const mainApp   = document.getElementById('main-dashboard-app');
    const loginForm = document.getElementById('login-form');
    const navLogout = document.getElementById('nav-logout');

    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const namePart = email.split('@')[0] || 'Admin';
        const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        showToast(`¡Hola, ${displayName}! Accediendo al panel…`);

        // Update user name
        const sidebarName = document.getElementById('sidebar-user-name');
        if (sidebarName) sidebarName.textContent = displayName;

        // Transition auth → dashboard
        authApp.classList.add('opacity-0', 'transition-all', 'duration-400');
        setTimeout(() => {
            authApp.classList.add('hidden');
            mainApp.classList.remove('hidden');
            mainApp.classList.add('opacity-0');
            setTimeout(() => {
                mainApp.classList.remove('opacity-0');
                mainApp.classList.add('opacity-100', 'transition-all', 'duration-400');
                // Activate dashboard
                activateNav('nav-dashboard');
                showView('view-dashboard', 'Dashboard', 'Vista general del taller — Mayo 2026');
                startLiveTimer();
                generateCalendar();
            }, 50);
        }, 350);
    });

    navLogout?.addEventListener('click', (e) => {
        e.preventDefault();
        mainApp.classList.add('opacity-0', 'transition-all', 'duration-300');
        setTimeout(() => {
            mainApp.classList.add('hidden');
            authApp.classList.remove('hidden', 'opacity-0');
            authApp.classList.add('opacity-100');
            document.getElementById('login-password').value = '';
            showToast('Sesión cerrada correctamente');
        }, 300);
    });

    // =====================================================
    // TOAST
    // =====================================================
    const showToast = (message) => {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        if (!toast) return;
        toastMsg.textContent = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3500);
    };

    // =====================================================
    // LIVE TIMER — tarea en curso
    // =====================================================
    let timerInterval = null;

    const startLiveTimer = () => {
        if (timerInterval) return;
        let seconds = 4472; // 01:14:32
        const updateTimer = () => {
            seconds++;
            const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            const val = `${h}:${m}:${s}`;
            const timerEl = document.getElementById('live-timer');
            const timerRow = document.getElementById('live-timer-row');
            if (timerEl) timerEl.textContent = val;
            if (timerRow) timerRow.textContent = val;
        };
        timerInterval = setInterval(updateTimer, 1000);
    };

    // =====================================================
    // REPAIR DETAIL NAVIGATION
    // =====================================================
    const repairDetailView = document.getElementById('view-repair-detail');
    const repairsView      = document.getElementById('view-repairs');
    const backBtn          = document.getElementById('back-to-repairs');
    const detailRepairId   = document.getElementById('detail-repair-id');

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-open-repair]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        const repairId = btn.getAttribute('data-open-repair');
        if (detailRepairId) detailRepairId.textContent = `REP-${repairId}`;

        // Show detail view
        allViews.forEach(v => v.classList.add('hidden'));
        repairDetailView.classList.remove('hidden');
        activateNav('nav-repairs');
        if (pageTitle)    pageTitle.textContent    = `REP-${repairId}`;
        if (pageSubtitle) pageSubtitle.textContent = 'Detalle de reparación y tareas asociadas';
    });

    // Kanban card click → open detail
    document.querySelectorAll('.repair-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-open-repair]')) return; // handled above
            allViews.forEach(v => v.classList.add('hidden'));
            repairDetailView.classList.remove('hidden');
            activateNav('nav-repairs');
            if (pageTitle)    pageTitle.textContent    = 'Detalle de reparación';
            if (pageSubtitle) pageSubtitle.textContent = 'Tareas y estado de la reparación';
        });
    });

    backBtn?.addEventListener('click', () => {
        allViews.forEach(v => v.classList.add('hidden'));
        repairsView.classList.remove('hidden');
        activateNav('nav-repairs');
        if (pageTitle)    pageTitle.textContent    = 'Reparaciones';
        if (pageSubtitle) pageSubtitle.textContent = 'Listado y kanban de todas las reparaciones activas';
    });

    // =====================================================
    // REPAIRS — VIEW TOGGLE (List / Kanban)
    // =====================================================
    const btnList   = document.getElementById('btn-view-list');
    const btnKanban = document.getElementById('btn-view-kanban');
    const listView  = document.getElementById('repairs-list');
    const kanbanView = document.getElementById('repairs-kanban');

    const setListActive = () => {
        btnList.className   = 'p-1.5 bg-white dark:bg-white/10 text-brand-primary rounded-lg shadow-sm';
        btnKanban.className = 'p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-all';
        listView?.classList.remove('hidden');
        kanbanView?.classList.add('hidden');
    };

    const setKanbanActive = () => {
        btnKanban.className = 'p-1.5 bg-white dark:bg-white/10 text-brand-primary rounded-lg shadow-sm';
        btnList.className   = 'p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition-all';
        kanbanView?.classList.remove('hidden');
        listView?.classList.add('hidden');
    };

    btnList?.addEventListener('click', setListActive);
    btnKanban?.addEventListener('click', setKanbanActive);

    // =====================================================
    // REPAIRS — FILTER
    // =====================================================
    const searchInput     = document.getElementById('search-repair');
    const filterStateEl   = document.getElementById('filter-state');
    const filterPriorityEl = document.getElementById('filter-priority');

    const filterRepairs = () => {
        const q        = (searchInput?.value || '').toLowerCase().trim();
        const state    = filterStateEl?.value    || '';
        const priority = filterPriorityEl?.value || '';

        // Filter list rows
        document.querySelectorAll('.list-repair-row').forEach(row => {
            const plate    = (row.dataset.plate    || '').toLowerCase();
            const model    = (row.dataset.model    || '').toLowerCase();
            const rowState = (row.dataset.state    || '').toLowerCase();
            const rowPri   = (row.dataset.priority || '').toLowerCase();

            const matchQ   = !q       || plate.includes(q) || model.includes(q);
            const matchSt  = !state   || rowState.includes(state.replace('_', ' '));
            const matchPri = !priority|| rowPri === priority;

            row.classList.toggle('hidden', !(matchQ && matchSt && matchPri));
        });

        // Filter kanban cards
        let counts = { pendiente: 0, en_curso: 0, completado: 0 };
        document.querySelectorAll('.repair-card').forEach(card => {
            const plate    = (card.dataset.plate    || '').toLowerCase();
            const model    = (card.dataset.model    || '').toLowerCase();
            const cardState = (card.dataset.state   || '').toLowerCase();
            const cardPri  = (card.dataset.priority || '').toLowerCase();

            const matchQ   = !q       || plate.includes(q) || model.includes(q);
            const matchSt  = !state   || cardState.includes(state.replace('_', ' '));
            const matchPri = !priority|| cardPri === priority;
            const show     = matchQ && matchSt && matchPri;

            card.classList.toggle('hidden', !show);
            if (show) {
                if (cardState.includes('pendiente')) counts.pendiente++;
                else if (cardState.includes('curso')) counts.en_curso++;
                else if (cardState.includes('completado') || cardState.includes('finaliz')) counts.completado++;
            }
        });

        const cp = document.getElementById('count-pendiente');
        const cc = document.getElementById('count-en-curso');
        const co = document.getElementById('count-completado');
        if (cp) cp.textContent = counts.pendiente;
        if (cc) cc.textContent = counts.en_curso;
        if (co) co.textContent = counts.completado;
    };

    [searchInput, filterStateEl, filterPriorityEl].forEach(el => {
        el?.addEventListener('input', filterRepairs);
        el?.addEventListener('change', filterRepairs);
    });

    // =====================================================
    // CALENDAR (Citas view)
    // =====================================================
    const generateCalendar = () => {
        const grid = document.getElementById('calendar-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const year = 2026, month = 4; // May 2026 (0-indexed)
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const startOffset = (firstDay === 0 ? 6 : firstDay - 1); // Mon-based
        const daysInMonth = 31;
        const today = 18;

        // Sample events
        const events = {
            8:  [{ label: 'Cambio aceite · Ford', color: 'bg-brand-primary' }],
            12: [{ label: 'Revisión · BMW',        color: 'bg-blue-500' }],
            15: [{ label: 'Frenos · Seat',          color: 'bg-green-500' }],
            18: [
                { label: 'Cambio aceite · Ford', color: 'bg-brand-primary' },
                { label: 'Rev. ITV · Seat León', color: 'bg-amber-500' },
                { label: 'Diagnosis · Opel',     color: 'bg-gray-400' },
            ],
            22: [{ label: 'Diagnosis · Tesla',     color: 'bg-purple-500' }],
        };

        // Blank cells before first day
        for (let i = 0; i < startOffset; i++) {
            const blank = document.createElement('div');
            blank.className = 'aspect-square';
            grid.appendChild(blank);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            const isToday = d === today;
            const dayEvents = events[d] || [];

            cell.className = `aspect-square p-1 rounded-xl cursor-pointer transition-all hover:bg-brand-primary/5 border ${
                isToday
                    ? 'border-brand-primary/30 bg-brand-primary/5'
                    : 'border-transparent hover:border-brand-primary/10'
            }`;

            cell.innerHTML = `
                <span class="text-[10px] font-bold flex items-center justify-center w-5 h-5 ${
                    isToday
                        ? 'bg-brand-primary text-white rounded-full'
                        : 'text-gray-500 dark:text-gray-400'
                }">${d}</span>
                <div class="mt-0.5 space-y-0.5">
                    ${dayEvents.slice(0, 2).map(ev => `
                        <div class="text-[7px] leading-tight ${ev.color} text-white rounded px-1 py-0.5 truncate font-semibold">${ev.label}</div>
                    `).join('')}
                    ${dayEvents.length > 2 ? `<div class="text-[7px] text-gray-400 font-semibold">+${dayEvents.length - 2} más</div>` : ''}
                </div>
            `;

            cell.addEventListener('click', () => openModal(d));
            grid.appendChild(cell);
        }
    };

    // =====================================================
    // APPOINTMENT MODAL
    // =====================================================
    const modal        = document.getElementById('appointment-modal');
    const modalContent = modal?.querySelector('div');
    const closeModalBtn = document.getElementById('close-modal');
    const modalDate    = document.getElementById('modal-date');
    const apptForm     = document.getElementById('appointment-form');

    const openModal = (day) => {
        if (!modal) return;
        if (modalDate) modalDate.value = `${day} de Mayo, 2026`;
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modalContent?.classList.remove('scale-95');
        });
    };

    const closeModal = () => {
        modal?.classList.add('opacity-0');
        modalContent?.classList.add('scale-95');
        setTimeout(() => modal?.classList.add('hidden'), 200);
    };

    closeModalBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    apptForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const submit = apptForm.querySelector('button[type="submit"]');
        const original = submit.textContent;
        submit.textContent = 'Agendando…';
        submit.disabled = true;
        setTimeout(() => {
            showToast(`Cita agendada para el ${modalDate?.value}`);
            closeModal();
            setTimeout(() => {
                submit.textContent = original;
                submit.disabled = false;
                apptForm.reset();
            }, 200);
        }, 600);
    });

    // =====================================================
    // INITIAL STATE — show auth, hide dashboard
    // =====================================================
    // Already set in HTML, but make sure theme icons are right on load
    // (applyTheme already called above)

});