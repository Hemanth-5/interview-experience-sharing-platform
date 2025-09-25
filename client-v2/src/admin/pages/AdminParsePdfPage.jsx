import React, { useState } from 'react';
import axios from 'axios';
import { createApiUrl } from '../../config/api';
import CompanySearch from '../../components/CompanySearch';
import PSGNotification from '../../components/PSGNotification';
import { 
  FileText, 
  Upload, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Eye,
  Download,
  Building,
  Sparkles,
  FileCheck,
  Zap
} from 'lucide-react';

const AdminParsePdfPage = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Toast notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      showNotification('PDF file selected successfully!', 'success');
    } else {
      showNotification('Please select a valid PDF file', 'error');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const droppedFile = files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setResult(null);
        setError(null);
        showNotification('PDF file uploaded successfully!', 'success');
      } else {
        showNotification('Please upload a valid PDF file', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !company?._id) {
      showNotification('Please select a company and upload a PDF file', 'error');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('companyId', company._id);
      formData.append('companyName', company.displayName);
      
      const res = await axios.post(
        createApiUrl('/api/admin/parse-pdf'),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      
      setResult(res.data.data);
      showNotification('PDF parsed successfully! Review the extracted data below.', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error parsing PDF. Please try again.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreateExperience = () => {
    if (!result) return;
    
    try {
      const encoded = encodeURIComponent(
        window.btoa(unescape(encodeURIComponent(JSON.stringify(result))))
      );
      window.open(`/create?prefill=${encoded}`, '_blank');
      showNotification('Opening experience creation form with parsed data...', 'info');
    } catch (err) {
      showNotification('Error creating experience form', 'error');
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                PDF Parser
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Extract interview experiences from PDF documents
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {loading ? 'Processing...' : result ? 'Complete' : 'Ready'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {company?.displayName || 'Not selected'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">File</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {file ? 'Uploaded' : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <PSGNotification 
          show={notification.show} 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ show: false, message: '', type: '' })} 
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Selection */}
          <div className="bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select Company</h3>
            </div>
            
            <div className="space-y-4">
              <CompanySearch
                value={company?.displayName || ''}
                onChange={() => {}}
                onCompanySelect={(selectedCompany) => {
                  setCompany(selectedCompany);
                  if (selectedCompany) {
                    showNotification(`Company "${selectedCompany.displayName}" selected`, 'success');
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="Search and select a company..."
                required
              />
              {company && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200 font-medium">
                    {company.displayName} selected
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload PDF Document</h3>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center p-8 cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  file ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {file ? (
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {file ? file.name : 'Drop your PDF file here'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {file 
                      ? `${formatFileSize(file.size)} • ${file.type}`
                      : 'or click to browse files'
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PDF files only, max 10MB
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">{file.name}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setResult(null);
                      showNotification('File removed', 'info');
                    }}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!file || !company || loading}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                !file || !company || loading
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing PDF...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Parse PDF Document</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results Section */}
        {result && (
          <div className="mt-8 bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Parsed Results</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showPreview ? 'Hide' : 'Show'} Raw Data</span>
                </button>
              </div>
            </div>

            {showPreview && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCreateExperience}
                className="flex-1 flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Create Experience from Parsed Data</span>
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                  showNotification('Parsed data copied to clipboard!', 'success');
                }}
                className="flex items-center justify-center space-x-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Copy Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Parsing Failed
                </h4>
                <p className="text-red-700 dark:text-red-300 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminParsePdfPage;
