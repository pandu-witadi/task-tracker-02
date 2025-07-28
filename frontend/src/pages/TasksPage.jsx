import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import taskApi from '../services/taskApi';

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchTasks = useCallback(async (showLoading = true) => {
    const loadingToast = showLoading ? toast.loading('Loading tasks...') : null;
    
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const response = await taskApi.getTasks();
      const tasks = response.data.tasks || [];
      setTasks(tasks);
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
        if (tasks.length === 0) {
          toast.info('No tasks found. Create one to get started!');
        } else {
          toast.success(`Loaded ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load tasks. Please try again.';
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      toast.error(errorMessage, {
        description: 'Please check your connection and try again.',
      });
      
      return [];
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  // Refresh tasks when dialog closes
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Small delay to allow dialog to close before refreshing
    setTimeout(() => fetchTasks(false), 300);
  };

  const handleCreateTask = () => {
    setCurrentTask({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      category: '',
      tags: []
    });
    setIsDialogOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t._id === taskId);
    
    // Use a promise for the confirmation dialog
    const confirmDelete = () => new Promise((resolve) => {
      // Custom confirmation UI instead of default confirm
      toast(
        <div className="p-4">
          <h3 className="font-medium text-lg mb-2">Delete Task</h3>
          <p className="text-gray-600 mb-4">Are you sure you want to delete "{taskToDelete?.title}"? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => resolve(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={() => resolve(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete
            </button>
          </div>
        </div>,
        {
          duration: 10000, // Longer duration for user to respond
          id: 'delete-confirmation',
        }
      );
    });
    
    const shouldDelete = await confirmDelete();
    if (!shouldDelete) {
      toast.dismiss('delete-confirmation');
      return;
    }
    
    const deleteToast = toast.loading('Deleting task...');
    
    try {
      // Optimistic update
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      
      await taskApi.deleteTask(taskId);
      
      toast.success('Task deleted successfully!', {
        id: deleteToast,
        description: `"${taskToDelete?.title}" has been removed.`,
      });
      
      // Refresh in background
      fetchTasks(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // Revert optimistic update on error
      if (taskToDelete) {
        setTasks(prevTasks => [...prevTasks, taskToDelete].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        ));
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to delete task. Please try again.';
      toast.error('Error deleting task', {
        id: deleteToast,
        description: errorMessage,
      });
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskApi.updateTask(taskId, { status });
      // Optimistic update
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status } : task
        )
      );
      
      // Refresh in background
      fetchTasks(false);
      
      toast.success('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update task status. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleSubmitTask = async (taskData) => {
    const isEditing = !!currentTask?._id;
    const loadingMessage = isEditing ? 'Updating task...' : 'Creating task...';
    const successMessage = isEditing ? 'Task updated successfully!' : 'Task created successfully!';
    
    const submitToast = toast.loading(loadingMessage);
    
    try {
      setIsSubmitting(true);
      let response;
      
      if (isEditing) {
        // Update existing task
        response = await taskApi.updateTask(currentTask._id, taskData);
        
        // Optimistic update
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === currentTask._id ? { ...task, ...taskData } : task
          )
        );
      } else {
        // Create new task
        response = await taskApi.createTask(taskData);
        
        // Optimistic update
        if (response.data?.task) {
          setTasks(prevTasks => [response.data.task, ...prevTasks]);
        }
      }
      
      toast.success(successMessage, {
        id: submitToast,
        description: isEditing 
          ? `"${taskData.title}" has been updated.`
          : `"${taskData.title}" has been added to your tasks.`,
      });
      
      setIsDialogOpen(false);
      // Refresh in background
      fetchTasks(false);
      
      return response?.data?.task;
    } catch (error) {
      console.error('Error saving task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save task. Please try again.';
      
      toast.error('Error saving task', {
        id: submitToast,
        description: errorMessage,
      });
      
      throw error; // Re-throw to allow form to handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        </div>
        <Button onClick={handleCreateTask} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      <div className="bg-background rounded-lg border shadow-sm">
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onCreateNew={handleCreateTask}
          onRefresh={() => fetchTasks(false)}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          aria-describedby="task-form-description"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {currentTask?._id ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <p id="task-form-description" className="sr-only">
              {currentTask?._id 
                ? 'Edit the details of your task including title, description, due date, priority, and status.'
                : 'Fill out the form to create a new task. Include a title, description, due date, priority, and status.'
              }
            </p>
          </DialogHeader>
          <div className="py-4">
            <TaskForm
              task={currentTask}
              onSubmit={handleSubmitTask}
              isSubmitting={isSubmitting}
              onCancel={handleDialogClose}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
