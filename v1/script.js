// DOM Elements
const editor = document.getElementById('editor');
const slashToolbar = document.getElementById('slash-toolbar');

// Modal Helper
function showModal(title, message, defaultValue = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-backdrop');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalInput = document.getElementById('modal-input');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalInput.value = defaultValue;
        modalInput.style.display = message ? 'block' : 'none';
        modal.style.display = 'flex';
        
        const cleanup = () => {
            modal.style.display = 'none';
            modalInput.removeEventListener('keydown', handleKey);
        };

        const handleConfirm = () => {
            cleanup();
            resolve(modalInput.value || true);
        };
        
        const handleCancel = () => {
            cleanup();
            resolve(null);
        };
        
        document.getElementById('modal-confirm').onclick = handleConfirm;
        document.getElementById('modal-cancel').onclick = handleCancel;
        
        const handleKey = (e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') handleCancel();
        };
        
        modalInput.addEventListener('keydown', handleKey);
        modalInput.focus();
    });
}

// Toolbar Functions
function showSlashToolbar() {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        toggleToolbar(false);
        return;
    }

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    
    if (node.nodeType !== Node.TEXT_NODE) {
        toggleToolbar(false);
        return;
    }

    const text = node.textContent || '';
    const cursorPos = range.startOffset;

    const isSlashCommand = text[cursorPos - 1] === '/' && 
                         (cursorPos === 1 || /\s/.test(text[cursorPos - 2]));

    if (isSlashCommand) {
        try {
            const rect = range.getBoundingClientRect();
            toggleToolbar(true, rect.left + window.scrollX, rect.bottom + window.scrollY);
        } catch (e) {
            toggleToolbar(false);
        }
    } else {
        toggleToolbar(false);
    }
}

function toggleToolbar(show, x = 0, y = 0) {
    if (show) {
        slashToolbar.style.left = `${x}px`;
        slashToolbar.style.top = `${y}px`;
        slashToolbar.classList.add('show');
    } else {
        slashToolbar.classList.remove('show');
        slashToolbar.style.left = '-9999px';
        slashToolbar.style.top = '0';
    }
}

// Editor Functions
function insertModernElement(type, attributes = {}, content = '') {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.addRange(range);
    }
    
    const element = document.createElement(type);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    if (content) {
        element.innerHTML = content;
    }
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(element);
    
    // Set cursor after the new element
    const newRange = document.createRange();
    newRange.setStartAfter(element);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    editor.focus();
    return element;
}

async function insertTable() {
    const rows = await showModal('Create Table', 'Number of rows (1-10):', '3');
    if (!rows || isNaN(rows)) return;
    
    const cols = await showModal('Create Table', 'Number of columns (1-10):', '2');
    if (!cols || isNaN(cols)) return;
  
    const validatedRows = Math.min(Math.max(1, parseInt(rows)), 10);
    const validatedCols = Math.min(Math.max(1, parseInt(cols)), 10);

    let tableHTML = '<table><thead><tr>';
    for (let i = 0; i < validatedCols; i++) {
        tableHTML += `<th contenteditable="true">Header</th>`;
    }
    tableHTML += '</tr></thead><tbody>';
    
    for (let i = 0; i < validatedRows; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < validatedCols; j++) {
            tableHTML += `<td contenteditable="true">Content</td>`;
        }
        tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table>';
    
    insertModernElement('div', {}, tableHTML);
}

async function insertLink() {
    const url = await showModal('Insert Link', 'Enter URL:', 'https://');
    if (url) {
        insertModernElement('a', {
            href: url,
            rel: 'noopener noreferrer'
        }, 'Link Text');
    }
}

async function insertImage() {
    const url = await showModal('Insert Image', 'Enter image URL:', 'https://');
    if (url) {
        insertModernElement('img', {
            src: url,
            alt: 'User-uploaded image',
            style: 'max-width: 100%; height: auto;'
        });
    }
}

async function insertFootnote() {
    const text = await showModal('Insert Footnote', 'Enter footnote text:');
    if (text) {
        const footnoteId = `fn-${Date.now()}`;
        const refId = `fnref-${Date.now()}`;
        
        // Insert reference mark
        insertModernElement('sup', { id: refId }, `
            <a href="#${footnoteId}" contenteditable="false">[note]</a>
        `);
        
        // Add footnote at bottom
        const footnote = document.createElement('div');
        footnote.id = footnoteId;
        footnote.className = 'footnote';
        footnote.innerHTML = `
            <a href="#${refId}" contenteditable="false">↑</a> ${text}
        `;
        editor.appendChild(footnote);
    }
}

function insertTaskList() {
    const taskList = document.createElement('ul');
    taskList.className = 'task-list';
    
    for (let i = 1; i <= 2; i++) {
        const listItem = document.createElement('li');
        listItem.contentEditable = 'true';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        
        listItem.prepend(checkbox);
        listItem.append(document.createTextNode(' Task ' + i));
        taskList.appendChild(listItem);
    }
    
    insertModernElement('div', {}, taskList.outerHTML);
}

function insertBlockquote() {
    const blockquote = document.createElement('blockquote');
    blockquote.contentEditable = 'true';
    blockquote.innerHTML = '<p>Quote text...</p>';
    insertModernElement('div', {}, blockquote.outerHTML);
}

function insertHorizontalRule() {
    insertModernElement('hr');
}

function insertDefinitionList() {
    const dl = document.createElement('dl');
    dl.innerHTML = `
        <dt contenteditable="true">Term</dt>
        <dd contenteditable="true">Definition</dd>
    `;
    insertModernElement('div', {}, dl.outerHTML);
}

function formatBlock(format) {
    document.execCommand('formatBlock', false, format);
}

function insertList(type) {
    document.execCommand(type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList');
}

function addBlock() {
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    editor.appendChild(p);
    
    // Move cursor to new block
    const range = document.createRange();
    range.selectNodeContents(p);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    editor.focus();
}

// Event Listeners
function handleToolbarClick(e) {
    if (e.target.tagName === 'BUTTON') {
        const [command, arg] = e.target.dataset.command.split(':');
        switch(command) {
            case 'formatBlock': formatBlock(arg); break;
            case 'insertList': insertList(arg); break;
            default: window[command]?.();
        }
        toggleToolbar(false);
    }
}

function handleKeyEvents(e) {
    if (e.key === 'Enter') {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const listItem = range.startContainer.closest('li');
        
        if (listItem && listItem.parentElement.classList.contains('task-list')) {
            e.preventDefault();
            handleTaskListEnter(listItem, range);
        }
    } else if (e.key === 'Escape') {
        toggleToolbar(false);
    } else if (e.key === '/') {
        setTimeout(showSlashToolbar, 10);
    }
}

function handleTaskListEnter(listItem, range) {
    const taskList = listItem.parentElement;
    const newItem = document.createElement('li');
    newItem.contentEditable = 'true';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    newItem.prepend(checkbox);
    
    if (range.startOffset === 0 && range.endOffset === 0) {
        taskList.insertBefore(newItem, listItem);
    } else if (range.startOffset === listItem.textContent.length) {
        taskList.insertBefore(newItem, listItem.nextSibling);
    } else {
        const fragment = range.extractContents();
        newItem.appendChild(fragment);
        taskList.insertBefore(newItem, listItem.nextSibling);
    }
    
    // Focus new item
    const newRange = document.createRange();
    newRange.selectNodeContents(newItem);
    newRange.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    editor.addEventListener('input', debounce(showSlashToolbar, 300));
    editor.addEventListener('keydown', handleKeyEvents);
    slashToolbar.addEventListener('click', handleToolbarClick);
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#slash-toolbar') && !e.target.closest('#editor')) {
            toggleToolbar(false);
        }
    });
    
    // Add initial content if empty
    if (!editor.innerHTML.trim()) {
        editor.innerHTML = '<p><br></p>';
    }
});

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}