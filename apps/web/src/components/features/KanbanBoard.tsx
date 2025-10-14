'use client';

import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, MoreVertical, Trash2, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMoveTask, useDeleteTask } from '@/lib/hooks';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  dueDate?: string;
  assignee?: any;
  position: number;
  columnId: string;
}

interface Column {
  id: string;
  name: string;
  position: number;
}

interface KanbanBoardProps {
  board: {
    id: string;
    name: string;
    columns: Column[];
    tasks: Task[];
  };
  onCreateTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
}

const ItemType = 'TASK';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

function TaskCard({ task, onEdit }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const deleteTask = useDeleteTask();

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: task.id, columnId: task.columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    high: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    urgent: 'bg-red-500/20 text-red-600 dark:text-red-400',
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
      await deleteTask.mutateAsync(task.id);
    }
  };

  return (
    <div
      ref={drag as any}
      onClick={() => onEdit(task)}
      className={`glass-card cursor-pointer mb-3 relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm flex-1">{task.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="glass-panel p-1 hover:bg-white/20 dark:hover:bg-white/10 rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <span
          className={`px-2 py-1 rounded-full ${
            priorityColors[task.priority as keyof typeof priorityColors]
          }`}
        >
          {task.priority}
        </span>

        {task.dueDate && (
          <span className="flex items-center text-slate-500">
            <Calendar className="w-3 h-3 mr-1" />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>

      {task.assignee && (
        <div className="flex items-center mt-2 text-xs text-slate-600 dark:text-slate-400">
          <User className="w-3 h-3 mr-1" />
          {task.assignee.name}
        </div>
      )}

      {showMenu && (
        <div className="absolute top-10 right-2 glass-panel p-2 rounded-lg shadow-glass-lg z-10 min-w-[120px]">
          <button
            onClick={handleDelete}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
}

function KanbanColumn({ column, tasks, onCreateTask, onEditTask }: KanbanColumnProps) {
  const moveTask = useMoveTask();

  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: async (item: { id: string; columnId: string }) => {
      if (item.columnId !== column.id) {
        // Move to new column
        await moveTask.mutateAsync({
          id: item.id,
          data: {
            columnId: column.id,
            position: tasks.length,
          },
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop as any}
      className={`glass-panel p-4 rounded-xl min-w-[300px] transition-colors ${
        isOver ? 'bg-primary-500/10' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold">{column.name}</h3>
          <span className="glass-panel px-2 py-0.5 rounded-full text-xs">{tasks.length}</span>
        </div>
        <Button size="sm" variant="ghost" icon={Plus} onClick={onCreateTask} />
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEditTask} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard({ board, onCreateTask, onEditTask }: KanbanBoardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="overflow-x-auto pb-4 scrollbar-glass">
        <div className="flex space-x-4 min-w-max">
          {board.columns
            .sort((a, b) => a.position - b.position)
            .map((column) => {
              const columnTasks = board.tasks
                .filter((task) => task.columnId === column.id)
                .sort((a, b) => a.position - b.position);

              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onCreateTask={() => onCreateTask(column.id)}
                  onEditTask={onEditTask}
                />
              );
            })}
        </div>
      </div>
    </DndProvider>
  );
}
