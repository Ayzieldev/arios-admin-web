import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiTruck,
  FiTrendingUp,
  FiDollarSign,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
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
} from 'chart.js';
import '../style/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('🔍 Fetching dashboard stats...');
      console.log('🔗 API URL:', process.env.REACT_APP_API_URL);
      console.log('🔑 Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('👤 User:', JSON.parse(localStorage.getItem('user') || 'null'));
      
      const response = await api.get('/admin/dashboard');
      console.log('📊 Dashboard data received:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Show error in UI
      if (error.response?.status === 401) {
        console.error('🔐 Authentication failed - please log in as admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: FiPackage,
      color: 'blue',
      link: '/products'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FiShoppingCart,
      color: 'blue',
      link: '/orders'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'purple',
      link: '/users'
    },
  ];

  const quickStats = [
    {
      title: 'Today\'s Orders',
      value: stats?.todayOrders || 0,
      icon: FiClock,
      color: 'blue'
    },
    {
      title: 'This Month',
      value: stats?.monthOrders || 0,
      icon: FiTrendingUp,
      color: 'blue'
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: FiCheckCircle,
      color: 'orange'
    },
    {
      title: 'Total Revenue',
      value: `₱ ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'purple'
    }
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Orders',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Revenue',
        data: [1200, 1900, 300, 500, 200, 300],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Analytics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} to={card.link} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `var(--${card.color}-light)` }}>
                <Icon style={{ color: `var(--${card.color})` }} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{card.value.toLocaleString()}</h3>
                <p className="stat-title">{card.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <h2>Quick Overview</h2>
        <div className="quick-stats-grid">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="quick-stat-card">
                <div className="quick-stat-icon" style={{ backgroundColor: `var(--${stat.color}-light)` }}>
                  <Icon style={{ color: `var(--${stat.color})` }} />
                </div>
                <div className="quick-stat-content">
                  <h4 className="quick-stat-value">{stat.value}</h4>
                  <p className="quick-stat-title">{stat.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Monthly Analytics</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {stats?.recentOrders?.map((order, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon success">
                <FiCheckCircle />
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  New order #{order._id.toString().slice(-6)} received from {order.deliveryAddress?.fullName || 'Customer'}
                </p>
                <span className="activity-time">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {stats?.recentDeliveryRequests?.map((order, index) => (
            order.deliveryRequests?.map((request, reqIndex) => (
              <div key={`${index}-${reqIndex}`} className="activity-item">
                <div className="activity-icon warning">
                  <FiTruck />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    Delivery request for order #{order._id.toString().slice(-6)} from {request.deliveryBoyId?.name || 'Delivery Person'}
                  </p>
                  <span className="activity-time">
                    {new Date(request.requestedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ))}
          {(!stats?.recentOrders || stats.recentOrders.length === 0) && 
           (!stats?.recentDeliveryRequests || stats.recentDeliveryRequests.length === 0) && (
            <div className="activity-item">
              <div className="activity-icon info">
                <FiClock />
              </div>
              <div className="activity-content">
                <p className="activity-text">No recent activity</p>
                <span className="activity-time">Check back later</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 