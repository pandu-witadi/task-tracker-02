import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { formatDueDate, getTimeRemaining, getDueDateVariant } from '@/lib/date-utils';
import { Badge } from '../ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const priorityConfig = {
  low: { 
    label: 'Low',
    class: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    icon: '↓',
  },
  medium: { 
    label: 'Medium',
    class: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    icon: '→',
  },
  high: { 
    label: 'High',
    class: 'bg-red-100 text-red-800 hover:bg-red-200',
    icon: '↑',
  },
};

const statusConfig = {
  todo: { label: 'To Do', class: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', class: 'bg-blue-100 text-blue-800' },
  done: { label: 'Done', class: 'bg-green-100 text-green-800' },
};

const categoryColors = [
  'bg-purple-100 text-purple-800',
  'bg-green-100 text-green-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-amber-100 text-amber-800',
];

function TaskCardSkeleton() {
  return (
    <Card className="mb-4 animate-pulse">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center space-x-4 pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-32" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  );
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, isLoading = false }) {
  const getCategoryColor = (category) => {
    if (!category) return '';
    const index = Math.abs(category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % categoryColors.length;
    return categoryColors[index];
  };

  if (isLoading) {
    return <TaskCardSkeleton />;
  }

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.todo;
  return (
    <Card className="mb-4 transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start space-x-2">
          <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
          <div className="flex space-x-2">
            <Badge 
              variant="outline" 
              className={`${priority.class} flex items-center space-x-1`}
            >
              <span>{priority.icon}</span>
              <span>{priority.label}</span>
            </Badge>
          </div>
        </div>
        
        {task.category && (
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
              {task.category}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {task.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{task.description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          {task.dueDate && (
            <div className="bg-muted/20 rounded-lg p-2.5 -mx-1">
              <div className="flex items-start gap-3">
                <div className="bg-background p-1.5 rounded-md border">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {formatDueDate(task.dueDate)}
                    </span>
                    {task.status !== 'done' && (
                      <div 
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center leading-none ${
                          isPast(new Date(task.dueDate)) 
                            ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap">{getTimeRemaining(task.dueDate).text}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>{format(new Date(task.dueDate), 'EEEE')}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="font-medium">
                        {format(new Date(task.dueDate), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <span className="w-20 text-gray-500">Status:</span>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className={`ml-2 p-1 rounded text-sm ${status.class} border-0 focus:ring-2 focus:ring-offset-1`}
            >
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(task)}
            className="hover:bg-gray-100"
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(task._id)}
            className="hover:bg-destructive/90"
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
