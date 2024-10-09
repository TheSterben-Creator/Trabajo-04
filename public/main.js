const input = document.querySelector("input");
const addBtn = document.querySelector(".btn-add");
const ul = document.querySelector("ul");
const empty = document.querySelector(".empty");
const errorMessage = document.querySelector(".error-message"); 

// Cargar las tareas desde el backend al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    fetchTasks();
});

// Función para mostrar las tareas desde la base de datos
function fetchTasks() {
    fetch('http://localhost:3000/tasks')
        .then(response => response.json())
        .then(data => {
            const tasks = data.tasks;
            if (tasks.length > 0) {
                empty.style.display = "none";
                tasks.forEach(task => {
                    createTaskElement(task);
                });
            } else {
                empty.style.display = "block";
            }
        });
}

// Función para crear y agregar una tarea al frontend
function createTaskElement(task) {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.textContent = task.task;

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    buttonContainer.appendChild(addCompleteBtn(task.id));
    buttonContainer.appendChild(addDeleteBtn(task.id));

    li.appendChild(p);
    li.appendChild(buttonContainer);
    ul.appendChild(li);
}

// Función para añadir botón "Completar Tarea"
function addCompleteBtn(taskId) {
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Completar Tarea";
    completeBtn.className = "btn-complete";

    completeBtn.addEventListener("click", (e) => {
        const item = e.target.parentElement.parentElement; 
        const taskText = item.querySelector("p");

        if (!taskText.classList.contains("completed")) {
            taskText.classList.add("completed"); // Marcar la tarea como completada en la interfaz

            completeBtn.textContent = "Tarea Completada"; 
            completeBtn.disabled = true; // Desactiva el botón

            // Marcar la tarea como completada en el backend
            fetch(`http://localhost:3000/tasks/complete/${taskId}`, {
                method: 'PUT', // Usamos PUT para actualizar la tarea
            }).then(response => {
                if (response.ok) {
                    console.log('Tarea marcada como completada');
                } else {
                    console.error('Error al marcar tarea como completada');
                }
            });
        }
    });

    return completeBtn;
}

// Función para añadir botón de eliminar
function addDeleteBtn(taskId) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X"; 
    deleteBtn.className = "btn-delete";

    deleteBtn.addEventListener("click", (e) => {
        const item = e.target.parentElement.parentElement; 
        ul.removeChild(item);

        // Eliminar la tarea del backend
        fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'DELETE',
        }).then(() => {
            const items = document.querySelectorAll("li");
            if (items.length === 0) {
                empty.style.display = "block";
            }
        });
    });

    return deleteBtn;
}

// Evento para agregar nueva tarea
addBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const text = input.value.trim();

    if (text.length === 0) {
        errorMessage.style.display = "block"; // Muestra el mensaje de error
        return;
    }

    // Guardar la nueva tarea en el backend
    fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: text }),
    })
    .then(response => response.json())
    .then(data => {
        createTaskElement(data);
        input.value = "";  // Limpiar el campo de texto
        errorMessage.style.display = "none"; // Ocultar el mensaje de error
    });
});
