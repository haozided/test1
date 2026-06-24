import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Todo,
  TodoFilter,
  Priority,
  createTodo,
  defaultTodos,
  duplicateTodo,
  filterTodos,
  formatTodoDate,
  loadTodos,
  priorityLabels,
  saveTodos,
  themeStorageKey,
  todoStats
} from "../shared/todos";

type Theme = "light" | "dark";

const filterLabels: Record<TodoFilter, string> = {
  all: "全部",
  active: "待办",
  done: "完成"
};

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(themeStorageKey);
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = loadTodos(localStorage);
    if (savedTodos.length > 0) return savedTodos;

    const seededTodos = defaultTodos();
    saveTodos(localStorage, seededTodos);
    return seededTodos;
  });
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [draft, setDraft] = useState({
    text: "",
    date: "",
    priority: "low" as Priority
  });

  const visibleTodos = useMemo(() => filterTodos(todos, filter, query), [filter, query, todos]);
  const stats = useMemo(() => todoStats(todos), [todos]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const updateTodos = (nextTodos: Todo[]) => {
    setTodos(nextTodos);
    saveTodos(localStorage, nextTodos);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.text.trim()) return;

    updateTodos([createTodo(draft), ...todos]);
    setDraft({ text: "", date: "", priority: "low" });
  };

  const updateTitle = (todo: Todo, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    updateTodos(todos.map((item) => (item.id === todo.id ? { ...item, text: trimmed } : item)));
  };

  return (
    <main className="app">
      <header className="topbar">
        <div className="title-block">
          <h1>Todo List</h1>
          <p>今天要做的事，清清楚楚放在这里。</p>
        </div>
        <section className="stats" aria-label="任务统计">
          <div className="stat">
            <strong>{stats.total}</strong>
            <span>全部</span>
          </div>
          <div className="stat">
            <strong>{stats.active}</strong>
            <span>待完成</span>
          </div>
          <div className="stat">
            <strong>{stats.done}</strong>
            <span>已完成</span>
          </div>
        </section>
      </header>

      <section className="workspace">
        <form className="composer" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="todoText">任务</label>
            <input
              id="todoText"
              type="text"
              placeholder="写下一个新任务"
              maxLength={80}
              autoComplete="off"
              required
              value={draft.text}
              onChange={(event) => setDraft({ ...draft, text: event.target.value })}
            />
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="todoDate">日期</label>
              <input
                id="todoDate"
                type="date"
                value={draft.date}
                onChange={(event) => setDraft({ ...draft, date: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="todoPriority">优先级</label>
              <select
                id="todoPriority"
                value={draft.priority}
                onChange={(event) => setDraft({ ...draft, priority: event.target.value as Priority })}
              >
                <option value="low">普通</option>
                <option value="medium">重要</option>
                <option value="high">紧急</option>
              </select>
            </div>
          </div>
          <button className="primary-btn" type="submit">
            添加任务
          </button>
        </form>

        <section className="list-panel" aria-label="任务列表">
          <div className="controls">
            <input
              className="search"
              type="search"
              placeholder="搜索任务"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="filters" role="tablist" aria-label="筛选任务">
              {(Object.keys(filterLabels) as TodoFilter[]).map((filterName) => (
                <button
                  className={`filter-btn${filter === filterName ? " active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={filter === filterName}
                  key={filterName}
                  onClick={() => setFilter(filterName)}
                >
                  {filterLabels[filterName]}
                </button>
              ))}
            </div>
          </div>

          <ul className="todo-list" aria-label="待办事项">
            {visibleTodos.map((todo) => (
              <li className={`todo-item${todo.done ? " done" : ""}`} key={todo.id}>
                <button
                  className="check"
                  type="button"
                  title={todo.done ? "标记为待办" : "标记为完成"}
                  aria-label={todo.done ? "标记为待办" : "标记为完成"}
                  onClick={() =>
                    updateTodos(
                      todos.map((item) =>
                        item.id === todo.id ? { ...item, done: !item.done } : item
                      )
                    )
                  }
                >
                  ✓
                </button>

                <div className="todo-main">
                  <input
                    className="todo-title"
                    defaultValue={todo.text}
                    maxLength={80}
                    aria-label="编辑任务"
                    onBlur={(event) => updateTitle(todo, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.currentTarget.blur();
                      }
                    }}
                  />
                  <div className="meta">
                    <span className={`pill ${todo.priority}`}>{priorityLabels[todo.priority]}</span>
                    <span className="pill">{formatTodoDate(todo.date)}</span>
                  </div>
                </div>

                <div className="actions">
                  <button
                    className="icon-btn"
                    type="button"
                    title="复制任务"
                    aria-label="复制任务"
                    onClick={() => updateTodos([duplicateTodo(todo), ...todos])}
                  >
                    +
                  </button>
                  <button
                    className="icon-btn"
                    type="button"
                    title="删除任务"
                    aria-label="删除任务"
                    onClick={() => updateTodos(todos.filter((item) => item.id !== todo.id))}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className={`empty${visibleTodos.length === 0 ? " show" : ""}`}>还没有匹配的任务</div>
        </section>
      </section>

      <div className="theme-switcher" role="group" aria-label="主题切换">
        {(["light", "dark"] as Theme[]).map((themeName) => (
          <button
            className={`theme-option${theme === themeName ? " active" : ""}`}
            type="button"
            aria-pressed={theme === themeName}
            key={themeName}
            onClick={() => setTheme(themeName)}
          >
            {themeName === "light" ? "浅色" : "深色"}
          </button>
        ))}
      </div>
    </main>
  );
}
