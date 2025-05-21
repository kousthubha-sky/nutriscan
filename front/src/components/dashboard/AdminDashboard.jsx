import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ProductReviewForm } from './ProductReviewForm';
import { 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Users,
  BarChart,
  Layers,
  Check,
  Home 
} from 'lucide-react';
import api from '../../services/api';
import { FloatingFoodIcons } from '../ui/floating-food-icons';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    pendingSubmissions: 0
  });
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/submissions${filter ? `?status=${filter}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      toast.error(error.message);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'submissions') {
      fetchSubmissions();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, filter, fetchSubmissions]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error(error.message);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalProducts: 0,
        pendingSubmissions: 0
      });
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error(error.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (formData) => {
    try {
      setIsLoading(true);
      const response = await api.reviewSubmission(selectedSubmission._id, formData);
      
      // Check if the response has an error message
      if (!response.success && response.message) {
        throw new Error(response.message);
      }
      
      await fetchSubmissions();
      setIsReviewModalOpen(false);
      setSelectedSubmission(null);
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error.message || 'Failed to submit review. Please ensure all required fields are filled.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickApprove = async (submission) => {
    try {
      // Use the existing submission data but set status to approved
      const approvalData = {
        ...submission,
        status: 'approved',
        adminNotes: 'Quick approved by admin'
      };
      
      const response = await api.reviewSubmission(submission._id, approvalData);
      if (response.success) {
        await fetchSubmissions();
        toast.success('Product approved successfully');
      } else {
        throw new Error(response.message || 'Failed to approve product');
      }
    } catch (error) {
      console.error('Quick approval error:', error);
      toast.error(error.message || 'Failed to approve product. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_review':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredSubmissions = submissions.filter(submission => 
    submission.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.barcodeNumber.includes(searchQuery)
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart className="h-5 w-5" /> },
    { id: 'submissions', label: 'Submissions', icon: <Layers className="h-5 w-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background to-accent/5">
      <FloatingFoodIcons />
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage your products, users, and submissions</p>
            </div>
            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="flex p-1.5 bg-card rounded-xl  shadow-sm gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all w-full min-h-[42px]
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-lg font-medium scale-[1.02]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="group p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="group p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <BarChart className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="group p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:border-yellow-500/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Submissions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingSubmissions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <button
                  onClick={fetchSubmissions}
                  className="p-3 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
                <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No submissions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'There are no submissions matching the selected filter'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="group p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            {getStatusIcon(submission.status)}
                          </div>
                          <h3 className="text-lg font-medium text-foreground">{submission.productName}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div>
                            <span className="block font-medium text-muted-foreground mb-1">Brand</span>
                            <span className="text-foreground">{submission.brand || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="block font-medium text-muted-foreground mb-1">Barcode</span>
                            <span className="text-foreground">{submission.barcodeNumber}</span>
                          </div>
                          <div>
                            <span className="block font-medium text-muted-foreground mb-1">Category</span>
                            <span className="text-foreground">{submission.category || 'Uncategorized'}</span>
                          </div>
                          <div>
                            <span className="block font-medium text-muted-foreground mb-1">Submitted</span>
                            <span className="text-foreground">{new Date(submission.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {submission.status === 'pending' && (
                          <button
                            onClick={() => handleQuickApprove(submission)}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setIsReviewModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 transition-colors"
                        >
                          <Layers className="w-4 h-4" />
                          Review Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border border-border">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No users found</h3>
                <p className="text-muted-foreground">There are no users available</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="group p-6 rounded-xl bg-background border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium text-foreground">{user.name}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div>
                            <span className="block font-medium text-muted-foreground mb-1">Email</span>
                            <span className="text-foreground">{user.email}</span>
                          </div>
                          <div>
                            <span className="block font-medium text-muted-foreground mb-1">Role</span>
                            <span className="text-foreground">{user.role}</span>
                          </div>
                          <div>
                            <span className="block font-medium text-muted-foreground mb-1">Joined</span>
                            <span className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isReviewModalOpen && selectedSubmission && (
        <ProductReviewForm
          submission={selectedSubmission}
          onSubmit={handleReviewSubmit}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  );
}