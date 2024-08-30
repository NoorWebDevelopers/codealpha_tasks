const addTask = document.getElementById('add-task');
const deleteAll = document.getElementById('delete-all-task');
const overlay = document.getElementById('add-edit');
const taskClosing = document.getElementsByClassName('task-closing');
const addTitle = document.getElementById('add-title');
const addDesc = document.getElementById('add-desc');
const addFormSubmit = document.getElementById('add-a-task');
const todosContainer = document.getElementById('todos-container');
const editTitle = document.getElementById('edit-title');
const editDesc = document.getElementById('edit-desc');
const editFormSubmit = document.getElementById('edit-a-task');
const hide = document.getElementById('add-edit-task');
let required = document.createElement('p');
let todos = JSON.parse(localStorage.getItem('todos'));
let confrimCallBack;

addTask.addEventListener('click', () => {
    addTitle.value = "";
    addDesc.value = "";
    overlay.classList.add('show');
    addTitle.focus();
    hide.children[0].classList.remove('hide');
    hide.children[1].classList.add('hide');
});

for (const task of taskClosing) {
    task.addEventListener('click', () => overlay.classList.remove('show'));
}

document.body.addEventListener('click', (e) => {
    if (e.target.id === "add-edit") {
        overlay.classList.remove('show');
    };
    if (e.target.id === "confirm") {
        document.getElementById('confirm').remove();
    };
    if (!e.target.closest('.buttons')) {
        const buttonsInner = document.querySelectorAll('.buttons-inner');
        buttonsInner.forEach(button => {
            if (button && button.classList.contains('button-show')) {
                button.classList.remove('button-show');
            }
        });
    }
});

const confirmBox = (callback) => {
    confrimCallBack = callback;
    let data = `
    <div class="overlay show" id="confirm">
        <div id="messageBox">
            <h2>Are you sure to delete?</h2>
            <div id="yesNoButtons">
                <button type="button" id="yes" class="function-buttons" onclick="yesClick()">Yes</button> 
                <button type="button" id="no" class="function-buttons" onclick="noClick()">No</button> 
            </div>
        </div>
    </div>
    `
    document.getElementById("confirmBox").insertAdjacentHTML("afterbegin", data);
};

const removeConfirm = () => {
    let confirm = document.getElementById('confirm');
    if (confirm) {
        confirm.classList.remove('show');
        setTimeout(() => {
            confirm.remove();
        }, 1000);
    }
}

const yesClick = () => {
    confrimCallBack(true);
    removeConfirm();
};

const noClick = () => {
    confrimCallBack(false);
    removeConfirm();
};

deleteAll.addEventListener('click', () => {
    if (todosContainer.children.length !== 0) {
        confirmBox(result => {
            if (result) {
                for (const child of todosContainer.children) {
                    child.classList.add('remove-element');
                    child.addEventListener('animationend', () => child.remove());
                };
                localStorage.clear();
            }
        });
    };
});

const updateLS = () => {
    let todosEl = todosContainer.querySelectorAll('li');
    const todos = [];
    for (const todo of todosEl) {
        todos.push({
            title: todo.querySelector('.title').textContent,
            desc: todo.querySelector('.desc').textContent,
            date: todo.querySelector('.created').textContent,
            edit: todo.querySelector('.edited').textContent,
            complete: todo.querySelector('.title').classList.contains('complete')
        });
    };
    localStorage.setItem("todos", JSON.stringify(todos));
};


const displayError = (message) => {
    required.className = "required";
    required.innerHTML = message;
    document.querySelector('.task-adding form label').before(required)
    required.style.animationPlayState = "running";
    required.addEventListener('animationend', () => {
        required.remove();
    });
};

const displayTask = (titleValue, descValue, date, edit = "", complete = false) => {
    if (descValue === "") {
        descValue = "You haven't added any description for this task.";
    };
    let data = `
    <li class="task p-10 ${complete ? 'task-completed' : ''}">
        <div class="task-header">
            <h1 class="title ${complete ? 'complete' : ''}">${titleValue}</h1>
            <button type="button" class="function-buttons complete-task">${complete ? "Uncomplete" : "Complete"}</button>
        </div>
        <p class="desc ${complete ? 'complete' : ''} ">${descValue}</p>
        <div class="info">
            <div class="dateBox">
                <p class="created">${date}</p>
                <p class="edited">${edit}</p>
            </div>
            <div class="buttons">...
                <div class="buttons-inner">
                    <button type="button" class="delete-task">Delete</button>
                    <button type="button" class="edit-task">Edit</button>
                </div>
            </div>
        </div>
    </li>
`;
    document.getElementById('todos-container').insertAdjacentHTML("afterbegin", data);
    updateLS();
};

addFormSubmit.addEventListener('submit', (e) => {
    e.preventDefault();

    let titleValue = addTitle.value;
    let descValue = addDesc.value;
    let created = `Created at: ${new Date().toDateString()}`;

    if (addTitle.value === "") {
        displayError("Fill out the title field");
    } else {
        displayTask(titleValue, descValue, created);
        overlay.classList.remove('show');
    };
});

const completeTask = target => {
    let task = target.closest('.task');
    let desc = task.querySelector('.desc');
    let title = task.querySelector('.title');
    if (target.textContent === "Complete") {
        target.textContent = "Uncomplete";
        desc.classList.add('complete');
        title.classList.add('complete');
        task.classList.add('task-completed')
    } else {
        target.textContent = "Complete";
        desc.classList.remove('complete');
        title.classList.remove('complete');
        task.classList.remove('task-completed')
    };
    updateLS();
};

const deleteTask = target => {
    let task = target.closest('li');
    confirmBox(result => {
        if (result) {
            task.classList.add('remove-element');
            task.addEventListener('animationend', () => {
                task.remove();
                updateLS();
            });
        };
    });
};

const saveEditTask = (title, desc, edit) => {
    if (desc.textContent === "You haven't added any description for this task.") {
        editDesc.value = "";
    } else {
        editDesc.value = desc.textContent;
    }
    editTitle.value = title.textContent;

    editFormSubmit.removeEventListener('submit', handleEditForm);
    editFormSubmit.addEventListener('submit', handleEditForm);

    function handleEditForm(e) {
        e.preventDefault();
        let titleValue = e.target.querySelector('#edit-title').value;
        let descValue = e.target.querySelector('#edit-desc').value;
        let edited = new Date().toDateString();

        if (descValue === "") {
            descValue = "You haven't added any description for this task.";
        };
        title.textContent = titleValue;
        desc.textContent = descValue;
        edit.textContent = `Edited at: ${edited}`;

        overlay.classList.remove('show');
        updateLS();
        editFormSubmit.removeEventListener('submit', handleEditForm);
    };
};

const editTask = target => {
    let task = target.closest('.task');
    let desc = task.querySelector('.desc');
    let title = task.querySelector('.title');
    let edit = task.querySelector('.edited');

    overlay.classList.add('show');
    hide.children[1].classList.remove('hide');
    hide.children[0].classList.add('hide');
    editTitle.focus();

    saveEditTask(title, desc, edit);
};

const showButtons = (target) => {
    let buttons = target.querySelector('.buttons-inner');
    buttons.classList.toggle("button-show");
}

todosContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains("complete-task")) completeTask(e.target);
    if (e.target.classList.contains("delete-task")) deleteTask(e.target);
    if (e.target.classList.contains("edit-task")) editTask(e.target);
    if (e.target.classList.contains("buttons")) showButtons(e.target);
});

if (todos) {
    todos.forEach(todo => displayTask(todo.title, todo.desc, todo.date, todo.edit, todo.complete));
};