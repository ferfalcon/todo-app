import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Task } from '../types/task';
import { fetchAllTasks, createTask } from '../api/tasks';
import { ApiError } from '../api/client';

type FilterValue = 'all' | 'active' | 'completed';

export function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');

  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');

  // Load tasks once when the page mounts
  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setIsLoadingTasks(true);
      setError(null);

      try {
        const allTasks = await fetchAllTasks();
        if (!isMounted) return;
        setTasks(allTasks);
      } catch (err) {
        if (!isMounted) return;

        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Unable to load tasks.');
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
    if (filter === 'all') {
      return tasks;
    }

    return tasks.filter((task) => {
      if (filter === 'active') {
        return task.status === 'active';
      }
      // filter === 'completed'
      return task.status === 'completed';
    });
  }, [tasks, filter]);

  const remainingCount = useMemo(
    () => tasks.filter((task) => task.status === 'active').length,
    [tasks],
  );

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newTitle.trim();

    if (!trimmed) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const created = await createTask({ title: trimmed });
      setTasks((prev) => [...prev, created]);
      setNewTitle('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to create task.');
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="todo-page">
      <header className="todo-page__header">
        <h1 className="todo-page__title">Todo</h1>
      </header>

      {/* New task form */}
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

      {/* Error message */}
      {error && (
        <p className="todo-page__error">
          {error}
        </p>
      )}

      {/* Tasks list / loading / empty states */}
      <div className="todo-page__list-container">
        {isLoadingTasks ? (
          <p className="todo-page__loading">Loading tasks…</p>
        ) : filteredTasks.length === 0 ? (
          <p className="todo-page__empty">
            {tasks.length === 0
              ? 'No tasks yet. Add your first todo!'
              : 'No tasks match this filter.'}
          </p>
        ) : (
          <ul className="todo-page__list">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className={`todo-page__item todo-page__item--${task.status}`}
              >
                <span className="todo-page__item-title">
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: items left + filters (client-side only for now) */}
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
          disabled={tasks.every((task) => task.status !== 'completed')}
        >
          Clear completed
        </button>
      </footer>
    </section>
  );
}
