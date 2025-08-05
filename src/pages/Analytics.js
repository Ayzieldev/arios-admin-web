import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiShoppingCart, 
  FiUsers,
  FiPackage,
  FiCalendar,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiClock
} from 'react-icons/fi';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import '../style/Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
    fetchRealtimeData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchRealtimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching analytics data...');
      console.log('🔗 API URL:', process.env.REACT_APP_API_URL);
      
      const response = await api.get(`/admin/analytics?period=${period}`);
      console.log('📊 Analytics data received:', response.data);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeData = async () => {
    try {
      const response = await api.get('/admin/analytics/realtime');
      setRealtimeData(response.data);
    } catch (error) {
      console.error('Error fetching realtime data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      out_for_delivery: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Prepare chart data
  const salesChartData = {
    labels: analyticsData?.salesData?.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[item._id.month - 1];
      return `${monthName} ${item._id.day}`;
    }) || [],
    datasets: [
      {
        label: 'Sales',
        data: analyticsData?.salesData?.map(item => item.totalSales) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: analyticsData?.salesData?.map(item => item.orderCount) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const monthlyComparisonData = {
    labels: analyticsData?.monthlyComparison?.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[item._id.month - 1];
      return `${monthName} ${item._id.year}`;
    }) || [],
    datasets: [
      {
        label: 'Monthly Sales',
        data: analyticsData?.monthlyComparison?.map(item => item.totalSales) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ],
  };

  const deliveryStatusData = {
    labels: analyticsData?.deliveryStats?.map(item => item._id) || [],
    datasets: [
      {
        data: analyticsData?.deliveryStats?.map(item => item.count) || [],
        backgroundColor: analyticsData?.deliveryStats?.map(item => getStatusColor(item._id)) || [],
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    ],
  };

  const topProductsData = {
    labels: analyticsData?.topProducts?.map(item => item.productName) || [],
    datasets: [
      {
        label: 'Quantity Sold',
        data: analyticsData?.topProducts?.map(item => item.totalQuantity) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₱' + value.toLocaleString();
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="analytics-controls">
          <div className="period-selector">
            <button 
              className={`period-btn ${period === 'monthly' ? 'active' : ''}`}
              onClick={() => setPeriod('monthly')}
            >
              <FiCalendar /> Monthly
            </button>
            <button 
              className={`period-btn ${period === 'yearly' ? 'active' : ''}`}
              onClick={() => setPeriod('yearly')}
            >
              <FiCalendar /> Yearly
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon revenue">
            <span>&#8369;</span>
          </div>
          <div className="summary-content">
            <h3>{formatCurrency(analyticsData?.summaryStats?.totalRevenue || 0)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon orders">
            <FiShoppingCart />
          </div>
          <div className="summary-content">
            <h3>{analyticsData?.summaryStats?.totalOrders || 0}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon average">
            <FiTrendingUp />
          </div>
          <div className="summary-content">
            <h3>{formatCurrency(analyticsData?.summaryStats?.averageOrderValue || 0)}</h3>
            <p>Average Order Value</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon customers">
            <FiUsers />
          </div>
          <div className="summary-content">
            <h3>{analyticsData?.customerStats?.length || 0}</h3>
            <p>Active Customers</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart /> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <FiPackage /> Top Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <FiUsers /> Top Customers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'realtime' ? 'active' : ''}`}
          onClick={() => setActiveTab('realtime')}
        >
          <FiActivity /> Real-time
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="analytics-content">
          <div className="chart-grid">
            
            <div className="chart-card">
              <h3>Monthly Comparison</h3>
              <Bar data={monthlyComparisonData} options={chartOptions} />
            </div>
            
            <div className="chart-card">
              <h3>Order Status Distribution</h3>
              <Doughnut data={deliveryStatusData} options={pieChartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="analytics-content">
                      <div className="chart-card">
              <h3>Top 5 Best Selling Products</h3>
              <Bar data={topProductsData} options={barChartOptions} />
            </div>
          
          <div className="products-list">
            <h3>Product Details</h3>
            <div className="products-grid">
              {analyticsData?.topProducts?.map((product, index) => (
                <div key={product._id} className="product-card">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-image">
                    <img 
                      src={product.productImage?.[0] || '/placeholder-product.jpg'} 
                      alt={product.productName}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h4>{product.productName}</h4>
                    <p>Quantity Sold: {product.totalQuantity}</p>
                    <p>Revenue: {formatCurrency(product.totalRevenue)}</p>
                    <p>Orders: {product.orderCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="analytics-content">
          <div className="customers-list">
            <h3>Top Customers</h3>
            <div className="customers-grid">
              {analyticsData?.customerStats?.map((customer, index) => (
                <div key={customer._id} className="customer-card">
                  <div className="customer-rank">#{index + 1}</div>
                  <div className="customer-info">
                    <h4>{customer.userInfo?.name || 'Unknown Customer'}</h4>
                    <p>Email: {customer.userInfo?.email || 'N/A'}</p>
                    <p>Total Spent: {formatCurrency(customer.totalSpent)}</p>
                    <p>Orders: {customer.orderCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Tab */}
      {activeTab === 'realtime' && (
        <div className="analytics-content">
          <div className="realtime-grid">
            <div className="realtime-card">
              <h3>Last 24 Hours Activity</h3>
              <div className="realtime-stats">
                {realtimeData?.realtimeStats?.map((stat) => (
                  <div key={stat._id} className="realtime-stat">
                    <div className="stat-label" style={{ color: getStatusColor(stat._id) }}>
                      {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}
                    </div>
                    <div className="stat-value">
                      <span className="stat-count">{stat.count}</span>
                      <span className="stat-revenue">{formatCurrency(stat.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="realtime-card">
              <h3>Live Activity</h3>
              <div className="live-indicator">
                <div className="pulse-dot"></div>
                <span>Live updates every 30 seconds</span>
              </div>
              <div className="last-updated">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 