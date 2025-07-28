import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, Tag, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
];

const statusOptions = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' },
];

// Sample categories - in a real app, these would come from the backend or context
const defaultCategories = [
  'Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Other'
];

// Sample tags - in a real app, these would come from the backend or context
const defaultTags = [
  'Urgent', 'Important', 'Backlog', 'In Review', 'Blocked', 'Idea'
];

export function TaskForm({ task = {}, onSubmit, onCancel, isSubmitting: propIsSubmitting = false }) {
  const [isSubmitting, setIsSubmitting] = useState(propIsSubmitting);
  
  // Sync the prop with local state when it changes
  useEffect(() => {
    setIsSubmitting(propIsSubmitting);
  }, [propIsSubmitting]);
  
  const [formData, setFormData] = useState(() => ({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? new Date(task.dueDate) : null,
    category: task?.category || '',
    tags: Array.isArray(task?.tags) ? [...task.tags] : [],
  }));

  const [newTag, setNewTag] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [availableTags, setAvailableTags] = useState(() => {
    return defaultTags.filter(tag => !task?.tags?.includes(tag));
  });

  // Update form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        category: task.category || '',
        tags: Array.isArray(task.tags) ? [...task.tags] : [],
      });
      setAvailableTags(defaultTags.filter(tag => !task.tags?.includes(tag)));
    }
  }, [task]);

  const categories = useMemo(() => {
    const cats = [...defaultCategories];
    if (formData.category && !cats.includes(formData.category)) {
      cats.unshift(formData.category);
    }
    return cats;
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (date) => {
    setFormData(prev => ({
      ...prev,
      dueDate: date
    }));
  };

  const handleAddTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setAvailableTags(prev => prev.filter(t => t !== tag));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    if (!availableTags.includes(tagToRemove) && defaultTags.includes(tagToRemove)) {
      setAvailableTags(prev => [...prev, tagToRemove].sort());
    }
  };

  const handleCreateTag = (e) => {
    e.preventDefault();
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const availableCategories = useMemo(() => {
    const cats = [...defaultCategories];
    if (formData.category && !cats.includes(formData.category)) {
      cats.unshift(formData.category);
    }
    return cats;
  }, [formData.category]);

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
    
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      errors.dueDate = 'Due date cannot be in the past';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare data for submission
      const dataToSubmit = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
        category: formData.category?.trim() || null,
        tags: (Array.isArray(formData.tags) ? formData.tags : [])
          .map(tag => tag.trim())
          .filter(Boolean)
      };
      
      await onSubmit(dataToSubmit);
    } catch (error) {
      // Handle API validation errors
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          const field = err.path[0];
          apiErrors[field] = err.message;
        });
        setFormErrors(apiErrors);
        
        // Scroll to first error
        const firstErrorField = Object.keys(apiErrors)[0];
        if (firstErrorField) {
          document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
      throw error; // Re-throw to be handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        category: task.category || '',
        tags: Array.isArray(task.tags) ? [...task.tags] : [],
      });
      setAvailableTags(defaultTags.filter(tag => !task.tags?.includes(tag)));
    }
  }, [task]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="font-medium">Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
            className={`text-base ${formErrors.title ? 'border-red-500' : ''}`}
          />
          {formErrors.title && (
            <p className="text-sm text-red-600">{formErrors.title}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description">Description</Label>
            <span className="text-xs text-gray-500">
              {formData.description.length}/1000
            </span>
          </div>
          <div className="relative">
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={4}
              className={formErrors.description ? 'border-red-500' : ''}
            />
          </div>
          {formErrors.description && (
            <p className="text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>

        {/* Status and Priority Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Selector */}
          <div className="space-y-2">
            <Label className="font-medium">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="flex items-center gap-2"
                  >
                    <span className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Selector */}
          <div className="space-y-2">
            <Label className="font-medium">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleSelectChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="flex items-center gap-2"
                  >
                    <span className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {task?._id ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            <span>{task?._id ? 'Update Task' : 'Create Task'}</span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Due Date</Label>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!formData.dueDate ? 'text-muted-foreground' : ''} ${formErrors.dueDate ? 'border-red-500' : ''}`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a due date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formErrors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{formErrors.dueDate}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-medium">Category</Label>
          <div className="flex gap-2">
            <Select
              value={formData.category}
              onValueChange={(value) => {
                if (value === 'custom') {
                  setIsCustomCategory(true);
                  setFormData(prev => ({ ...prev, category: '' }));
                } else {
                  setIsCustomCategory(false);
                  setFormData(prev => ({ ...prev, category: value }));
                }
              }}
              disabled={isCustomCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <SelectItem value="custom">+ Custom category</SelectItem>
              </SelectContent>
            </Select>
            {isCustomCategory && (
              <Input
                type="text"
                placeholder="Enter category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="flex-1"
                autoFocus
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-medium">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="pl-2 pr-1 py-1 text-sm font-medium flex items-center gap-1"
            >
              <Tag className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="rounded-full hover:bg-muted-foreground/10 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground px-2">Suggested Tags</p>
                <div className="flex flex-wrap gap-1">
                  {availableTags.length > 0 ? (
                    availableTags.map(tag => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleAddTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-2">No more suggested tags</p>
                  )}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <form onSubmit={handleCreateTag} className="flex gap-2">
                  <Input
                    placeholder="New tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button type="submit" size="sm" className="h-8">
                    Add
                  </Button>
                </form>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.title.trim()}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : 'Save Task'}
        </Button>
      </div>
    </form>
  );
}
