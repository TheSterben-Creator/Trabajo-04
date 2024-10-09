const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');  // Importamos el módulo 'path'
const app = express();
const port = 3000;

// Configurar middlewares
app.use(bodyParser.json());
app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Conectar con SQLite
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos SQLite.');
    }
});

// Crear la tabla de tareas si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        completed INTEGER DEFAULT 0
    )
`);

// Ruta para la raíz (muestra el index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para obtener todas las tareas
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            tasks: rows
        });
    });
});

// Ruta para agregar una nueva tarea
app.post('/tasks', (req, res) => {
    const { task } = req.body;
    if (!task) {
        return res.status(400).json({ error: 'No se puede agregar una tarea vacía' });
    }
    db.run('INSERT INTO tasks (task) VALUES (?)', [task], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({
            id: this.lastID,
            task,
            completed: 0
        });
    });
});

// Ruta para marcar una tarea como completada
app.put('/tasks/complete/:id', (req, res) => {
    const { id } = req.params;
    db.run('UPDATE tasks SET completed = 1 WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Tarea completada', id });
    });
});

// Ruta para eliminar una tarea
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Tarea eliminada' });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
