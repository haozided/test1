export type Priority = "low" | "medium" | "high";
export type TodoFilter = "all" | "active" | "done";

export interface Todo {
  id: string;
  text: string;
  date: string;
  priority: Priority;
  done: boolean;
}

export interface TodoDraft {
  text: string;
  date: string;
  priority: Priority;
}

export const storageKey = "codex-todo-list";
export const themeStorageKey = "codex-todo-theme";

export const priorityLabels: Record<Priority, string> = {
  low: "普通",
  medium: "重要",
  high: "紧急"
};

export function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createTodo(draft: TodoDraft, id = createId()): Todo {
  return {
    id,
    text: draft.text.trim(),
    date: draft.date,
    priority: draft.priority,
    done: false
  };
}

export function duplicateTodo(todo: Todo, id = createId()): Todo {
  return {
    ...todo,
    id,
    text: `${todo.text} 副本`,
    done: false
  };
}

export function filterTodos(todos: Todo[], filter: TodoFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return todos.filter((todo) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !todo.done) ||
      (filter === "done" && todo.done);
    const matchesSearch = todo.text.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesSearch;
  });
}

export function todoStats(todos: Todo[]) {
  const done = todos.filter((todo) => todo.done).length;

  return {
    total: todos.length,
    active: todos.length - done,
    done
  };
}

export function formatTodoDate(value: string) {
  if (!value) return "未设日期";

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export function loadTodos(storage: Pick<Storage, "getItem">): Todo[] {
  const raw = storage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isTodo);
  } catch {
    return [];
  }
}

export function saveTodos(storage: Pick<Storage, "setItem">, todos: Todo[]) {
  storage.setItem(storageKey, JSON.stringify(todos));
}

export function defaultTodos(today = new Date().toISOString().slice(0, 10)): Todo[] {
  return [
    {
      id: createId(),
      text: "整理今天的待办事项",
      date: today,
      priority: "medium",
      done: false
    },
    {
      id: createId(),
      text: "完成一个小目标",
      date: "",
      priority: "low",
      done: true
    }
  ];
}

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") return false;

  const todo = value as Todo;
  const priorities: Priority[] = ["low", "medium", "high"];

  return (
    typeof todo.id === "string" &&
    typeof todo.text === "string" &&
    typeof todo.date === "string" &&
    typeof todo.done === "boolean" &&
    priorities.includes(todo.priority)
  );
}
