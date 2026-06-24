import { describe, expect, it, vi } from "vitest";
import {
  Todo,
  createTodo,
  duplicateTodo,
  filterTodos,
  loadTodos,
  saveTodos,
  todoStats
} from "./todos";

const todos: Todo[] = [
  { id: "1", text: "写日报", date: "2026-06-24", priority: "medium", done: false },
  { id: "2", text: "整理资料", date: "", priority: "low", done: true },
  { id: "3", text: "发布版本", date: "", priority: "high", done: false }
];

describe("todo helpers", () => {
  it("creates trimmed active todos", () => {
    expect(createTodo({ text: "  预订会议室  ", date: "", priority: "low" }, "id-1")).toEqual({
      id: "id-1",
      text: "预订会议室",
      date: "",
      priority: "low",
      done: false
    });
  });

  it("duplicates as an active copy", () => {
    expect(duplicateTodo(todos[1], "copy-1")).toMatchObject({
      id: "copy-1",
      text: "整理资料 副本",
      done: false
    });
  });

  it("filters by status and search query", () => {
    expect(filterTodos(todos, "active", "版本")).toHaveLength(1);
    expect(filterTodos(todos, "done", "")).toEqual([todos[1]]);
    expect(filterTodos(todos, "all", "不存在")).toHaveLength(0);
  });

  it("calculates stats", () => {
    expect(todoStats(todos)).toEqual({ total: 3, active: 2, done: 1 });
  });

  it("loads only valid stored todos", () => {
    const storage = {
      getItem: vi.fn(() =>
        JSON.stringify([
          todos[0],
          { id: "bad", text: "broken", date: "", priority: "unknown", done: false }
        ])
      )
    };

    expect(loadTodos(storage)).toEqual([todos[0]]);
  });

  it("saves todos as json", () => {
    const storage = { setItem: vi.fn() };
    saveTodos(storage, todos);

    expect(storage.setItem).toHaveBeenCalledWith("codex-todo-list", JSON.stringify(todos));
  });
});
