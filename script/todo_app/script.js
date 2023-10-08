let draggedTask = null;

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    draggedTask = event.target;
}

function drop(event, status) {
    event.preventDefault();

    if (status === 'trash') {
        // タスクをゴミ箱に移動（削除）
        const taskElement = draggedTask;
        const taskId = taskElement.getAttribute('data-id');
        const taskIndex = tasks.findIndex((task) => task.id === parseInt(taskId));

        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1); // タスクを削除
            taskElement.remove(); // タスク要素を削除
        }
    } else {
        // カラム間でタスクを移動
        const taskList = document.getElementById(status + '-list');
        taskList.appendChild(draggedTask);
    }

    draggedTask = null;
}

const tasks = [
];

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.draggable = true;
    taskElement.setAttribute('data-id', task.id);
    taskElement.textContent = task.title;
    taskElement.addEventListener('dragstart', drag);

    return taskElement;
}

document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const inprogressList = document.getElementById('inprogress-list');
    const resolvedList = document.getElementById('resolved-list');

    tasks.forEach((task) => {
        const taskElement = createTaskElement(task);
        todoList.appendChild(taskElement);
    });

    // + ボタンをクリックして空のタスクを追加
    const addNewTaskButton = document.getElementById('add-new-task');
    addNewTaskButton.addEventListener('click', addEmptyTask);

    // タスクをクリックして編集モーダルを表示
    const taskLists = document.querySelectorAll('.task-list');
    taskLists.forEach((list) => {
        list.addEventListener('click', (event) => {
            const taskElement = event.target;
            const taskId = taskElement.getAttribute('data-id');
            editTask(parseInt(taskId));
        });
    });

    // モーダルを閉じる
    const closeModalButton = document.querySelector('.close');
    const taskModal = document.getElementById('task-modal');
    closeModalButton.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });
});

// + ボタンをクリックして空のタスクを追加
function addEmptyTask() {
    const taskId = tasks.length + 1;
    const newTask = { id: taskId, title: '' };

    const taskElement = createTaskElement(newTask);
    const todoList = document.getElementById('todo-list');
    todoList.appendChild(taskElement);

    tasks.push(newTask);

    // 新しいタスクを追加するためにテキストエリアを開きます
    editTask(newTask.id);
}

// タスクを編集する関数
function editTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);

  if (task) {
      const taskModal = document.getElementById('task-modal');
      const taskModalTextarea = document.getElementById('task-modal-textarea');
      const saveTaskButton = document.getElementById('save-task');

      taskModalTextarea.value = task.title;

      taskModal.style.display = 'block';

      // まず既存のイベントリスナーを削除
      saveTaskButton.removeEventListener('click', onSaveTaskClick);

      // 新しいイベントリスナーを登録
      saveTaskButton.addEventListener('click', onSaveTaskClick);

      function onSaveTaskClick() {
          task.title = taskModalTextarea.value;
          const taskElement = document.querySelector(`[data-id="${task.id}"]`);
          taskElement.textContent = task.title;

          taskModal.style.display = 'none';

          // 再度イベントリスナーを削除
          saveTaskButton.removeEventListener('click', onSaveTaskClick);
      }
  }
}