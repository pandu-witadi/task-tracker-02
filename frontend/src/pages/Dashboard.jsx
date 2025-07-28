import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { authAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Loader2, LogOut, ListTodo, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await authAPI.getCurrentUser();
                setUser(userData);
            } catch (error) {
                setError(error.message || 'Failed to load user data');
                console.error('Error loading user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authAPI.logout();
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Failed to log out');
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Welcome to your Dashboard</CardTitle>
                  <CardDescription>
                    {user ? `Hello, ${user.name}!` : 'User information not available'}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome, {user.name}!</CardTitle>
                    <CardDescription>You're logged in to your dashboard.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Email: {user.email}</p>
                    <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging out...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <Link to="/tasks">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">Tasks</CardTitle>
                      <ListTodo className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Manage Tasks</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        View, create, and manage your tasks
                      </p>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <Link to="/tasks/new">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg">New Task</CardTitle>
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Create Task</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Add a new task to your list
                      </p>
                    </CardContent>
                  </Link>
                </Card>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium">Account Status</h3>
                  <p className="text-sm text-gray-600 mt-1">Active</p>
                </div>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium">Member Since</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
