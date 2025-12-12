import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Task } from '../types/task';
import {
  fetchAllTasks,
  createTask,
  updateTask,
  deleteTask,
  clearCompletedTasks,
} from '../api/tasks';
import { ApiError } from '../api/client';

type FilterValue = 'all' | 'active' | 'completed';

export function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');

  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Track per-task operations (toggle/delete)
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());

  // Separate load errors from action errors
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');

  function markBusy(id: string) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function unmarkBusy(id: string) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  // Load tasks once when the page mounts
  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setIsLoadingTasks(true);
      setLoadError(null);

      try {
        const allTasks = await fetchAllTasks();
        if (!isMounted) return;
        setTasks(allTasks);
      } catch (err) {
        if (!isMounted) return;

        if (err instanceof ApiError) {
          setLoadError(err.message);
        } else {
          setLoadError('Unable to load tasks.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      }
    }

    void loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;

    return tasks.filter((task) => {
      if (filter === 'active') return task.status === 'active';
      return task.status === 'completed';
    });
  }, [tasks, filter]);

  const remainingCount = useMemo(
    () => tasks.filter((task) => task.status === 'active').length,
    [tasks],
  );

  const hasCompleted = useMemo(
    () => tasks.some((task) => task.status === 'completed'),
    [tasks],
  );

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newTitle.trim();

    if (!trimmed) return;

    setIsCreating(true);
    setActionError(null);

    try {
      const created = await createTask({ title: trimmed });
      setTasks((prev) => [...prev, created]);
      setNewTitle('');
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError('Unable to create task.');
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleTask(task: Task) {
    if (busyIds.has(task.id)) return;

    markBusy(task.id);
    setActionError(null);

    const nextStatus = task.status === 'active' ? 'completed' : 'active';

    try {
      const updated = await updateTask(task.id, { status: nextStatus });

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t)),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError('Unable to update task.');
      }
    } finally {
      unmarkBusy(task.id);
    }
  }

  async function handleDeleteTask(task: Task) {
    if (busyIds.has(task.id)) return;

    markBusy(task.id);
    setActionError(null);

    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError('Unable to delete task.');
      }
    } finally {
      unmarkBusy(task.id);
    }
  }

  async function handleClearCompleted() {
    if (!hasCompleted || isClearing) return;

    setIsClearing(true);
    setActionError(null);

    try {
      await clearCompletedTasks();
      setTasks((prev) => prev.filter((t) => t.status !== 'completed'));
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError('Unable to clear completed tasks.');
      }
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <section className="todo-page">
      <header className="todo-page__header">
        <h1 className="todo-page__title">Todo</h1>
      </header>

      <form
        className="todo-page__new-task-form"
        onSubmit={handleCreateTask}
        noValidate
      >
        <input
          type="text"
          className="todo-page__new-task-input"
          placeholder="Create a new todo..."
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          disabled={isCreating}
        />
        <button
          type="submit"
          className="todo-page__new-task-submit"
          disabled={isCreating}
        >
          {isCreating ? 'Adding…' : 'Add'}
        </button>
      </form>

      {(loadError || actionError) && (
        <p className="todo-page__error">{actionError ?? loadError}</p>
      )}

      <div className="todo-page__list-container">
        {isLoadingTasks ? (
          <p className="todo-page__loading">Loading tasks…</p>
        ) : loadError ? (
          <p className="todo-page__loading">Could not load tasks.</p>
        ) : filteredTasks.length === 0 ? (
          <p className="todo-page__empty">
            {tasks.length === 0
              ? 'No tasks yet. Add your first todo!'
              : 'No tasks match this filter.'}
          </p>
        ) : (
          <ul className="todo-page__list">
            {filteredTasks.map((task) => {
              const isBusy = busyIds.has(task.id);
              const isCompleted = task.status === 'completed';

              return (
                <li
                  key={task.id}
                  className={`todo-page__item todo-page__item--${task.status}`}
                >
                  <button
                    type="button"
                    className="todo-page__toggle"
                    aria-label={
                      isCompleted ? 'Mark as active' : 'Mark as completed'
                    }
                    onClick={() => handleToggleTask(task)}
                    disabled={isBusy}
                  >
                    {isCompleted ? '✓' : ''}
                  </button>

                  <span
                    className={`todo-page__item-title${
                      isCompleted ? ' todo-page__item-title--completed' : ''
                    }`}
                  >
                    {task.title}
                  </span>

                  <button
                    type="button"
                    className="todo-page__delete"
                    aria-label="Delete task"
                    onClick={() => handleDeleteTask(task)}
                    disabled={isBusy}
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="todo-page__footer">
        <span className="todo-page__items-left">
          {remainingCount} item{remainingCount === 1 ? '' : 's'} left
        </span>

        <div className="todo-page__filters">
          <button
            type="button"
            className={`todo-page__filter-button${
              filter === 'all' ? ' todo-page__filter-button--active' : ''
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`todo-page__filter-button${
              filter === 'active' ? ' todo-page__filter-button--active' : ''
            }`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            type="button"
            className={`todo-page__filter-button${
              filter === 'completed' ? ' todo-page__filter-button--active' : ''
            }`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        <button
          type="button"
          className="todo-page__clear-completed"
          onClick={handleClearCompleted}
          disabled={!hasCompleted || isClearing}
        >
          {isClearing ? 'Clearing…' : 'Clear completed'}
        </button>
      </footer>
    </section>
  );
}
