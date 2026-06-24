import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders seeded todos and stats", () => {
    render(<App />);

    expect(screen.getByDisplayValue("整理今天的待办事项")).toBeInTheDocument();
    expect(screen.getByDisplayValue("完成一个小目标")).toBeInTheDocument();
    expect(screen.getByText("待完成")).toBeInTheDocument();
    expect(screen.getByText("已完成")).toBeInTheDocument();
  });

  it("adds, completes, duplicates, deletes and persists a todo", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("任务"), { target: { value: "检查桌面客户端" } });
    fireEvent.change(screen.getByLabelText("日期"), { target: { value: "2026-06-24" } });
    fireEvent.change(screen.getByLabelText("优先级"), { target: { value: "high" } });
    fireEvent.click(screen.getByRole("button", { name: "添加任务" }));

    const newTodo = screen.getByDisplayValue("检查桌面客户端").closest("li");
    expect(newTodo).not.toBeNull();
    expect(within(newTodo as HTMLElement).getByText("紧急")).toBeInTheDocument();

    fireEvent.click(within(newTodo as HTMLElement).getByRole("button", { name: "标记为完成" }));
    expect((screen.getByDisplayValue("检查桌面客户端").closest("li") as HTMLElement).className).toContain("done");

    fireEvent.click(screen.getAllByRole("button", { name: "复制任务" })[0]);
    expect(screen.getByDisplayValue("检查桌面客户端 副本")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "删除任务" })[0]);
    expect(screen.queryByDisplayValue("检查桌面客户端 副本")).not.toBeInTheDocument();
    expect(localStorage.getItem("codex-todo-list")).toContain("检查桌面客户端");
  });

  it("filters and searches todos", () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("搜索任务"), { target: { value: "小目标" } });
    expect(screen.getByDisplayValue("完成一个小目标")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("整理今天的待办事项")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "待办" }));
    expect(screen.getByText("还没有匹配的任务")).toHaveClass("show");
  });

  it("switches theme", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "深色" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("codex-todo-theme")).toBe("dark");
  });
});
