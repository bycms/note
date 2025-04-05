/* 
    Toolbar showhide logic
    ->  1. Slash trigger show
        2. Button clicked hide
        3. Elsewhere clicked hide
*/
const toolbar = document.getElementById("toolbar");
document.getElementById("editor").addEventListener('keydown', ev => {
    if (ev.key === '/') {
        toolbar.style.display = "block";
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

/* 
    Add block logic
    ~   1. Click button -> Call add item
        2. Block logics
            2.1 Prevent new line (<p> excluded)
            2.2 Del block on backspace when empty
        3. Item-specific logics
*/

// 1.
document.addEventListener('DOMContentLoaded', ()=>{
    for (let button of buttons) {
        button.addEventListener('click', () => addElement(button.id));
        console.log(button.id + " clicked.")
    }
})
function addElement(type) {
    switch (type) {
        case 'h1': {
            const newElement = document.createElement('h1');
            newElement.textContent = 'New Heading';
            newElement.contentEditable = "true";
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
        case 'h2': {
            const newElement = document.createElement('h2');
            newElement.textContent = 'New Subheading';
            newElement.contentEditable = "true";
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
        case 'h3': {
            const newElement = document.createElement('h3');
            newElement.textContent = 'New Sub-subheading';
            newElement.contentEditable = "true";
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
        case 'bullet-list': {
            const newElement = document.createElement('ul');
            newElement.innerHTML = '<li>List item 1</li><li>List item 2</li>';
            newElement.contentEditable = "true";
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
        case 'numbered-list': {
            const newElement = document.createElement('ol');
            newElement.innerHTML = '<li>List item 1</li><li>List item 2</li>';
            newElement.contentEditable = "true";
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
        case 'table': {
            const newElement = document.createElement('table');
            newElement.innerHTML = '<tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Cell 1</td><td>Cell 2</td></tr>';
            newElement.contentEditable = "true";
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
        case 'inline-code': {
            const newElement = document.createElement('code');
            newElement.textContent = 'console.log("Hello, World!");';
            newElement.contentEditable = "true";
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
        case 'code-piece': {
            const newElement = document.createElement('pre');
            newElement.textContent = 'function add(a, b) {\n  return a + b;\n}';
            newElement.contentEditable = "true";
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
        case 'separator': {
            const newElement = document.createElement('hr');
            newElement.classList.add("block");
            document.getElementById("editor").appendChild(newElement);
            break;
        }
    }
}

// 2.1
document.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.tagName !== 'P') {
        ev.preventDefault();
        const newElement = document.createElement('p');
        newElement.textContent = ">";
        newElement.contentEditable = "true";
        newElement.classList.add("block");
        document.getElementById("editor").appendChild(newElement);
        newElement.scrollIntoView({ behavior: 'smooth' });
        newElement.focus();
    }
});

// 2.2
document.addEventListener('keydown', ev => {
    if (ev.key === 'Backspace' && ev.target.textContent == "") {
        const previousElement = ev.target.previousElementSibling;
        if (previousElement) {
            previousElement.focus();
        } else {
            const parentElement = ev.target.parentElement;
            if (parentElement) {
                parentElement.focus();
            }
        }
    }
})

// 3.
document.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.tagName === 'CODE') {
        ev.preventDefault();
        const newElement = document.createElement('p');
        newElement.textContent = ev.target.textContent;
        newElement.contentEditable = "true";
        newElement.classList.add("block");
        ev.target.parentNode.replaceChild(newElement, ev.target);
    }
});