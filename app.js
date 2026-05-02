/**
 * Application Logic for SyncSpace Team Collaboration Tool
 * Focuses on drag-and-drop mechanics, accessibility, and UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Auth Logic ----
    const loginForm = document.getElementById('loginForm');
    const authOverlay = document.getElementById('authOverlay');
    const oauthBtn = document.getElementById('oauthBtn');

    function handleLogin(e) {
        if(e) e.preventDefault();
        // Simulate auth
        authOverlay.classList.add('hidden');
    }

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (oauthBtn) oauthBtn.addEventListener('click', handleLogin);

    // ---- Elements ----
    const tasks = document.querySelectorAll('.task-card');
    const lists = document.querySelectorAll('.task-list');
    
    const newTaskBtn = document.getElementById('newTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const newTaskForm = document.getElementById('newTaskForm');
    
    const todoList = document.getElementById('todo-list');
    
    let draggedTask = null;

    // ---- Drag and Drop Functionality ----
    
    tasks.forEach(task => {
        setupTaskEvents(task);
    });

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
                updateTaskCounts();
                
                // If dropped in Done, add visual styling
                if (list.id === 'done-list') {
                    draggedTask.classList.add('done');
                    // Add check icon if not exists
                    const meta = draggedTask.querySelector('.task-meta');
                    if (!meta.innerHTML.includes('fa-check-circle')) {
                         meta.innerHTML = '<i class="fa-solid fa-check-circle" style="color: var(--success-color)"></i>';
                    }
                } else {
                    draggedTask.classList.remove('done');
                    // We'd ideally restore original meta, but for demo simplicity we just remove line-through
                }
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
                // Simulate focus/selection for screen readers
                task.focus();
            }
        });
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
        if (e.key === 'Escape' && taskModal.classList.contains('active')) {
            closeModal();
        }
    });

    // ---- Create New Task ----
    
    newTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('taskTitleInput').value;
        const desc = document.getElementById('taskDescInput').value;
        const category = document.getElementById('taskCategoryInput').value;
        
        let labelClass = 'label-design';
        let labelText = 'Design';
        
        if (category === 'dev') { labelClass = 'label-dev'; labelText = 'Development'; }
        else if (category === 'marketing') { labelClass = 'label-marketing'; labelText = 'Marketing'; }

        const taskId = 'task-' + Date.now();
        
        const taskHTML = `
            <div class="task-labels">
                <span class="label ${labelClass}">${labelText}</span>
            </div>
            <h4 class="task-title">${title}</h4>
            <p class="task-desc">${desc || 'No description provided.'}</p>
            <div class="task-footer">
                <div class="task-assignees">
                    <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Unassigned" class="avatar-small">
                </div>
                <div class="task-meta">
                    <i class="fa-regular fa-comment"></i> 0
                </div>
            </div>
        `;
        
        const newTask = document.createElement('div');
        newTask.className = 'task-card';
        newTask.draggable = true;
        newTask.id = taskId;
        newTask.tabIndex = 0;
        newTask.innerHTML = taskHTML;
        
        setupTaskEvents(newTask);
        todoList.appendChild(newTask);
        
        updateTaskCounts();
        closeModal();
    });

    // Handle filter buttons visual states and filtering logic
    const filterAllBtn = document.getElementById('filter-all');
    const filterMyBtn = document.getElementById('filter-my');
    
    if (filterAllBtn && filterMyBtn) {
        filterAllBtn.addEventListener('click', () => {
            filterAllBtn.classList.add('active');
            filterMyBtn.classList.remove('active');
            
            // Show all tasks
            document.querySelectorAll('.task-card').forEach(task => {
                task.style.display = 'block';
            });
            updateTaskCounts();
        });

        filterMyBtn.addEventListener('click', () => {
            filterMyBtn.classList.add('active');
            filterAllBtn.classList.remove('active');
            
            // Hide tasks not assigned to "Jane"
            document.querySelectorAll('.task-card').forEach(task => {
                const isMine = !!task.querySelector('img[alt="Jane"]');
                if (isMine) {
                    task.style.display = 'block';
                } else {
                    task.style.display = 'none';
                }
            });
            updateTaskCounts();
        });
    }

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
});
