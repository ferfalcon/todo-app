import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Task } from '../types/task';
import {
  fetchAllTasks,
  createTask,
  updateTask,
  deleteTask,
  clearCompletedTasks,
  reorderTasks,
} from '../api/tasks';
import { ApiError } from '../api/client';

// dnd-kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

type FilterValue = 'all' | 'active' | 'completed';

function SortableTaskItem(props: {
  task: Task;
  isBusy: boolean;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { task, isBusy, onToggle, onDelete } = props;

  const isCompleted = task.status === 'completed';

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isBusy,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`todo-page__item todo-page__item--${task.status}`}
    >
      {/* Drag handle (separate from toggle so clicks don't conflict) */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="todo-page__drag-handle"
        aria-label="Drag to reorder"
        disabled={isBusy}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>

      <button
        type="button"
        className="todo-page__toggle"
        aria-label={isCompleted ? 'Mark as active' : 'Mark as completed'}
        onClick={() => onToggle(task)}
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
        onClick={() => onDelete(task)}
        disabled={isBusy}
      >
        ×
      </button>
    </li>
  );
}

export function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');

  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());

  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const canReorder =
    filter === 'all' &&
    tasks.length > 1 &&
    !isLoadingTasks &&
    !loadError &&
    !isCreating &&
    !isClearing &&
    !isReordering;

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
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Unable to create task.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggleTask(task: Task) {
    if (busyIds.has(task.id) || isReordering) return;

    markBusy(task.id);
    setActionError(null);

    const nextStatus = task.status === 'active' ? 'completed' : 'active';

    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Unable to update task.');
    } finally {
      unmarkBusy(task.id);
    }
  }

  async function handleDeleteTask(task: Task) {
    if (busyIds.has(task.id) || isReordering) return;

    markBusy(task.id);
    setActionError(null);

    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Unable to delete task.');
    } finally {
      unmarkBusy(task.id);
    }
  }

  async function handleClearCompleted() {
    if (!hasCompleted || isClearing || isReordering) return;

    setIsClearing(true);
    setActionError(null);

    try {
      await clearCompletedTasks();
      setTasks((prev) => prev.filter((t) => t.status !== 'completed'));
    } catch (err) {
      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Unable to clear completed tasks.');
    } finally {
      setIsClearing(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (!canReorder) return;

    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = tasks;
    const optimistic = arrayMove(tasks, oldIndex, newIndex);

    // Update UI immediately
    setTasks(optimistic);
    setIsReordering(true);
    setActionError(null);

    try {
      const orderedIds = optimistic.map((t) => t.id);
      const persisted = await reorderTasks(orderedIds);

      // Backend returns items in the new order — trust it.
      setTasks(persisted);
    } catch (err) {
      // Revert UI if persistence fails
      setTasks(previous);

      if (err instanceof ApiError) setActionError(err.message);
      else setActionError('Unable to reorder tasks.');
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <section className="todo-page">
      <header className="todo-page__header">
        <h1 className="todo-page__title">Todo</h1>
      </header>

      <form className="todo-page__new-task-form" onSubmit={handleCreateTask} noValidate>
        <input
          type="text"
          className="todo-page__new-task-input"
          placeholder="Create a new todo..."
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          disabled={isCreating || isReordering}
        />
        <button
          type="submit"
          className="todo-page__new-task-submit"
          disabled={isCreating || isReordering}
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
        ) : canReorder ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="todo-page__list">
                {tasks.map((task) => {
                  const isBusy = busyIds.has(task.id) || isReordering;
                  return (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      isBusy={isBusy}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                    />
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <>
            {filter !== 'all' && tasks.length > 1 && (
              <p className="todo-page__hint">
                Switch to <strong>All</strong> to reorder tasks.
              </p>
            )}
            <ul className="todo-page__list">
              {filteredTasks.map((task) => {
                const isBusy = busyIds.has(task.id) || isReordering;
                const isCompleted = task.status === 'completed';

                return (
                  <li
                    key={task.id}
                    className={`todo-page__item todo-page__item--${task.status}`}
                  >
                    <button
                      type="button"
                      className="todo-page__toggle"
                      aria-label={isCompleted ? 'Mark as active' : 'Mark as completed'}
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
          </>
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
          disabled={!hasCompleted || isClearing || isReordering}
        >
          {isClearing ? 'Clearing…' : 'Clear completed'}
        </button>
      </footer>
    </section>
  );
}
