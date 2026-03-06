import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Shield,
  Activity,
  AlertTriangle,
  UserX,
  Globe,
  Clock,
  Hash,
  RefreshCw,
  Search,
  XCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://localhost:5000/api';

const App = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    blockedIPs: 0,
    suspiciousIPs: 0,
    recentTraffic: []
  });
  const [blockedList, setBlockedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, blockedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics`),
        axios.get(`${API_BASE_URL}/blocked`)
      ]);
      setStats(statsRes.data);
      setBlockedList(blockedRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleUnblock = async (ip) => {
    try {
      await axios.delete(`${API_BASE_URL}/unblock/${ip}`);
      fetchData();
    } catch (error) {
      alert('Error unblocking IP');
    }
  };

  const dashboardStats = [
    { label: 'Total Requests', value: stats.totalRequests, icon: <Activity className="text-blue-500" />, color: 'blue' },
    { label: 'Suspicious IPs', value: stats.suspiciousIPs, icon: <AlertTriangle className="text-yellow-500" />, color: 'yellow' },
    { label: 'Blocked IPs', value: stats.blockedIPs, icon: <UserX className="text-red-500" />, color: 'red' },
    { label: 'Active Shield', value: 'Enabled', icon: <Shield className="text-green-500" />, color: 'green' },
  ];

  const filteredTraffic = stats.recentTraffic.filter(log =>
    log.ip.includes(searchTerm) || log.endpoint.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6 font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
            <Shield size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API Sentinel</h1>
            <p className="text-zinc-500 text-sm">Intelligent Traffic Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">System Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex gap-2 border-b border-zinc-800 pb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Overview
            {activeTab === 'overview' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
          <button
            onClick={() => setActiveTab('traffic')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${activeTab === 'traffic' ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Traffic Logs
            {activeTab === 'traffic' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`pb-4 px-4 text-sm font-medium transition-colors relative ${activeTab === 'blocked' ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Blocked IPs
            {activeTab === 'blocked' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((s, i) => (
                  <div key={i} className="stats-card">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-zinc-900 rounded-lg">{s.icon}</div>
                      <span className="text-xs text-zinc-500 font-mono">LIVE</span>
                    </div>
                    <div>
                      <h3 className="text-zinc-400 text-sm font-medium">{s.label}</h3>
                      <p className="text-3xl font-bold mt-1 tracking-tight">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6 h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-lg">Traffic Distribution</h3>
                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                      <Clock size={12} /> Last 24 Hours
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={stats.recentTraffic.slice(0, 10).reverse()}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis stroke="#4b5563" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Area type="monotone" dataKey="responseTime" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Security Insights</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                        <CheckCircle size={18} className="text-green-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">All systems normal</p>
                          <p className="text-xs text-zinc-500">Latency is within healthy bounds</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                        <XCircle size={18} className="text-red-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{stats.blockedIPs} IPs currently blocked</p>
                          <p className="text-xs text-zinc-500">Auto-blocking is actively engaged</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('blocked')} className="w-full btn-secondary mt-6 flex items-center justify-center gap-2 text-sm">
                    Manage Security Policies <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'traffic' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold">Real-time Traffic Logs</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search IP or endpoint..."
                    className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-900/50 border-b border-zinc-800">
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Method & Endpoint</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Latency</th>
                        <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {filteredTraffic.map((log, i) => (
                        <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.method === 'POST' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                }`}>
                                {log.method}
                              </span>
                              <span className="text-sm font-medium font-mono truncate max-w-[200px]">{log.endpoint}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-zinc-400 font-mono">{log.ip}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${log.statusCode < 400 ? 'bg-green-500/10 text-green-400 ring-green-500/20' : 'bg-red-500/10 text-red-400 ring-red-500/20'
                              }`}>
                              {log.statusCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                            {log.responseTime}ms
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'blocked' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Blocked IP Repository</h3>
                <span className="text-sm text-zinc-500">{blockedList.length} Active Blocks</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blockedList.map((entry, i) => (
                  <div key={i} className="glass-card p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-900/20 rounded-lg">
                          <UserX className="text-red-500" size={20} />
                        </div>
                        <div>
                          <p className="font-mono text-sm">{entry.ip}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Blocked Address</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-yellow-600" />
                        <span className="italic">{entry.reason}</span>
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-2">
                        <Clock size={14} />
                        Blocked on {new Date(entry.blockedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnblock(entry.ip)}
                      className="w-full btn-danger py-2 text-xs font-semibold"
                    >
                      Unblock Access
                    </button>
                  </div>
                ))}
                {blockedList.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                    <Shield size={48} className="opacity-20" />
                    <p>No IP addresses currently blocked</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
