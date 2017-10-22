<template>
  <div>
    <input class="new-todo"
      autofocus autocomplete="off"
      placeholder="What needs to be done?"
      v-model="newTodo"
      @keyup.enter="addTodo">
    <section class="main" v-show="todos.length" v-cloak>
      <input class="toggle-all" type="checkbox" v-model="allDone">
      <ul class="todo-list">
        <li v-for="todo in filteredTodos"
          class="todo"
          :key="todo.id"
          :class="{ completed: todo.completed, editing: todo == editedTodo }">
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed">
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input class="edit" type="text"
            v-model="todo.title"
            v-todo-focus="todo == editedTodo"
            @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)"
            @keyup.esc="cancelEdit(todo)">
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="todos.length" v-cloak>
      <span class="todo-count">
        <strong>{{ remaining }}</strong> {{ remaining | pluralize }} left
      </span>
      <ul class="filters">
        <li><a href="#/all" :class="{ selected: visibility == 'all' }">All</a></li>
        <li><a href="#/active" :class="{ selected: visibility == 'active' }">Active</a></li>
        <li><a href="#/completed" :class="{ selected: visibility == 'completed' }">Completed</a></li>
      </ul>
      <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
        Clear completed
      </button>
    </footer>
  </div>
</template>
<script>
import store from 'store';
import { uuid } from 'toxic-utils';
const STORAGE_PREFIX = 'todomvc_';
const todos = store.get(STORAGE_PREFIX + 'todos') || [];
const filters = {
  all(todos) {
    return todos;
  },
  active(todos) {
    return todos.filter(function(todo) {
      return !todo.completed;
    });
  },
  completed(todos) {
    return todos.filter(function(todo) {
      return todo.completed;
    });
  },
};
export default {
  // app initial state
  data() {
    return {
      newTodo: '',
      visibility: 'all',
      todos,
      editedTodo: null,
    };
  },
  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    filteredTodos() {
      return filters[this.visibility](this.todos);
    },
    remaining() {
      return filters.active(this.todos).length;
    },
    allDone: {
      get() {
        return this.remaining === 0;
      },
      set(value) {
        this.todos.forEach(function(todo) {
          todo.completed = value;
        });
      },
    },
  },
  // watch todos change for localStorage persistence
  watch: {
    todos: {
      handler(todos) {
        store.set(STORAGE_PREFIX + 'todos', todos);
      },
      deep: true,
    },
  },
  methods: {
    addTodo() {
      const value = this.newTodo && this.newTodo.trim();
      if (!value) return;
      this.todos.push({
        id: uuid(),
        title: value,
        completed: false,
      });
      this.newTodo = '';
    },
    removeTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1);
    },
    editTodo(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },
    doneEdit(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo);
      }
    },
    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },
    removeCompleted() {
      this.todos = filters.active(this.todos);
    },
    onHashChange() {
      const visibility = window.location.hash.replace(/#\/?/, '');
      if (filters[visibility]) {
        this.visibility = visibility;
      } else {
        window.location.hash = '';
        this.visibility = 'all';
      }
    },
  },
  filters: {
    pluralize(n) {
      return n === 1 ? 'item' : 'items';
    },
  },
  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    'todo-focus': function(el, binding) {
      if (binding.value) {
        el.focus();
      }
    },
  },
  created() {
    window.addEventListener('hashchange', this.onHashChange);
    this.onHashChange();
  },
};
</script>
