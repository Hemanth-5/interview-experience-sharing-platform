import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Flag,
  Calendar,
  Search,
  Trash2,
  FileText,
  AlertCircle,
  Clock,
  TrendingUp,
  Shield,
  Building,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { createApiUrl } from '../../config/api';
import CompanyLogo from '../../components/CompanyLogo';

const AdminReports = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, reviewed, dismissed, resolved
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    dismissed: 0,
    resolved: 0,
    flagged: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchReportedExperiences();
    fetchStats();
  }, [currentPage, filterStatus, searchQuery]);

  const fetchReportedExperiences = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        hasReports: 'true'
      });

      if (filterStatus !== 'all') {
        params.append('reportStatus', filterStatus);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(createApiUrl(`/api/admin/experiences/reported?${params}`), {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reported experiences');
      }

      const data = await response.json();
      setExperiences(data.experiences || []);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      setError(null);
    } catch (err) {
      setError('Failed to load reported experiences');
      console.error('Error fetching reported experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(createApiUrl('/api/admin/experiences/report-stats'), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (err) {
      console.error('Error fetching report stats:', err);
    }
  };

  const handleViewReport = (experience, report) => {
    setSelectedExperience(experience);
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleUpdateReportStatus = async (experienceId, reportId, newStatus, action = null) => {
    try {
      setActionLoading(true);

      const response = await fetch(
        createApiUrl(`/api/admin/experiences/${experienceId}/reports/${reportId}`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus, action })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update report status');
      }

      // Refresh data
      await fetchReportedExperiences();
      await fetchStats();
      
      setIsModalOpen(false);
      setSelectedExperience(null);
      setSelectedReport(null);
    } catch (err) {
      console.error('Error updating report:', err);
      alert('Failed to update report status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveContent = async (experienceId) => {
    if (!confirm('Are you sure you want to unpublish this experience?')) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        createApiUrl(`/api/admin/experiences/${experienceId}/unpublish`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ 
            reason: 'Removed due to report violations',
            flagReason: 'multiple_reports'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to unpublish experience');
      }

      // Refresh data
      await fetchReportedExperiences();
      await fetchStats();
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error unpublishing experience:', err);
      alert('Failed to unpublish experience');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Clock },
      reviewed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: Eye },
      resolved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: CheckCircle },
      dismissed: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const getReasonBadge = (reason) => {
    const reasonLabels = {
      inappropriate_content: 'Inappropriate',
      fake_information: 'Fake Info',
      spam: 'Spam',
      offensive_language: 'Offensive',
      copyright_violation: 'Copyright',
      personal_attacks: 'Personal Attack',
      off_topic: 'Off Topic',
      duplicate_content: 'Duplicate',
      other: 'Other'
    };

    const severityMap = {
      spam: 'low',
      off_topic: 'low',
      duplicate_content: 'low',
      fake_information: 'medium',
      copyright_violation: 'medium',
      inappropriate_content: 'high',
      offensive_language: 'high',
      personal_attacks: 'critical'
    };

    const severity = severityMap[reason] || 'low';
    const severityConfig = {
      low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
      medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
      high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
      critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' }
    };

    const config = severityConfig[severity];

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <AlertTriangle className="w-3 h-3" />
        <span>{reasonLabels[reason] || reason}</span>
      </span>
    );
  };

  if (loading && experiences.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading reported experiences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Content Reports</h1>
          <p className="text-muted-foreground">Review and manage reported interview experiences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
            <Flag className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{stats.total}</h3>
          <p className="text-xs text-muted-foreground">Total Reports</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{stats.pending}</h3>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{stats.reviewed}</h3>
          <p className="text-xs text-muted-foreground">Reviewed</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{stats.resolved}</h3>
          <p className="text-xs text-muted-foreground">Resolved</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center mb-3">
            <XCircle className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{stats.dismissed}</h3>
          <p className="text-xs text-muted-foreground">Dismissed</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-1">{stats.flagged}</h3>
          <p className="text-xs text-muted-foreground">Flagged</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by company, role, or reporter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-8 text-center">
            <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reported experiences found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Flagged
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {experiences.map((experience) => (
                  <tr key={experience._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <CompanyLogo 
                          companyName={experience.companyInfo?.companyName}
                          companyLogo={experience.companyInfo?.companyLogo}
                          size={40}
                          className="flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {experience.companyInfo?.companyName || 'Unknown Company'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {experience.companyInfo?.role || 'Unknown Role'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {experience.companyInfo?.internshipType}
                            </span>
                            {experience.companyInfo?.location && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {experience.companyInfo.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {experience.reports?.length || 0} Report{experience.reports?.length !== 1 ? 's' : ''}
                        </p>
                        {experience.reports && experience.reports.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {experience.reports.slice(0, 2).map((report, idx) => (
                              <span key={idx}>
                                {getReasonBadge(report.reason)}
                              </span>
                            ))}
                            {experience.reports.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{experience.reports.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {experience.reports && experience.reports.map((report, idx) => (
                          <div key={idx}>
                            {getStatusBadge(report.status)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {experience.flagged ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          <Flag className="w-3 h-3" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end flex-wrap gap-2">
                        {experience.reports && experience.reports.map((report, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleViewReport(experience, report)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Review #{idx + 1}</span>
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-1 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-1 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {isModalOpen && selectedExperience && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Report Details</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Experience Info */}
              <div className="bg-secondary/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Reported Experience</h3>
                <div className="flex items-start space-x-4">
                  <CompanyLogo 
                    companyName={selectedExperience.companyInfo?.companyName}
                    companyLogo={selectedExperience.companyInfo?.companyLogo}
                    size={60}
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground">
                      {selectedExperience.companyInfo?.companyName} - {selectedExperience.companyInfo?.role}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                        {selectedExperience.companyInfo?.internshipType}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        {selectedExperience.companyInfo?.location}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                        {selectedExperience.finalResult}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Report Reason</p>
                  {getReasonBadge(selectedReport.reason)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reported By</p>
                  <p className="text-sm text-foreground">
                    {selectedReport.reportedBy?.name || 'Anonymous'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reported On</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedReport.reportedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Report Details */}
              {selectedReport.reasonDetails && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Additional Details</h3>
                  <p className="text-sm text-muted-foreground bg-secondary/20 rounded-lg p-4">
                    {selectedReport.reasonDetails}
                  </p>
                </div>
              )}

              {/* Content Preview */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Content Preview</h3>
                <div className="bg-secondary/20 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-sm text-foreground line-clamp-6">
                    {selectedExperience.keyTips || selectedExperience.overallExperience || 'No content available'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {selectedReport.status === 'pending' && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleUpdateReportStatus(selectedExperience._id, selectedReport._id, 'reviewed')}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Mark as Reviewed</span>
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(selectedExperience._id, selectedReport._id, 'resolved')}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Resolve</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRemoveContent(selectedExperience._id)}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Unpublish Experience</span>
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(selectedExperience._id, selectedReport._id, 'dismissed')}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
