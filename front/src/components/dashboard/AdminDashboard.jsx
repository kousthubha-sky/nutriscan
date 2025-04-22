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
  Package,
  BarChart,
  Layers
} from 'lucide-react';
import api from '../../services/api'; // Assuming api is imported from a separate file

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    pendingSubmissions: 0
  });
  const [submissions, setSubmissions] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3000/admin/submissions${filter ? `?status=${filter}` : ''}`, {
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
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, filter, fetchSubmissions]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/stats', {
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

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error(error.message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/admin/users', {
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
      await api.reviewSubmission(selectedSubmission._id, formData);
      await fetchSubmissions();
      setIsReviewModalOpen(false);
      setSelectedSubmission(null);
      toast.success('Review submitted successfully');
    } catch (error) {
      toast.error(error.message);
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
    { id: 'products', label: 'Products', icon: <Package className="h-5 w-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md flex-1
                ${activeTab === tab.id 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Submissions</p>
                  <p className="text-2xl font-bold">{stats.pendingSubmissions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <button
                  onClick={fetchSubmissions}
                  className="p-2 rounded-lg border border-border hover:bg-accent"
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
              <div className="text-center py-12 bg-accent/50 rounded-lg">
                <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No submissions found</h3>
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
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(submission.status)}
                          <h3 className="font-medium">{submission.productName}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="block font-medium text-foreground">Brand</span>
                            {submission.brand || 'Not specified'}
                          </div>
                          <div>
                            <span className="block font-medium text-foreground">Barcode</span>
                            {submission.barcodeNumber}
                          </div>
                          <div>
                            <span className="block font-medium text-foreground">Category</span>
                            {submission.category || 'Uncategorized'}
                          </div>
                          <div>
                            <span className="block font-medium text-foreground">Submitted</span>
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setIsReviewModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'products' && (
          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-2">
                      <div>
                        <span className="block font-medium text-foreground">Brand</span>
                        {product.brand || 'Not specified'}
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">Category</span>
                        {product.category || 'Uncategorized'}
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">Added By</span>
                        {product.addedBy?.username || 'System'}
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">Added Date</span>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="block font-medium text-foreground">Role</span>
                        {user.role}
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">Status</span>
                        {user.status}
                      </div>
                      <div>
                        <span className="block font-medium text-foreground">Joined</span>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ProductReviewForm
            submission={selectedSubmission}
            onSubmit={handleReviewSubmit}
            onClose={() => {
              setIsReviewModalOpen(false);
              setSelectedSubmission(null);
            }}
          />
        </div>
      )}
    </div>
  );
}