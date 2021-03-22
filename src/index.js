const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const findUser = users.find(user => user.username === username);
  if (!findUser) {
    return res.status(404).json({ error: 'Usuário não encontrado.' })
  }
  req.user = findUser;
  next()
  return req;
}

function checkExistsUsername(req, res, next) {
  const { username } = req.body;
  const findUser = users.find(user => user.username === username);

  if (findUser) {
    return res.status(400).json({ error: 'Nome de usuário já existe.' })
  }
  next();
}

function findExistsTodo(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  const findTodo = user.todos.find(todo => todo.id === id);

  if (!findTodo) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' })
  }
  req.todo = findTodo;
  next();
  return req;
}

app.post('/users', checkExistsUsername, (req, res) => {
  const { name, username } = req.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);

  return res.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  if (!title) {
    return res.status(401).json({ message: 'Título obrigatório.' });
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, findExistsTodo, (req, res) => {
  const { user, todo } = req;
  const { title, deadline } = req.body;

  user.todos[0].title = title;
  user.todos[0].deadline = new Date(deadline);

  return res.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, findExistsTodo, (req, res) => {
  const { user, todo } = req;

  user.todos[0].done = !user.todos[0].done;

  return res.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, findExistsTodo, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  user.todos = user.todos.filter(todo => todo.id !== id)

  return res.status(204).json(user.todos);
});

module.exports = app;