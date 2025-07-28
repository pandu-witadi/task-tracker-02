import { useState, useEffect, useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Search, Filter, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { cn } from '../../lib/utils';
import { FilterChip } from '../ui/filter-chip';

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TaskList({ 
  tasks = [], 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onCreateNew,
  isLoading = false 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    tags: [],
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });
  
  const [selectedRange, setSelectedRange] = useState({
    from: undefined,
    to: undefined,
  });
  
  // Extract unique categories and tags from tasks
  const { categories, allTags } = useMemo(() => {
    const cats = new Set();
    const tags = new Set();
    
    tasks.forEach(task => {
      if (task.category) cats.add(task.category);
      if (task.tags?.length) {
        task.tags.forEach(tag => tags.add(tag));
      }
    });
    
    return {
      categories: Array.from(cats).sort(),
      allTags: Array.from(tags).sort()
    };
  }, [tasks]);
  
  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }
    if (filters.category) {
      result = result.filter(task => task.category === filters.category);
    }
    if (filters.tags.length > 0) {
      result = result.filter(task => 
        task.tags && task.tags.some(tag => filters.tags.includes(tag))
      );
    }
    if (selectedRange.from || selectedRange.to) {
      result = result.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        if (selectedRange.from && dueDate < selectedRange.from) return false;
        if (selectedRange.to) {
          const toDate = new Date(selectedRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (dueDate > toDate) return false;
        }
        return true;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
          const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
          comparison = dateA - dateB;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchQuery, filters, selectedRange]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilters({
      status: '',
      priority: '',
      category: '',
      tags: [],
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
    setSelectedRange({ from: undefined, to: undefined });
  };
  
  const hasActiveFilters = 
    searchQuery || 
    filters.status || 
    filters.priority || 
    filters.category || 
    filters.tags.length > 0 ||
    selectedRange.from || 
    selectedRange.to;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value
    }));
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (column) => {
    if (filters.sortBy !== column) return null;
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            {filteredAndSortedTasks.length} {filteredAndSortedTasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {[
                    searchQuery ? 1 : 0,
                    filters.status ? 1 : 0,
                    filters.priority ? 1 : 0,
                    filters.category ? 1 : 0,
                    filters.tags.length,
                    dateRange.from || dateRange.to ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Narrow down your tasks
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any status</SelectItem>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={filters.priority} 
                    onValueChange={(value) => setFilters(f => ({ ...f, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any priority</SelectItem>
                      {priorityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select 
                      value={filters.category} 
                      onValueChange={(value) => setFilters(f => ({ ...f, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any category</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedRange && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedRange?.from ? (
                          selectedRange.to ? (
                            <>
                              {format(selectedRange.from, "LLL dd, y")} -{" "}
                              {format(selectedRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(selectedRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DayPicker
                        mode="range"
                        selected={selectedRange}
                        onSelect={setSelectedRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {allTags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Button
                          key={tag}
                          variant={filters.tags.includes(tag) ? "default" : "outline"}
                          size="sm"
                          className="h-8 px-2.5 text-xs"
                          onClick={() => {
                            setFilters(f => ({
                              ...f,
                              tags: f.tags.includes(tag)
                                ? f.tags.filter(t => t !== tag)
                                : [...f.tags, tag]
                            }));
                          }}
                        >
                          {tag}
                          {filters.tags.includes(tag) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={resetFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filters:</span>
          
          {searchQuery && (
            <div className="inline-flex items-center bg-muted rounded-full px-3 py-1">
              <span className="text-muted-foreground mr-1">Search:</span>
              <span className="font-medium">{searchQuery}</span>
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.status && (
            <FilterChip 
              label={`Status: ${statusOptions.find(s => s.value === filters.status)?.label || filters.status}`}
              onRemove={() => setFilters(f => ({ ...f, status: '' }))}
            />
          )}
          
          {filters.priority && (
            <FilterChip 
              label={`Priority: ${priorityOptions.find(p => p.value === filters.priority)?.label || filters.priority}`}
              onRemove={() => setFilters(f => ({ ...f, priority: '' }))}
            />
          )}
          
          {filters.category && (
            <FilterChip 
              label={`Category: ${filters.category}`}
              onRemove={() => setFilters(f => ({ ...f, category: '' }))}
            />
          )}
          
          {filters.tags.map(tag => (
            <FilterChip 
              key={tag}
              label={`Tag: ${tag}`}
              onRemove={() => {
                setFilters(f => ({
                  ...f,
                  tags: f.tags.filter(t => t !== tag)
                }));
              }}
            />
          ))}
          
          {selectedRange.from && selectedRange.to && (
            <FilterChip
              label={`Due: ${
                format(selectedRange.from, 'MMM d, y')
              } - ${
                format(selectedRange.to, 'MMM d, y')
              }`}
              onRemove={() => setSelectedRange({ from: undefined, to: undefined })}
            />
          )}
          
          <button 
            onClick={resetFilters}
            className="text-primary hover:underline text-sm font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Sort by:</span>
          <button
            onClick={() => {
              setFilters(f => ({
                ...f,
                sortBy: 'dueDate',
                sortOrder: f.sortBy === 'dueDate' && f.sortOrder === 'asc' ? 'desc' : 'asc'
              }));
            }}
            className={`flex items-center gap-1 ${filters.sortBy === 'dueDate' ? 'text-foreground font-medium' : ''}`}
          >
            <span>Due Date</span>
            {filters.sortBy === 'dueDate' && (
              <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          
          <button
            onClick={() => {
              setFilters(f => ({
                ...f,
                sortBy: 'priority',
                sortOrder: f.sortBy === 'priority' && f.sortOrder === 'asc' ? 'desc' : 'asc'
              }));
            }}
            className={`flex items-center gap-1 ${filters.sortBy === 'priority' ? 'text-foreground font-medium' : ''}`}
          >
            <span>Priority</span>
            {filters.sortBy === 'priority' && (
              <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
          
          <button
            onClick={() => {
              setFilters(f => ({
                ...f,
                sortBy: 'status',
                sortOrder: f.sortBy === 'status' && f.sortOrder === 'asc' ? 'desc' : 'asc'
              }));
            }}
            className={`flex items-center gap-1 ${filters.sortBy === 'status' ? 'text-foreground font-medium' : ''}`}
          >
            <span>Status</span>
            {filters.sortBy === 'status' && (
              <span>{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <TaskCard key={i} isLoading />
          ))}
        </div>
      ) : filteredAndSortedTasks.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No tasks found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {hasActiveFilters 
              ? 'Try adjusting your filters or search query.'
              : 'Get started by creating a new task.'}
          </p>
          <div className="flex justify-center gap-3">
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            )}
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={() => onEdit(task)}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
