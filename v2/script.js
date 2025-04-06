/* Toolbar show/hide logic */
const toolbar = document.getElementById("toolbar");
document.getElementById("editor").addEventListener('keydown', ev => {
    if (ev.key === '/') {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const textBeforeCursor = range.startContainer.textContent.slice(0, range.startOffset);

        if (textBeforeCursor.trim() === "") { // Check if slash is at the start of an area
            ev.preventDefault(); // Prevent the slash from being added to the editor
            toolbar.style.display = "block";
            // Move toolbar to cursor position
            const rect = ev.target.getBoundingClientRect();
            toolbar.style.left = `${rect.left}px`;
            toolbar.style.top = `${rect.bottom + window.scrollY}px`;
            toolbar.style.position = "absolute";
            toolbar.style.zIndex = "1000";
        }
    }
});

const buttons = document.getElementsByClassName("addElement");
for (let button of buttons) {
    button.addEventListener('click', () => {
        toolbar.style.display = "none";
    });
}

document.addEventListener('click', ev => {
    if (!toolbar.contains(ev.target)) {
        toolbar.style.display = "none";
    }
});

// Global variable to store the current table element when selected
let currentTable = null;

// Global variable to store the table controls container
let tableControls = null;

// Create table controls container if not exists
function createTableControls() {
    if (tableControls) return;
    tableControls = document.createElement('div');
    tableControls.id = 'table-controls';
    tableControls.innerHTML = `
        <button id="tc-addRow">+Row</button>
        <button id="tc-delRow">-Row</button>
        <button id="tc-addCol">+Column</button>
        <button id="tc-delCol">-Column</button>
    `;
    document.body.appendChild(tableControls);
    // Attach button event listeners
    document.getElementById('tc-addRow').addEventListener('click', () => {
        addRowToTable();
        updateTableControlsPosition();
    });
    document.getElementById('tc-delRow').addEventListener('click', () => {
        deleteRowFromTable();
    });
    document.getElementById('tc-addCol').addEventListener('click', () => {
        addColToTable();
        updateTableControlsPosition();
    });
    document.getElementById('tc-delCol').addEventListener('click', () => {
        deleteColFromTable();
    });
}

function showTableControls() {
    if (!currentTable) return;
    createTableControls();
    tableControls.style.display = 'block';
    updateTableControlsPosition();
}

function hideTableControls() {
    if (tableControls) {
        tableControls.style.display = 'none';
    }
}

function updateTableControlsPosition() {
    if (!currentTable || !tableControls) return;
    // Position controls at the top-right corner of the table
    const rect = currentTable.getBoundingClientRect();
    tableControls.style.left = `${rect.right + window.scrollX + 5}px`;
    tableControls.style.top = `${rect.top + window.scrollY}px`;
}

/* Helper: Create block element based on type */
function createBlockElement(type) {
    let newElement;
    switch (type) {
        case 'h1': {
            newElement = document.createElement('div');
            newElement.textContent = 'New Heading';
            newElement.classList.add('block', 'h1');
            break;
        }
        case 'h2': {
            newElement = document.createElement('div');
            newElement.textContent = 'New Subheading';
            newElement.classList.add('block', 'h2');
            break;
        }
        case 'h3': {
            newElement = document.createElement('div');
            newElement.textContent = 'New Sub-subheading';
            newElement.classList.add('block', 'h3');
            break;
        }
        case 'bullet-list': {
            newElement = document.createElement('div');
            newElement.classList.add('block', 'bullet-list');
            newElement.innerHTML = '<div><span>•</span><div contenteditable="true">List item 1</div></div>';
            break;
        }
        case 'numbered-list': {
            newElement = document.createElement('div');
            newElement.classList.add('block', 'numbered-list');
            newElement.innerHTML = '<div><span>1.</span><div contenteditable="true">List item 1</div></div>';
            break;
        }
        case 'table': {
            newElement = document.createElement('table');
            for (let i = 0; i < 3; i++) {
                const row = newElement.insertRow();
                for (let j = 0; j < 3; j++) {
                    const cell = i === 0 ? document.createElement('th') : document.createElement('td');
                    cell.textContent = i === 0 ? `Header ${j + 1}` : `Cell ${i},${j + 1}`;
                    cell.style.border = '1px solid #ccc';
                    cell.style.padding = '8px';
                    row.appendChild(cell);
                }
            }

            break;
        }
        case 'inline-code': {
            return;
        }
        case 'code-piece': {
            newElement = document.createElement('pre');
            newElement.textContent = 'function add(a, b) {\n  return a + b;\n}';
            break;
        }
        case 'separator': {
            newElement = document.createElement('hr');
            break;
        }
        default:
            return null;
    }
    newElement.contentEditable = "true";
    return newElement;
}

/* Add block logic */
function addElement(type) {
    const newElement = createBlockElement(type);
    if (newElement) {
        document.getElementById("editor").appendChild(newElement);
    }
}

/* New helper functions for table manipulation */
function addRowToTable() {
    if (!currentTable) return;
    const rows = currentTable.rows;
    const colCount = rows[0].cells.length;
    const newRow = currentTable.insertRow(-1);
    for (let i = 0; i < colCount; i++) {
        let newCell = document.createElement('td');
        newCell.textContent = `Cell ${rows.length - 1},${i + 1}`;
        newRow.appendChild(newCell);
    }
}

function addColToTable() {
    if (!currentTable) return;
    const rows = currentTable.rows;
    for (let i = 0; i < rows.length; i++) {
        let newCell;
        if (i === 0) {
            newCell = document.createElement('th');
            newCell.textContent = `Header ${rows[i].cells.length + 1}`;
        } else {
            newCell = document.createElement('td');
            newCell.textContent = `Cell ${i},${rows[i].cells.length + 1}`;
        }
        rows[i].appendChild(newCell);
    }
}

/* New helper functions for table manipulation deletion operations */
function deleteRowFromTable() {
    if (!currentTable) return;
    const rowCount = currentTable.rows.length;
    if (rowCount > 1) {
        // Delete the last row
        currentTable.deleteRow(-1);
    } else {
        // If only one row remains, remove the entire table and hide controls
        currentTable.remove();
        currentTable = null;
        hideTableControls();
    }
}

function deleteColFromTable() {
    if (!currentTable) return;
    const rowCount = currentTable.rows.length;
    const colCount = currentTable.rows[0].cells.length;
    if (colCount > 1) {
        // Delete last column from each row
        for (let i = 0; i < rowCount; i++) {
            currentTable.rows[i].deleteCell(-1);
        }
    } else {
        // If only one column remains, remove the entire table and hide controls
        currentTable.remove();
        currentTable = null;
        hideTableControls();
    }
}

// Modify the table click event to show table controls near the table
document.addEventListener('click', ev => {
    if (ev.target.tagName === 'TABLE' || (ev.target.closest && ev.target.closest('table'))) {
        currentTable = ev.target.tagName === 'TABLE' ? ev.target : ev.target.closest('table');
        showTableControls();
    } else if (!ev.target.closest('#toolbar') && !ev.target.closest('#table-controls')) {
        currentTable = null;
        hideTableControls();
    }
    if (!toolbar.contains(ev.target)) {
        toolbar.style.display = "none";
    }
});

// Initialize buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.getElementsByClassName("addElement");
    for (let button of buttons) {
        button.addEventListener('click', () => addElement(button.id));
        console.log(button.id + " clicked.");
    }
    // Initialize new table control buttons
    document.getElementById('addRow').addEventListener('click', () => {
        addRowToTable();
        console.log("addRow clicked.");
    });
    document.getElementById('addCol').addEventListener('click', () => {
        addColToTable();
        console.log("addCol clicked.");
    });
});

// Prevent new line creation for non-paragraph elements
document.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && !ev.target.classList.contains('paragraph') && !ev.target.closest('.bullet-list') && !ev.target.closest('.numbered-list')) {
        ev.preventDefault();
        const newElement = document.createElement('div');
        newElement.classList.add('paragraph', 'block');
        newElement.textContent = ">";
        newElement.contentEditable = "true";
        document.getElementById("editor").appendChild(newElement);
        newElement.scrollIntoView({ behavior: 'smooth' });
        newElement.focus();
    }
});

// Delete block on backspace when empty
document.addEventListener('keydown', ev => {
    if (ev.key === 'Backspace' && ev.target.textContent === "" && ev.target.id !== "defPara" && ev.target.id !== 'prompt-input') {
        ev.preventDefault();
        const currentElement = ev.target;
        const previousElement = currentElement.previousElementSibling;
        if (previousElement) {
            previousElement.focus();
        } else {
            const parentElement = currentElement.parentElement;
            if (parentElement) {
                parentElement.focus();
            }
        }
        currentElement.remove();
        if (previousElement) {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(previousElement);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
});

// List-specific logic for Enter key
document.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.closest('.bullet-list, .numbered-list')) {
        ev.preventDefault();
        const parentList = ev.target.closest('.bullet-list, .numbered-list');
        const listItem = ev.target.closest('div[contenteditable="true"]'); // Ensure we target the correct list item
        const trimmed = listItem ? listItem.textContent.trim() : ""; // Define trimmed
        if (listItem && trimmed !== "" && trimmed !== "•" && !/^\d+\.$/.test(trimmed)) {
            console.log(listItem.textContent.trim());
            let newElement = document.createElement('div');
            newElement.contentEditable = "true";
            newElement.style.display = "flex";
            newElement.classList.add('block');
            if (parentList.classList.contains('bullet-list')) {
                let itemCount = parentList.parentNode.querySelectorAll('.bullet-list').length + 1;
                newElement.classList.add('bullet-list');
                newElement.innerHTML = `<div><span>•</span><div contenteditable="true">List item ${itemCount}</div></div>`;
            } else if (parentList.classList.contains('numbered-list')) {
                let itemCount = parentList.parentNode.querySelectorAll('.numbered-list').length + 1;
                newElement.classList.add('numbered-list');
                newElement.innerHTML = `<span style="margin-right: 10px;">${itemCount}.</span><div contenteditable="true">New numbered item</div>`;
            }
            parentList.parentNode.insertBefore(newElement, parentList.nextSibling);
            newElement.scrollIntoView({ behavior: 'smooth' });
            newElement.focus();
        } else {
            const newElement = document.createElement('div');
            newElement.classList.add('paragraph', 'block');
            newElement.textContent = ">";
            newElement.contentEditable = "true";
            parentList.parentNode.replaceChild(newElement, parentList);
            newElement.scrollIntoView({ behavior: 'smooth' });
            newElement.focus();
        }
    }
});