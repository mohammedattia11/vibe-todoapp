"use client";

import { useEffect, useMemo, useState } from "react";
import { SunIcon, MoonIcon, ListTodoIcon, PlusIcon, Trash2Icon, Edit2Icon, SaveIcon, XIcon, GripVerticalIcon, CheckCircle2Icon, CircleIcon, SearchIcon, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Types
export type Priority = "low" | "medium" | "high";
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  priority: Priority;
  notes?: string;
}

// Utils
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("todos");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Todo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  try {
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch {}
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme } as const;
}

function ThemeToggle({ theme, onChange }: { theme: "light" | "dark"; onChange: (t: "light" | "dark") => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="sr-only" id="theme-label">Toggle theme</span>
      <Button
        aria-labelledby="theme-label"
        variant="outline"
        size="icon"
        className={cn("relative")}
        onClick={() => onChange(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? (
          <SunIcon className="size-5" />
        ) : (
          <MoonIcon className="size-5" />
        )}
      </Button>
    </div>
  );
}

function Navbar({
  theme,
  onThemeChange,
  query,
  onQuery,
}: {
  theme: "light" | "dark";
  onThemeChange: (t: "light" | "dark") => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 mr-auto">
          <div className="size-9 grid place-content-center rounded-md border bg-muted">
            <ListTodoIcon className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Taskmate</div>
            <div className="text-xs text-muted-foreground">Stay organized. Get things done.</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 w-[380px] max-w-full">
          <div className="relative w-full">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8"
            />
          </div>
        </div>
        <ThemeToggle theme={theme} onChange={onThemeChange} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More actions">
              <FilterIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>No actions</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>About Taskmate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Sidebar({
  stats,
  filters,
  onTogglePriority,
  onClearCompleted,
}: {
  stats: { total: number; active: number; completed: number };
  filters: { low: boolean; medium: boolean; high: boolean };
  onTogglePriority: (p: Priority) => void;
  onClearCompleted: () => void;
}) {
  return (
    <aside className="w-full md:w-64 shrink-0">
      <Card className="sticky top-[76px]">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Overview</CardTitle>
          <CardDescription>Snapshot of your tasks</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-semibold">{stats.total}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Active</div>
              <div className="text-lg font-semibold">{stats.active}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">Done</div>
              <div className="text-lg font-semibold">{stats.completed}</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="text-xs font-medium text-muted-foreground">Priorities</div>
            <label className="flex items-center gap-2">
              <Checkbox checked={filters.low} onCheckedChange={() => onTogglePriority("low")} />
              <span className="text-sm">Low</span>
              <Badge variant="outline" className="ml-auto">Low</Badge>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={filters.medium} onCheckedChange={() => onTogglePriority("medium")} />
              <span className="text-sm">Medium</span>
              <Badge variant="secondary" className="ml-auto">Med</Badge>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={filters.high} onCheckedChange={() => onTogglePriority("high")} />
              <span className="text-sm">High</span>
              <Badge variant="destructive" className="ml-auto">High</Badge>
            </label>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={onClearCompleted}>
              <Trash2Icon className="size-4" /> Clear completed
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

function AddTodoForm({ onAdd }: { onAdd: (payload: { title: string; priority: Priority }) => void }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  function submit() {
    const t = title.trim();
    if (!t) return;
    onAdd({ title: t, priority });
    setTitle("");
    setPriority("medium");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        aria-label="Task title"
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
        <SelectTrigger>
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={submit} className="whitespace-nowrap">
        <PlusIcon className="size-4" /> Add
      </Button>
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
  onSave,
  draggableProps,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, changes: Partial<Todo>) => void;
  draggableProps?: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.title);

  useEffect(() => setText(todo.title), [todo.title]);

  const priorityBadge = (
    <Badge
      variant={todo.priority === "high" ? "destructive" : todo.priority === "medium" ? "secondary" : "outline"}
      className="shrink-0"
    >
      {todo.priority}
    </Badge>
  );

  return (
    <div
      className={cn(
        "group rounded-md border bg-card p-3 flex items-center gap-3 w-full",
        todo.completed && "opacity-80"
      )}
      aria-label={`Todo: ${todo.title}`}
      {...draggableProps}
    >
      <div className="cursor-grab active:cursor-grabbing select-none hidden sm:block text-muted-foreground" aria-hidden>
        <GripVerticalIcon className="size-4" />
      </div>
      <Checkbox checked={todo.completed} onCheckedChange={() => onToggle(todo.id)} />
      <div className="flex-1 min-w-0">
        {editing ? (
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter") {
              const t = text.trim();
              if (t) onSave(todo.id, { title: t });
              setEditing(false);
            }
            if (e.key === "Escape") {
              setText(todo.title);
              setEditing(false);
            }
          }} />
        ) : (
          <div className={cn("flex items-center gap-2 truncate", todo.completed && "text-muted-foreground line-through")}> 
            <span className="truncate">{todo.title}</span>
            {todo.completed ? <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" /> : <CircleIcon className="size-4 text-muted-foreground" />}
          </div>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {priorityBadge}
          <span className="truncate">Created {new Date(todo.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {editing ? (
          <>
            <Button size="icon" variant="outline" onClick={() => { const t = text.trim(); if (t) onSave(todo.id, { title: t }); setEditing(false); }}>
              <SaveIcon className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => { setText(todo.title); setEditing(false); }}>
              <XIcon className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
              <Edit2Icon className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(todo.id)}>
              <Trash2Icon className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function TodoList({
  todos,
  onToggle,
  onDelete,
  onReorder,
  onSave,
}: {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
  onSave: (id: string, changes: Partial<Todo>) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);

  function handleDragStart(id: string) {
    return (e: React.DragEvent) => {
      setDragId(id);
      e.dataTransfer?.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    };
  }
  function handleDragOver(targetId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragId || dragId === targetId) return;
      e.dataTransfer.dropEffect = "move";
    };
  }
  function handleDrop(targetId: string) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const sourceId = dragId || e.dataTransfer.getData("text/plain");
      if (sourceId && sourceId !== targetId) onReorder(sourceId, targetId);
      setDragId(null);
    };
  }

  return (
    <div className="space-y-2">
      {todos.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No tasks here. Add some to get started!</div>
      ) : (
        todos.map((t) => (
          <TodoItem
            key={t.id}
            todo={t}
            onToggle={onToggle}
            onDelete={onDelete}
            onSave={onSave}
            draggableProps={{
              draggable: true,
              onDragStart: handleDragStart(t.id),
              onDragOver: handleDragOver(t.id),
              onDrop: handleDrop(t.id),
            }}
          />
        ))
      )}
    </div>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<{ low: boolean; medium: boolean; high: boolean }>({ low: true, medium: true, high: true });
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const initial = loadTodos();
    if (initial.length) setTodos(initial);
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return todos
      .filter((t) => (activeTab === "active" ? !t.completed : activeTab === "completed" ? t.completed : true))
      .filter((t) => (priorityFilter[t.priority]))
      .filter((t) => (lower ? t.title.toLowerCase().includes(lower) : true));
  }, [todos, activeTab, priorityFilter, query]);

  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  }), [todos]);

  function addTodo(payload: { title: string; priority: Priority }) {
    const now = Date.now();
    setTodos((prev) => [
      { id: uid(), title: payload.title, completed: false, priority: payload.priority, createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t));
  }
  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }
  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }
  function reorder(sourceId: string, targetId: string) {
    setTodos((prev) => {
      const srcIdx = prev.findIndex((t) => t.id === sourceId);
      const tgtIdx = prev.findIndex((t) => t.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(srcIdx, 1);
      copy.splice(tgtIdx, 0, moved);
      return copy.map((t, i) => ({ ...t, updatedAt: t.id === moved.id ? Date.now() : t.updatedAt }));
    });
  }
  function saveTodo(id: string, changes: Partial<Todo>) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, ...changes, updatedAt: Date.now() } : t));
  }

  function togglePriorityFilter(p: Priority) {
    setPriorityFilter((f) => ({ ...f, [p]: !f[p] }));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar theme={theme} onThemeChange={setTheme} query={query} onQuery={setQuery} />

      <main className="container mx-auto max-w-5xl px-4 py-6 flex-1 grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6">
        <Sidebar stats={stats} filters={priorityFilter} onTogglePriority={togglePriorityFilter} onClearCompleted={clearCompleted} />
        <section className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Add task</CardTitle>
              <CardDescription>Capture what you need to do next</CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <AddTodoForm onAdd={addTodo} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Your tasks</CardTitle>
                  <CardDescription>Filter, prioritize and complete</CardDescription>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Label htmlFor="theme-switch" className="text-xs">Theme</Label>
                  <Switch id="theme-switch" checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
                </div>
              </div>
              <div className="mt-3">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <TodoList todos={filtered} onToggle={toggleTodo} onDelete={deleteTodo} onReorder={reorder} onSave={saveTodo} />
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto max-w-5xl px-4 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-medium">Taskmate</span> — {stats.active} tasks remaining
          </div>
          <div className="flex items-center gap-2">
            <span>Made with</span> <span role="img" aria-label="love">❤️</span> <span>and</span> <span role="img" aria-label="coffee">☕️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
