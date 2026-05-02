/**
 * Application Logic for SyncSpace Team Collaboration Tool
 * Focuses on drag-and-drop mechanics, accessibility, and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Auth Logic ----
    const loginForm = document.getElementById('loginForm');
    const authOverlay = document.getElementById('authOverlay');
    const oauthBtn = document.getElementById('oauthBtn');
    const guestBtn = document.getElementById('guestBtn');

    function handleLogin(e, isGuest = false) {
        if(e) e.preventDefault();
        
        if (isGuest) {
            // Update profile for guest
            const userNameEl = document.querySelector('.user-name');
            const userRoleEl = document.querySelector('.user-role');
            const userAvatar = document.querySelector('.user-profile .avatar');
            
            if (userNameEl) userNameEl.textContent = 'Guest User';
            if (userRoleEl) userRoleEl.textContent = 'Viewer';
            if (userAvatar) userAvatar.src = 'https://ui-avatars.com/api/?name=Guest+User&background=random';
        }
        
        // Simulate auth
        authOverlay.classList.add('hidden');
    }

    if (loginForm) loginForm.addEventListener('submit', (e) => handleLogin(e, false));
    if (oauthBtn) oauthBtn.addEventListener('click', (e) => handleLogin(e, false));
    if (guestBtn) guestBtn.addEventListener('click', (e) => handleLogin(e, true));

    // ---- Elements ----
    const lists = document.querySelectorAll('.task-list');
    
    const newTaskBtn = document.getElementById('newTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const newTaskForm = document.getElementById('newTaskForm');
    
    let draggedTask = null;

    const defaultTasks = [
        { id: 'task-1', status: 'todo', title: 'Design Platform Architecture', desc: 'Draft the initial wireframes and system architecture.', category: 'design', assignees: ['Alex M'] },
        { id: 'task-2', status: 'todo', title: 'Setup Authentication', desc: 'Implement secure OAuth2 login.', category: 'dev', assignees: ['Sam K', 'Jane'] },
        { id: 'task-3', status: 'inprogress', title: 'Build Kanban Interface', desc: 'Develop drag and drop functionality.', category: 'dev', assignees: ['John D'] },
        { id: 'task-4', status: 'review', title: 'Draft Release Notes', desc: 'Write documentation.', category: 'marketing', assignees: ['Sarah W'] },
        { id: 'task-5', status: 'done', title: 'Create Brand Guidelines', desc: 'Establish color palette.', category: 'design', assignees: ['Alex M'] }
    ];

    let appTasks = JSON.parse(localStorage.getItem('syncspace_tasks'));
    if (!appTasks || appTasks.length === 0) {
        appTasks = defaultTasks;
        localStorage.setItem('syncspace_tasks', JSON.stringify(appTasks));
    }

    function saveTasks() {
        localStorage.setItem('syncspace_tasks', JSON.stringify(appTasks));
    }

    // ---- Drag and Drop Functionality ----

    lists.forEach(list => {
        list.addEventListener('dragover', e => {
            e.preventDefault(); // Necessary to allow dropping
            list.classList.add('drag-over');
        });

        list.addEventListener('dragleave', () => {
            list.classList.remove('drag-over');
        });

        list.addEventListener('drop', e => {
            e.preventDefault();
            list.classList.remove('drag-over');
            
            if (draggedTask) {
                list.appendChild(draggedTask);
                
                const taskId = draggedTask.id;
                const newStatus = list.id.replace('-list', '');
                const taskIndex = appTasks.findIndex(t => t.id === taskId);
                if (taskIndex > -1) {
                    appTasks[taskIndex].status = newStatus;
                    saveTasks();
                }

                // If dropped in Done, add visual styling
                if (list.id === 'done-list') {
                    draggedTask.classList.add('done');
                    // Add check icon if not exists
                    const meta = draggedTask.querySelector('.task-meta');
                    if (meta && !meta.innerHTML.includes('fa-check-circle')) {
                         meta.innerHTML = '<i class="fa-solid fa-check-circle" style="color: var(--success-color)"></i>';
                    }
                } else {
                    draggedTask.classList.remove('done');
                }
                
                updateTaskCounts();
            }
        });
    });

    function setupTaskEvents(task) {
        task.addEventListener('dragstart', () => {
            draggedTask = task;
            setTimeout(() => task.classList.add('dragging'), 0);
        });

        task.addEventListener('dragend', () => {
            draggedTask = null;
            task.classList.remove('dragging');
        });

        // Accessibility: Keyboard movement (basic implementation)
        task.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openTaskDetail(task);
            }
        });

        // Open detail modal on click
        task.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('a')) return;
            openTaskDetail(task);
        });
    }

    // ---- Task Detail Modal Content Logic ----
    function openTaskDetail(task) {
        const detailModal = document.getElementById('taskDetailModal');
        const titleEl = document.getElementById('detailModalTitle');
        const labelsEl = document.getElementById('detailModalLabels');
        const descEl = document.getElementById('detailModalDesc');
        const bodyEl = document.getElementById('detailModalBody');
        
        if (!detailModal) return;

        // Extract data from card
        const title = task.querySelector('.task-title').textContent;
        const desc = task.querySelector('.task-desc').textContent;
        const labelsHTML = task.querySelector('.task-labels').innerHTML;

        titleEl.textContent = title;
        descEl.textContent = desc;
        labelsEl.innerHTML = labelsHTML;

        // Custom Creative Content per Task
        let customContent = '';
        const taskId = task.id;

        if (taskId === 'task-1') {
            customContent = `
            <div class="architecture-diagram" style="display: flex; gap: 2rem; justify-content: center; align-items: center; padding: 2rem; background: var(--bg-tertiary); border-radius: 8px;">
               <div style="text-align: center;"><div style="padding: 1rem; background: var(--accent-primary); color: white; border-radius: 8px; font-weight: 600; box-shadow: 0 0 15px var(--accent-primary);">Frontend App</div></div>
               <i class="fa-solid fa-arrow-right-arrow-left" style="color: var(--text-secondary); font-size: 1.5rem;"></i>
               <div style="text-align: center;"><div style="padding: 1rem; background: var(--success-color); color: white; border-radius: 8px; font-weight: 600;">API Gateway</div></div>
               <i class="fa-solid fa-arrow-right" style="color: var(--text-secondary); font-size: 1.5rem;"></i>
               <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <div style="padding: 1rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; text-align: center;">Auth Service</div>
                  <div style="padding: 1rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; text-align: center;">Task Service</div>
               </div>
            </div>
            `;
        } else if (taskId === 'task-2') {
            customContent = `
            <div style="text-align: center; padding: 2rem; background: var(--bg-tertiary); border-radius: 8px;">
               <h3 style="margin-bottom: 1rem;">Authenticator Setup</h3>
               <p style="color: var(--text-secondary); margin-bottom: 2rem;">Scan the QR code below with your mobile authenticator app to enable Two-Factor Authentication.</p>
               <div style="background: white; padding: 1rem; display: inline-block; border-radius: 8px; margin-bottom: 1.5rem;">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=syncspace-auth-12345" alt="QR Code" width="150" height="150">
               </div>
               <br>
               <button class="primary-btn" style="margin: 0 auto;">Verify Code</button>
            </div>
            `;
        } else if (taskId === 'task-3') {
            customContent = `
            <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 8px; display: flex; gap: 1rem;">
                <div style="flex: 1; border: 2px dashed var(--border-color); border-radius: 8px; padding: 1rem; min-height: 150px;">
                    <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; margin-bottom: 1rem;"></div>
                    <div style="width: 100%; height: 40px; background: var(--bg-main); border-radius: 4px; margin-bottom: 0.5rem;"></div>
                    <div style="width: 100%; height: 40px; background: var(--bg-main); border-radius: 4px;"></div>
                </div>
                <div style="flex: 1; border: 2px dashed var(--border-color); border-radius: 8px; padding: 1rem; min-height: 150px;">
                    <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; margin-bottom: 1rem;"></div>
                    <div style="width: 100%; height: 40px; background: var(--accent-primary); border-radius: 4px; opacity: 0.5;"></div>
                </div>
            </div>
            <p style="text-align: center; margin-top: 1rem; color: var(--text-secondary);">Interactive Drag & Drop Wireframe Model</p>
            `;
        } else if (taskId === 'task-4') {
            customContent = `
            <div style="background: var(--bg-tertiary); padding: 2rem; border-radius: 8px; font-family: monospace;">
                <h1 style="color: var(--accent-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">SyncSpace v1.0.0 Release</h1>
                <ul style="list-style-type: none; padding-left: 0; color: var(--text-primary); line-height: 2;">
                    <li><span style="color: var(--success-color);">[FEATURE]</span> Added Real-time Kanban Drag & Drop</li>
                    <li><span style="color: var(--success-color);">[FEATURE]</span> Integrated Multi-Channel Chat System</li>
                    <li><span style="color: var(--warning-color);">[UPDATE]</span> Overhauled Dark Mode UI Palette</li>
                    <li><span style="color: var(--danger-color);">[FIX]</span> Resolved authentication timeout issues</li>
                </ul>
            </div>
            `;
        } else if (taskId === 'task-5') {
            customContent = `
            <div style="display: flex; flex-direction: column; gap: 2rem; background: var(--bg-tertiary); padding: 2rem; border-radius: 8px;">
                <div>
                    <h3 style="margin-bottom: 1rem;">Color Palette</h3>
                    <div style="display: flex; gap: 1rem;">
                        <div style="flex: 1; height: 80px; background: #6366f1; border-radius: 8px; display: flex; align-items: flex-end; padding: 0.5rem; font-weight: bold; color: white;">Indigo</div>
                        <div style="flex: 1; height: 80px; background: #ec4899; border-radius: 8px; display: flex; align-items: flex-end; padding: 0.5rem; font-weight: bold; color: white;">Pink</div>
                        <div style="flex: 1; height: 80px; background: #0f111a; border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: flex-end; padding: 0.5rem; font-weight: bold; color: white;">Dark Base</div>
                        <div style="flex: 1; height: 80px; background: #10b981; border-radius: 8px; display: flex; align-items: flex-end; padding: 0.5rem; font-weight: bold; color: white;">Emerald</div>
                    </div>
                </div>
                <div>
                    <h3 style="margin-bottom: 1rem;">Typography</h3>
                    <div style="background: var(--bg-main); padding: 1.5rem; border-radius: 8px;">
                        <h1 style="font-family: 'Inter', sans-serif; font-weight: 700; color: var(--text-primary);">Inter Bold 700 - Headers</h1>
                        <p style="font-family: 'Inter', sans-serif; font-weight: 400; color: var(--text-secondary);">Inter Regular 400 - Body Text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                </div>
            </div>
            `;
        } else {
            customContent = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No additional details attached to this task.</p>`;
        }

        bodyEl.innerHTML = customContent;

        detailModal.classList.add('active');
        detailModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function updateTaskCounts() {
        document.querySelectorAll('.kanban-column').forEach(col => {
            const visibleTasks = Array.from(col.querySelectorAll('.task-card')).filter(task => task.style.display !== 'none').length;
            col.querySelector('.task-count').textContent = visibleTasks;
        });
    }

    // ---- Modal Functionality ----

    function openModal() {
        taskModal.classList.add('active');
        taskModal.setAttribute('aria-hidden', 'false');
        document.getElementById('taskTitleInput').focus();
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        taskModal.classList.remove('active');
        taskModal.setAttribute('aria-hidden', 'true');
        newTaskForm.reset();
        document.body.style.overflow = '';
        newTaskBtn.focus(); // Return focus for accessibility
    }

    newTaskBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close on click outside
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (taskModal.classList.contains('active')) {
                closeModal();
            }
            if (inviteModal && inviteModal.classList.contains('active')) {
                inviteModal.classList.remove('active');
                inviteModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
            const detailModal = document.getElementById('taskDetailModal');
            if (detailModal && detailModal.classList.contains('active')) {
                detailModal.classList.remove('active');
                detailModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
            const notificationModal = document.getElementById('notificationModal');
            if (notificationModal && notificationModal.classList.contains('active')) {
                notificationModal.classList.remove('active');
                notificationModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        }
    });

    const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
    if (closeDetailModalBtn) {
        closeDetailModalBtn.addEventListener('click', () => {
            const detailModal = document.getElementById('taskDetailModal');
            detailModal.classList.remove('active');
            detailModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });
    }
    
    const taskDetailModal = document.getElementById('taskDetailModal');
    if (taskDetailModal) {
        taskDetailModal.addEventListener('click', (e) => {
            if (e.target === taskDetailModal) {
                taskDetailModal.classList.remove('active');
                taskDetailModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });
    }

    // ---- Notification Logic ----
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationModal = document.getElementById('notificationModal');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');
    const notificationDot = document.getElementById('notificationDot');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            notificationModal.classList.add('active');
            notificationModal.setAttribute('aria-hidden', 'false');
            if (notificationDot) notificationDot.style.display = 'none';
            // Don't hide overflow so it feels like a dropdown
        });
    }

    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', () => {
            notificationModal.classList.remove('active');
            notificationModal.setAttribute('aria-hidden', 'true');
        });
    }

    if (notificationModal) {
        notificationModal.addEventListener('click', (e) => {
            if (e.target === notificationModal) {
                notificationModal.classList.remove('active');
                notificationModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // ---- Render Tasks (CRUD) ----
    function renderTasks() {
        document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

        appTasks.forEach(task => {
            let labelClass = 'label-design';
            let labelText = 'Design';
            if (task.category === 'dev') { labelClass = 'label-dev'; labelText = 'Development'; }
            else if (task.category === 'marketing') { labelClass = 'label-marketing'; labelText = 'Marketing'; }

            const assigneesHTML = task.assignees.map(name => `<img src="https://ui-avatars.com/api/?name=${name.replace(' ','+')}&background=random" alt="${name}" class="avatar-small">`).join('');

            const taskHTML = `
                <button class="delete-task-btn" data-id="${task.id}" style="position:absolute; top: 8px; right: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; z-index: 2;"><i class="fa-solid fa-trash" style="pointer-events: none;"></i></button>
                <div class="task-labels">
                    <span class="label ${labelClass}">${labelText}</span>
                </div>
                <h4 class="task-title">${task.title}</h4>
                <p class="task-desc">${task.desc || 'No description provided.'}</p>
                <div class="task-footer">
                    <div class="task-assignees">
                        ${assigneesHTML || '<img src="https://ui-avatars.com/api/?name=User&background=random" alt="Unassigned" class="avatar-small">'}
                    </div>
                    <div class="task-meta">
                        ${task.status === 'done' ? '<i class="fa-solid fa-check-circle" style="color: var(--success-color)"></i>' : '<i class="fa-regular fa-comment"></i> 0'}
                    </div>
                </div>
            `;
            
            const newTask = document.createElement('div');
            newTask.className = 'task-card' + (task.status === 'done' ? ' done' : '');
            newTask.draggable = true;
            newTask.id = task.id;
            newTask.tabIndex = 0;
            newTask.style.position = 'relative';
            newTask.innerHTML = taskHTML;
            
            setupTaskEvents(newTask);
            
            const listEl = document.getElementById(task.status + '-list');
            if (listEl) listEl.appendChild(newTask);
        });

        updateTaskCounts();
        if (typeof applyFilter === 'function') applyFilter();
    }

    // Event delegation for deleting tasks
    const kanbanBoard = document.querySelector('.kanban-board');
    if (kanbanBoard) {
        kanbanBoard.addEventListener('click', (e) => {
            if (e.target.closest('.delete-task-btn')) {
                e.stopPropagation(); // prevent opening the modal
                const btn = e.target.closest('.delete-task-btn');
                const taskId = btn.getAttribute('data-id');
                appTasks = appTasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }
        });
    }

    // ---- Create New Task ----
    newTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('taskTitleInput').value;
        const desc = document.getElementById('taskDescInput').value;
        const category = document.getElementById('taskCategoryInput').value;
        
        const newTaskObj = {
            id: 'task-' + Date.now(),
            status: 'todo',
            title: title,
            desc: desc,
            category: category,
            assignees: ['Jane'] // Default to Jane for demo
        };
        
        appTasks.push(newTaskObj);
        saveTasks();
        renderTasks();
        closeModal();
    });

    // ---- Invite Modal Logic ----
    const inviteTeamBtn = document.getElementById('inviteTeamBtn');
    const inviteModal = document.getElementById('inviteModal');
    const closeInviteModalBtn = document.getElementById('closeInviteModalBtn');
    const copyInviteBtn = document.getElementById('copyInviteBtn');
    const inviteLinkInput = document.getElementById('inviteLinkInput');

    if (inviteTeamBtn) {
        inviteTeamBtn.addEventListener('click', () => {
            inviteModal.classList.add('active');
            inviteModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeInviteModalBtn) {
        closeInviteModalBtn.addEventListener('click', () => {
            inviteModal.classList.remove('active');
            inviteModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });
    }

    if (copyInviteBtn) {
        copyInviteBtn.addEventListener('click', () => {
            inviteLinkInput.select();
            document.execCommand('copy');
            const originalText = copyInviteBtn.textContent;
            copyInviteBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyInviteBtn.textContent = originalText;
            }, 2000);
        });
    }

    if (inviteModal) {
        inviteModal.addEventListener('click', (e) => {
            if (e.target === inviteModal) {
                inviteModal.classList.remove('active');
                inviteModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });
    }

    // Handle filter buttons visual states and filtering logic
    const filterAllBtn = document.getElementById('filter-all');
    const filterMyBtn = document.getElementById('filter-my');
    let currentFilter = 'all';

    function applyFilter() {
        document.querySelectorAll('.task-card').forEach(task => {
            if (currentFilter === 'all') {
                task.style.display = 'block';
            } else if (currentFilter === 'my') {
                const isMine = !!task.querySelector('img[alt="Jane"]');
                task.style.display = isMine ? 'block' : 'none';
            }
        });
        updateTaskCounts();
    }
    
    if (filterAllBtn && filterMyBtn) {
        filterAllBtn.addEventListener('click', () => {
            filterAllBtn.classList.add('active');
            filterMyBtn.classList.remove('active');
            currentFilter = 'all';
            applyFilter();
        });

        filterMyBtn.addEventListener('click', () => {
            filterMyBtn.classList.add('active');
            filterAllBtn.classList.remove('active');
            currentFilter = 'my';
            applyFilter();
        });
    }

    // Initial render call to bootstrap the app tasks
    renderTasks();

    // ---- View Navigation ----
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all views
            viewSections.forEach(view => {
                view.style.display = 'none';
            });
            
            // Show target view
            const targetViewId = 'view-' + item.getAttribute('data-view');
            const targetView = document.getElementById(targetViewId);
            if (targetView) {
                if (targetViewId === 'view-communication') {
                    targetView.style.display = 'flex';
                } else if (targetViewId === 'view-dashboard') {
                    targetView.style.display = 'block';
                } else {
                    targetView.style.display = 'block';
                }
            }
        });
    });

    // ---- Communication & Integrations Logic ----
    const integrationBtns = document.querySelectorAll('.integration-card button');
    integrationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('connected')) {
                const originalText = this.textContent;
                this.textContent = 'Connecting...';
                this.style.opacity = '0.7';
                this.style.pointerEvents = 'none';
                
                // Simulate network request
                setTimeout(() => {
                    this.textContent = 'Connected';
                    this.classList.add('connected');
                    this.style.opacity = '1';
                    this.style.pointerEvents = 'auto';
                }, 1500);
            } else {
                if(confirm('Disconnect this integration?')) {
                    this.classList.remove('connected');
                    this.textContent = 'Connect';
                }
            }
        });
    });

    // ---- Chat Logic ----
    const chatInputArea = document.querySelector('.chat-input-area');
    if (chatInputArea) {
        const chatInput = chatInputArea.querySelector('input');
        const sendBtn = chatInputArea.querySelector('button');
        const chatMessages = document.querySelector('.chat-messages');

        function sendMessage() {
            const text = chatInput.value.trim();
            if (text) {
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const msgHTML = `
                    <div class="message">
                        <img src="https://ui-avatars.com/api/?name=Jane+Doe&background=random" class="avatar-small">
                        <div class="message-content">
                            <div class="message-header"><span class="message-author">Jane Doe (You)</span> <span class="message-time">${time}</span></div>
                            <p>${text}</p>
                        </div>
                    </div>
                `;
                chatMessages.insertAdjacentHTML('beforeend', msgHTML);
                chatInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // ---- Settings Logic ----
    const saveSettingsBtn = document.querySelector('#view-settings .primary-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            const originalText = this.textContent;
            this.textContent = 'Saving...';
            setTimeout(() => {
                this.textContent = 'Saved Successfully!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            }, 800);
        });
    }

    // ---- Team Actions Logic ----
    const teamActionBtns = document.querySelectorAll('.team-actions .icon-btn');
    teamActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Action initiated with team member!');
        });
    });

});
