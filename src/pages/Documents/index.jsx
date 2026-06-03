import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Share2, 
  Search, 
  Plus, 
  Lock,
  Shield,
  Copy,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Folder,
  ChevronRight,
  Grid,
  List,
  Eye,
  Edit3,
  FolderInput,
  ArrowLeft,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const Documents = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';

  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Navigation & View states
  const [currentFolder, setCurrentFolder] = useState(''); // e.g. '', '/Projects', '/Financials'
  const [isGridView, setIsGridView] = useState(true);

  // File Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Rename states
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameDoc, setRenameDoc] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [renameError, setRenameError] = useState('');

  // Move states
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveDoc, setMoveDoc] = useState(null);
  const [moveToFolder, setMoveToFolder] = useState('');
  const [moveError, setMoveError] = useState('');

  // Create Folder states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState('');

  // Preview states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [zipEntries, setZipEntries] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Sharing Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('viewer');
  const [expiresHours, setExpiresHours] = useState('24');
  const [shareSuccessMsg, setShareSuccessMsg] = useState('');
  const [shareErrorMsg, setShareErrorMsg] = useState('');
  
  // Link sharing state
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Advanced sharing states
  const [allowedIp, setAllowedIp] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [sharePassword, setSharePassword] = useState('');
  const [activeShares, setActiveShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [shareTab, setShareTab] = useState('direct'); // 'direct' or 'public'

  // Password Prompt Modal states for accessing secure shares
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [promptPassword, setPromptPassword] = useState('');
  const [promptError, setPromptError] = useState('');
  const promptResolveRef = useRef(null);
  const promptRejectRef = useRef(null);

  // Fetch Documents list
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Fetch documents for the current folder path
      const [res, allRes] = await Promise.all([
        api.get('/documents', {
          params: {
            folder: currentFolder,
            search: searchQuery
          }
        }),
        api.get('/documents', {
          params: {
            all: 'true',
            search: searchQuery
          }
        })
      ]);
      setDocuments(res.data.documents || []);
      setAllDocuments(allRes.data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentFolder, searchQuery]);

  // Handle Drag & Drop events
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
    
    if (isViewer) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadTitle(file.name.split('.').slice(0, -1).join('.')); // Pre-fill title without extension
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadTitle(file.name.split('.').slice(0, -1).join('.'));
    }
  };

  // Mocked progress upload to look premium
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to secure.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadTitle);
    formData.append('folder_path', currentFolder);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 150);

    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadProgress(100);
      setTimeout(() => {
        setSelectedFile(null);
        setUploadTitle('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocuments();
        setUploading(false);
        setUploadProgress(0);
      }, 300);

    } catch (err) {
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
      setUploadError(err.response?.data?.error || 'Failed to secure and upload document.');
    }
  };

  // Helper to extract JSON from blob error
  const getBlobError = async (err) => {
    if (err.response && err.response.data && err.response.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        return JSON.parse(text);
      } catch (e) {
        return null;
      }
    }
    return err.response?.data || null;
  };

  // Request password entry from user
  const requestPassword = () => {
    return new Promise((resolve, reject) => {
      setPromptPassword('');
      setPromptError('');
      setIsPasswordPromptOpen(true);
      promptResolveRef.current = resolve;
      promptRejectRef.current = reject;
    });
  };

  const handlePasswordPromptSubmit = (e) => {
    e.preventDefault();
    if (!promptPassword) return;
    setIsPasswordPromptOpen(false);
    if (promptResolveRef.current) {
      promptResolveRef.current(promptPassword);
    }
  };

  // Centralized stream fetch with auto-decryption password prompt
  const fetchFileStream = async (docId, isPreview = false, shareToken = null, initialPassword = null) => {
    let currentPassword = initialPassword;
    while (true) {
      try {
        const headers = {};
        if (currentPassword) {
          headers['x-share-password'] = currentPassword;
        }

        const params = {};
        if (isPreview) {
          params['preview'] = 'true';
        }
        if (shareToken) {
          params['share_token'] = shareToken;
        }

        const response = await api.get(`/documents/${docId}/download`, {
          params,
          headers,
          responseType: 'blob'
        });
        return response;
      } catch (err) {
        const errData = await getBlobError(err);
        if (errData && errData.password_required) {
          try {
            if (currentPassword) {
              setPromptError('Incorrect password. Please try again.');
            }
            currentPassword = await requestPassword();
          } catch (cancelErr) {
            throw new Error('Access Denied: Password required.');
          }
        } else {
          const errMsg = errData?.error || 'Zero-Trust Policy Block: You do not have clearance to access this asset.';
          throw new Error(errMsg);
        }
      }
    }
  };

  // Stream Decrypt & Download
  const handleDownload = async (docId, fileName, shareToken = null) => {
    try {
      const response = await fetchFileStream(docId, false, shareToken);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Secure Decryption Failed. Check console or audit logs for access violation logs.');
      console.error('Download error:', err.message);
    }
  };

  // Stream Decrypt & Preview File
  const handlePreview = async (doc, shareToken = null) => {
    setPreviewDoc(doc);
    setIsPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewUrl('');
    setPreviewText('');
    setPreviewHtml('');
    setZipEntries([]);

    try {
      const isDocx = doc.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || doc.original_name?.toLowerCase().endsWith('.docx');
      const isZip = doc.mime_type === 'application/zip' || doc.mime_type === 'application/x-zip-compressed' || doc.original_name?.toLowerCase().endsWith('.zip');
      const isXip = doc.original_name?.toLowerCase().endsWith('.xip');

      if (isDocx || isZip || isXip) {
        const response = await api.get(`/documents/${doc.id}/preview-data`, {
          params: shareToken ? { share_token: shareToken } : {}
        });
        if (response.data.type === 'docx') {
          setPreviewHtml(response.data.html || '');
        }
        if (response.data.type === 'zip') {
          setZipEntries(response.data.entries || []);
        }
        if (response.data.type === 'archive') {
          setPreviewText(response.data.message || 'Archive preview is not available.');
        }
        return;
      }

      const response = await fetchFileStream(doc.id, true, shareToken);

      const blob = new Blob([response.data], { type: doc.mime_type });
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);

      if (doc.mime_type.startsWith('text/') || doc.mime_type === 'application/json') {
        const text = await blob.text();
        setPreviewText(text);
      }
    } catch (err) {
      setIsPreviewModalOpen(false);
      alert(err.message || 'Preview authorization failed.');
      console.error('Preview error:', err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Advanced Security: ContextMenu, Copy/Cut/Paste, Print, and Screenshot triggers during secure preview
  useEffect(() => {
    if (!isPreviewModalOpen) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleCopyCutPaste = (e) => {
      e.preventDefault();
      alert('SECURITY PROTOCOL: Copying, cutting, or pasting from secure vault previews is strictly prohibited.');
    };

    const handleKeyDown = (e) => {
      // Intercept Print hotkeys (Ctrl+P, Cmd+P)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        alert('SECURITY PROTOCOL: Printing of secure vault preview streams is deactivated under continuous Zero-Trust policies.');
      }
      // Warn on standard printscreen buttons
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('SECURITY NOTICE: Screenshot captures are monitored and subject to strict compliance audit logging.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.warn('Continuous verification notice: Page focus shifted (potential screenshot utility active).');
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopyCutPaste);
    window.addEventListener('cut', handleCopyCutPaste);
    window.addEventListener('paste', handleCopyCutPaste);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopyCutPaste);
      window.removeEventListener('cut', handleCopyCutPaste);
      window.removeEventListener('paste', handleCopyCutPaste);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPreviewModalOpen]);

  // Handle Document Rename
  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameTitle.trim()) return;

    setRenameError('');
    try {
      await api.put(`/documents/${renameDoc.id}/rename`, { title: renameTitle });
      setIsRenameModalOpen(false);
      fetchDocuments();
    } catch (err) {
      setRenameError(err.response?.data?.error || 'Failed to rename file.');
    }
  };

  // Handle Document Move
  const handleMoveSubmit = async (e) => {
    e.preventDefault();
    setMoveError('');
    try {
      await api.put(`/documents/${moveDoc.id}/move`, { folder_path: moveToFolder });
      setIsMoveModalOpen(false);
      fetchDocuments();
    } catch (err) {
      setMoveError(err.response?.data?.error || 'Failed to move file.');
    }
  };

  // Handle Folder Creation
  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    // Simulated Folder Concept (folders are represented dynamically by files with matching folder_paths)
    // To make a folder "exist" in the view even when empty, we can track folders locally or in state!
    const synthesizedPath = currentFolder ? `${currentFolder}/${newFolderName}` : `/${newFolderName}`;
    
    // Switch into the new folder immediately (creates Notion-like seamless UX)
    setCurrentFolder(synthesizedPath);
    setNewFolderName('');
    setIsFolderModalOpen(false);
  };

  // Handle Document Deletion
  const handleDelete = async (docId) => {
    if (!window.confirm('WARNING: Deleting this file will physically purge its encrypted archive from the server permanently. Proceed?')) {
      return;
    }

    try {
      await api.delete(`/documents/${docId}`);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete file.');
    }
  };

  // Sharing Modal
  const openShareModal = (doc) => {
    setActiveDoc(doc);
    setShareEmail('');
    setSharePermission('viewer');
    setGeneratedLink('');
    setShareSuccessMsg('');
    setShareErrorMsg('');
    setAllowedIp('');
    setMaxViews('');
    setSharePassword('');
    setShareTab('direct');
    setIsShareModalOpen(true);
    fetchActiveShares(doc.id);
  };

  const fetchActiveShares = async (docId) => {
    if (!docId) return;
    try {
      setLoadingShares(true);
      const res = await api.get(`/sharing/${docId}`);
      setActiveShares(res.data.shares || []);
    } catch (err) {
      console.error('Failed to load active shares', err.message);
    } finally {
      setLoadingShares(false);
    }
  };

  const handleRevokeShare = async (shareId) => {
    if (!window.confirm('WARNING: Revoking this access will immediately invalidate all associated tokens or user permissions. Proceed?')) {
      return;
    }

    setShareSuccessMsg('');
    setShareErrorMsg('');

    try {
      await api.delete(`/sharing/${shareId}`);
      setShareSuccessMsg('Access privilege successfully revoked.');
      if (activeDoc) {
        fetchActiveShares(activeDoc.id);
      }
    } catch (err) {
      setShareErrorMsg(err.response?.data?.error || 'Failed to revoke sharing access.');
    }
  };

  const handleDirectShare = async (e) => {
    e.preventDefault();
    if (!shareEmail) return;

    setShareSuccessMsg('');
    setShareErrorMsg('');

    try {
      await api.post('/sharing', {
        documentId: activeDoc.id,
        targetEmail: shareEmail,
        permission: sharePermission,
        expiresHours: expiresHours || null
      });
      setShareSuccessMsg(`Document successfully shared with ${shareEmail}.`);
      setShareEmail('');
      fetchActiveShares(activeDoc.id);
    } catch (err) {
      setShareErrorMsg(err.response?.data?.error || 'Failed to share document.');
    }
  };

  const handleGenerateShareLink = async () => {
    setShareSuccessMsg('');
    setShareErrorMsg('');

    try {
      const res = await api.post('/sharing', {
        documentId: activeDoc.id,
        generateLink: true,
        permission: sharePermission,
        expiresHours: expiresHours || null,
        allowedIp: allowedIp || null,
        maxViews: maxViews || null,
        password: sharePassword || null
      });
      
      const shareToken = res.data.shareToken;
      const directUrl = `${window.location.origin}/api/documents/${activeDoc.id}/download?share_token=${shareToken}`;
      setGeneratedLink(directUrl);
      fetchActiveShares(activeDoc.id);
    } catch (err) {
      setShareErrorMsg(err.response?.data?.error || 'Failed to generate token sharing link.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Folder Navigation helpers
  const navigateUp = () => {
    if (!currentFolder) return;
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
  };

  // Get unique subfolders in the current directory level
  const getSubfolders = () => {
    // In our dynamic folder model, folders are derived from document folder_paths
    // If a document has folder_path = '/Projects/Marketing' and currentFolder = '/Projects', 'Marketing' is a subfolder!
    const subfolders = new Set();
    allDocuments.forEach(doc => {
      const path = doc.folder_path || '';
      if (path.startsWith(currentFolder) && path !== currentFolder) {
        const relative = path.slice(currentFolder.length);
        const nextSegment = relative.split('/')[1]; // Get first sub-segment
        if (nextSegment) {
          subfolders.add(nextSegment);
        }
      }
    });
    // Add any locally navigated empty folders if any
    return Array.from(subfolders);
  };

  const subfolders = getSubfolders();

  // Format File Size
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-8 transition-colors duration-300">
      {/* Visual background glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/[0.01] rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white uppercase leading-none">
            Secure <span className="text-blue-500 font-extrabold">Vault</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            AES-256-GCM hardware-accelerated cryptosecurity storage. Stream decrypting on-the-fly.
          </p>
        </div>

        {/* View & Folder Controls */}
        <div className="flex items-center gap-2">
          {/* Create Folder Button */}
          {!isViewer && (
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setIsFolderModalOpen(true)}
            >
              <Plus size={14} />
              <span>New Folder</span>
            </Button>
          )}

          {/* Toggle View Layout */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 flex bg-slate-200/50 dark:bg-slate-950/40">
            <button
              onClick={() => setIsGridView(true)}
              className={`p-1.5 rounded-md transition-all ${isGridView ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setIsGridView(false)}
              className={`p-1.5 rounded-md transition-all ${!isGridView ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Folder Breadcrumbs */}
      <div className="flex items-center gap-2 bg-slate-200/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 z-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <button 
          onClick={() => setCurrentFolder('')}
          className="hover:text-blue-500 transition-colors uppercase tracking-wider"
        >
          Vault Root
        </button>

        {currentFolder.split('/').filter(Boolean).map((folder, index, arr) => {
          const folderPath = '/' + arr.slice(0, index + 1).join('/');
          return (
            <React.Fragment key={folderPath}>
              <ChevronRight size={13} className="text-slate-450 dark:text-slate-600" />
              <button 
                onClick={() => setCurrentFolder(folderPath)}
                className="hover:text-blue-500 transition-colors uppercase tracking-wider text-slate-700 dark:text-slate-200"
              >
                {folder}
              </button>
            </React.Fragment>
          );
        })}

        {currentFolder && (
          <button 
            onClick={navigateUp}
            className="ml-auto flex items-center gap-1 text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <ArrowLeft size={13} />
            <span>Up One Level</span>
          </button>
        )}
      </div>

      {/* Main vault dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start z-10">
        
        {/* Document Directory Arena */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-5 flex flex-col gap-5">
            {/* Search Input Bar */}
            <div className="flex gap-4">
              <Input
                placeholder="Search secure database (Name, Mime, Hash)..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                variant="secondary" 
                className="px-4 shrink-0 font-bold"
                onClick={fetchDocuments}
              >
                Refresh Index
              </Button>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-500"></div>
                <span className="text-[10px] font-bold text-slate-450 tracking-widest uppercase">Analyzing Secure Index...</span>
              </div>
            ) : documents.length === 0 && subfolders.length === 0 ? (
              <div className="py-28 text-center flex flex-col items-center justify-center">
                <FileText className="text-slate-300 dark:text-white/5 mb-4 shrink-0" size={44} />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Vault Folder Empty
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 font-medium">
                  No encrypted files matched this folder path, or you lack read authorization tags.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* 1. Folders Display Section (Notion-style navigation) */}
                {subfolders.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                      Folders
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {subfolders.map(folder => (
                        <div 
                          key={folder}
                          onClick={() => setCurrentFolder(currentFolder ? `${currentFolder}/${folder}` : `/${folder}`)}
                          className="bg-slate-200/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/25 dark:hover:border-blue-500/20 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 group"
                        >
                          <Folder size={18} className="text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors truncate">
                            {folder}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Files List Section (Grid vs Table views) */}
                {documents.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                      Secured Assets
                    </h4>
                    
                    {isGridView ? (
                      /* Grid View Cards */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {documents.map(doc => (
                          <div 
                            key={doc.id}
                            className="bg-slate-200/30 dark:bg-white/[0.01] border border-slate-200/60 dark:border-white/5 hover:border-blue-500/20 dark:hover:border-blue-500/20 rounded-xl p-4.5 flex flex-col gap-4 transition-all duration-300 group"
                          >
                            <div className="flex items-start justify-between gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500/15 transition-colors">
                                <FileText size={16} />
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-500 transition-colors leading-tight">
                                  {doc.title}
                                </span>
                                <span className="text-[9px] text-slate-450 dark:text-slate-400 font-bold uppercase mt-1 leading-none">
                                  {formatSize(doc.file_size)} • {doc.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                                </span>
                              </div>
                              <Badge variant={doc.effective_permission === 'owner' ? 'success' : doc.effective_permission === 'editor' ? 'editor' : 'viewer'}>
                                {doc.effective_permission}
                              </Badge>
                            </div>

                            {/* Hex Crypto target URI */}
                            <div className="font-mono text-[9px] text-blue-500 dark:text-cyan-400 bg-slate-950/20 dark:bg-slate-950/40 border border-slate-250/20 dark:border-white/5 p-2 rounded-lg truncate">
                              aes-gcm://{doc.id}
                            </div>

                            {/* Direct Action Widgets */}
                            <div className="flex items-center gap-1.5 mt-1 border-t border-slate-200 dark:border-white/5 pt-3.5">
                              {/* Preview */}
                              <button
                                onClick={() => handlePreview(doc)}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.04] text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-white transition-colors"
                                title="Secure Preview"
                              >
                                <Eye size={14} />
                              </button>

                              {/* Download */}
                              <button
                                onClick={() => handleDownload(doc.id, doc.original_name)}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.04] text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-white transition-colors"
                                title="Decrypt & Download"
                              >
                                <Download size={14} />
                              </button>

                              {/* Rename */}
                              {(doc.effective_permission === 'owner' || doc.effective_permission === 'editor' || user?.role === 'admin') && (
                                <button
                                  onClick={() => {
                                    setRenameDoc(doc);
                                    setRenameTitle(doc.title);
                                    setIsRenameModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.04] text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-white transition-colors"
                                  title="Rename Cryptotarget"
                                >
                                  <Edit3 size={14} />
                                </button>
                              )}

                              {/* Move */}
                              {(doc.effective_permission === 'owner' || doc.effective_permission === 'editor' || user?.role === 'admin') && (
                                <button
                                  onClick={() => {
                                    setMoveDoc(doc);
                                    setMoveToFolder(doc.folder_path);
                                    setIsMoveModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.04] text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-white transition-colors"
                                  title="Move to Folder"
                                >
                                  <FolderInput size={14} />
                                </button>
                              )}

                              {/* Share */}
                              {doc.effective_permission === 'owner' && (
                                <button
                                  onClick={() => openShareModal(doc)}
                                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/[0.04] text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                                  title="Grant Sharing Rights"
                                >
                                  <Share2 size={14} />
                                </button>
                              )}

                              {/* Delete */}
                              {(doc.effective_permission === 'owner' || user?.role === 'admin') && (
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="ml-auto p-1.5 rounded-lg hover:bg-red-500/5 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Purge Archive"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Table List View */
                      <div className="overflow-x-auto border border-slate-200 dark:border-white/5 rounded-xl">
                        <table className="w-full text-left border-collapse bg-slate-200/10 dark:bg-[#000000]/10">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 text-[9px] text-slate-450 dark:text-slate-400 uppercase font-bold tracking-widest">
                              <th className="py-3 px-4">Name</th>
                              <th className="py-3 px-4">Owner</th>
                              <th className="py-3 px-4">Integrity Hash</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-300">
                            {documents.map(doc => (
                              <tr key={doc.id} className="hover:bg-slate-200/20 dark:hover:bg-white/[0.01] transition-colors duration-200 group">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <FileText size={15} className="text-blue-500" />
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-500 transition-colors">
                                        {doc.title}
                                      </span>
                                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                                        {formatSize(doc.file_size)} • {doc.mime_type}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-500 dark:text-slate-450">
                                  {doc.owner_email}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[9px] text-slate-400 dark:text-slate-500 max-w-[100px] truncate" title={doc.file_hash}>
                                  {doc.file_hash || 'Calculating...'}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button onClick={() => handlePreview(doc)} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 hover:text-blue-500 dark:hover:text-white" title="Secure Preview"><Eye size={13} /></button>
                                    <button onClick={() => handleDownload(doc.id, doc.original_name)} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 hover:text-blue-500 dark:hover:text-white" title="Decrypt & Download"><Download size={13} /></button>
                                    {(doc.effective_permission === 'owner' || doc.effective_permission === 'editor' || user?.role === 'admin') && (
                                      <button onClick={() => { setRenameDoc(doc); setRenameTitle(doc.title); setIsRenameModalOpen(true); }} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 hover:text-blue-500 dark:hover:text-white" title="Rename"><Edit3 size={13} /></button>
                                    )}
                                    {(doc.effective_permission === 'owner' || user?.role === 'admin') && (
                                      <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded hover:bg-red-500/5 text-slate-400 hover:text-red-500" title="Purge"><Trash2 size={13} /></button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Secure Drag & Drop Upload Panel */}
        <div className="flex flex-col gap-6">
          <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-5 border border-blue-500/10 shadow-lg shadow-blue-500/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="text-blue-500 glow-primary" size={16} />
              <span>Secure Upload Stream</span>
            </h3>

            {isViewer ? (
              <div className="bg-slate-200/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-5 flex flex-col gap-3 text-center items-center justify-center">
                <Lock className="text-slate-450 dark:text-slate-500 mb-1" size={26} />
                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Least Privilege Restricted
                </span>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal font-medium">
                  Your node is restricted under a <strong>Viewer</strong> credential tag, which disables uploading capabilities.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                {uploadError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-bold p-3 rounded-lg flex gap-2">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Drag and Drop Container */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border border-dashed rounded-xl py-9 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group
                    ${dragActive 
                      ? 'border-blue-500 bg-blue-500/10 shadow-inner' 
                      : 'border-slate-250 hover:border-blue-500/40 dark:border-white/10 dark:hover:border-blue-500/40 bg-slate-200/20 dark:bg-white/[0.01]'
                    }
                  `}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-500/5 border border-blue-500/15 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/10 group-hover:scale-105 transition-all duration-300">
                    <Plus size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 group-hover:text-blue-500 transition-colors leading-none">
                    {dragActive ? 'Drop file payload here' : 'Drop file payload or browse'}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    PDF, DOCX, PNG, JPG, TXT, ZIP up to 50MB
                  </span>
                </div>

                {/* Secure Progress Bar */}
                {uploading && (
                  <div className="flex flex-col gap-1.5 mt-1 bg-slate-200/40 dark:bg-white/[0.02] border border-slate-250/50 dark:border-white/5 p-3 rounded-lg relative overflow-hidden">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{uploadProgress === 100 ? 'AES Encrypting Complete' : 'Streaming Encrypt...'}</span>
                      <span className="text-blue-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-200 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {selectedFile && !uploading && (
                  <div className="bg-slate-200/40 dark:bg-white/[0.02] border border-slate-250/50 dark:border-white/5 p-3 rounded-xl flex flex-col gap-1.5 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 h-[2px] bg-blue-500 w-full glow-primary"></div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                      Payload Details
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate pr-4 leading-tight">
                      {selectedFile.name}
                    </span>
                    <span className="text-[9px] text-blue-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                      {formatSize(selectedFile.size)} • READY FOR AES COMIT
                    </span>
                  </div>
                )}

                <Input
                  label="Secured Asset Title"
                  placeholder="e.g. Project Specs Q4"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={!selectedFile || uploading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 mt-1 font-bold"
                  loading={uploading}
                  disabled={!selectedFile || uploading}
                >
                  Encrypt & Commit Payload
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        title="Rename Cryptotarget Asset"
        size="sm"
      >
        <form onSubmit={handleRenameSubmit} className="flex flex-col gap-4">
          {renameError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-550 dark:text-red-400 text-xs font-semibold p-3 rounded-lg flex gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{renameError}</span>
            </div>
          )}
          <Input
            label="New Title / Name"
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Rename File
            </Button>
          </div>
        </form>
      </Modal>

      {/* Move Modal */}
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title="Move Secure Document"
        size="sm"
      >
        <form onSubmit={handleMoveSubmit} className="flex flex-col gap-4">
          {moveError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-550 dark:text-red-400 text-xs font-semibold p-3 rounded-lg flex gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{moveError}</span>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest leading-none">
              Target Folder Path
            </label>
            <input
              type="text"
              placeholder="e.g. /Projects or leave empty for Root"
              value={moveToFolder}
              onChange={(e) => setMoveToFolder(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:outline-none transition-all duration-200"
            />
            <p className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold leading-normal mt-1">
              Specify folder paths starting with a slash, such as <code>/Projects</code> or <code>/Financials/Archive</code>.
            </p>
          </div>
          <div className="flex gap-3 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Move Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Create New Vault Folder"
        size="sm"
      >
        <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
          <Input
            label="Folder Name"
            placeholder="e.g. Financials"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex gap-3 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={() => setIsFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Folder
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal (Fully Decrypted Client-Side Blob URL) */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
          }
          setPreviewText('');
          setPreviewHtml('');
          setZipEntries([]);
        }}
        title={`Secure Decrypted Preview: ${previewDoc?.title}`}
        size="lg"
      >
        <div className="flex flex-col gap-4">
          {previewLoading ? (
            <div className="py-28 flex flex-col items-center justify-center gap-3.5">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="text-[10px] font-bold text-slate-450 tracking-widest uppercase animate-pulse">Decrypting safe stream...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center bg-slate-950/20 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 rounded-xl p-4 min-h-[40vh] max-h-[75vh] overflow-y-auto relative">
              {/* Secure Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-30 opacity-[0.06] dark:opacity-[0.03] flex flex-wrap justify-around items-center">
                {Array.from({ length: 16 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="text-[11px] font-mono font-black rotate-[-30deg] uppercase tracking-widest whitespace-nowrap p-8 text-slate-650 dark:text-slate-400"
                  >
                    {user?.email} • SECURE PREVIEW • {new Date().toLocaleDateString()}
                  </div>
                ))}
              </div>
              {/* Render based on Mime-Type */}
              {previewDoc?.mime_type?.startsWith('image/') ? (
                <img 
                  src={previewUrl} 
                  alt={previewDoc?.title} 
                  className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg border border-slate-200 dark:border-white/5" 
                />
              ) : previewDoc?.mime_type === 'text/plain' || previewDoc?.mime_type === 'application/json' ? (
                <pre className="w-full bg-slate-950 dark:bg-black/40 text-slate-200 p-5 rounded-lg font-mono text-xs overflow-x-auto text-left whitespace-pre-wrap select-text selection:bg-blue-500/30">
                  {previewText}
                </pre>
              ) : previewDoc?.mime_type === 'application/pdf' ? (
                <object
                  data={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                  type="application/pdf"
                  className="w-full h-[65vh] rounded-lg border border-slate-250 dark:border-white/5 bg-white"
                  aria-label={previewDoc?.title}
                >
                  <embed
                    src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                    type="application/pdf"
                    className="w-full h-[65vh] rounded-lg border border-slate-250 dark:border-white/5 bg-white"
                  />
                  <div className="flex flex-col items-center justify-center text-center p-8 gap-3 my-auto">
                    <FileText className="text-slate-300 dark:text-white/10 shrink-0" size={54} />
                    <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      PDF Preview Blocked
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5 leading-normal">
                      Your browser did not render the secure PDF stream inline. The decrypted file is available for download.
                    </p>
                    <Button onClick={() => handleDownload(previewDoc.id, previewDoc.original_name)} variant="primary" className="mt-3.5 px-6 font-bold">
                      Download PDF
                    </Button>
                  </div>
                </object>
              ) : previewDoc?.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || previewDoc?.original_name?.toLowerCase().endsWith('.docx') ? (
                <div className="w-full max-w-3xl bg-white text-slate-900 rounded-lg border border-slate-200 p-6 text-left shadow-sm overflow-x-auto">
                  <div
                    className="prose prose-sm max-w-none [&_p]:mb-3 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-2"
                    dangerouslySetInnerHTML={{ __html: previewHtml || '<p>No readable document content was found.</p>' }}
                  />
                </div>
              ) : previewDoc?.mime_type === 'application/zip' || previewDoc?.mime_type === 'application/x-zip-compressed' || previewDoc?.original_name?.toLowerCase().endsWith('.zip') ? (
                <div className="w-full max-w-3xl bg-white dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden text-left">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Folder size={16} className="text-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {zipEntries.length} archived item{zipEntries.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-[58vh] overflow-y-auto divide-y divide-slate-200 dark:divide-white/5">
                    {zipEntries.length > 0 ? zipEntries.map((entry) => (
                      <div key={entry.name} className="px-4 py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {entry.isDirectory ? <Folder size={14} className="text-blue-500 shrink-0" /> : <FileText size={14} className="text-slate-500 shrink-0" />}
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                            {entry.name}
                          </span>
                        </div>
                        {!entry.isDirectory && (
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {formatSize(entry.size)}
                          </span>
                        )}
                      </div>
                    )) : (
                      <div className="p-6 text-center text-xs text-slate-500">This archive is empty.</div>
                    )}
                  </div>
                </div>
              ) : previewDoc?.original_name?.toLowerCase().endsWith('.xip') ? (
                <div className="flex flex-col items-center justify-center text-center p-8 gap-3 my-auto">
                  <Folder className="text-blue-500 shrink-0" size={54} />
                  <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    XIP Archive
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5 leading-normal">
                    {previewText || 'XIP archives can be uploaded and downloaded, but only ZIP archives support internal file listing.'}
                  </p>
                  <Button onClick={() => handleDownload(previewDoc.id, previewDoc.original_name)} variant="primary" className="mt-3.5 px-6 font-bold">
                    Download Archive
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 gap-3 my-auto">
                  <FileText className="text-slate-300 dark:text-white/10 shrink-0" size={54} />
                  <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Format Preview not Supported
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5 leading-normal">
                    This asset's MIME type (<code>{previewDoc?.mime_type}</code>) is highly secured under GCM envelopes. Click Download to decrypt and open.
                  </p>
                  <Button 
                    onClick={() => handleDownload(previewDoc.id, previewDoc.original_name)} 
                    variant="primary" 
                    className="mt-3.5 px-6 font-bold"
                  >
                    Download Decrypted File
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Access Sharing Grant Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`Secure Access Share: ${activeDoc?.title}`}
        size="xl"
      >
        <div className="flex flex-col gap-6">
          {shareSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-505 text-emerald-450 text-xs font-semibold px-4 py-3 rounded-lg flex gap-2">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{shareSuccessMsg}</span>
            </div>
          )}

          {shareErrorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-lg flex gap-2">
              <Shield size={16} className="shrink-0 mt-0.5" />
              <span>{shareErrorMsg}</span>
            </div>
          )}

          {/* Segmented Tab Selector */}
          <div className="flex border-b border-slate-200 dark:border-white/5 pb-0.5 gap-6">
            <button
              onClick={() => {
                setShareTab('direct');
                setShareSuccessMsg('');
                setShareErrorMsg('');
              }}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                shareTab === 'direct' 
                  ? 'text-blue-500' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Direct Email Share
              {shareTab === 'direct' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full glow-primary"></div>
              )}
            </button>
            <button
              onClick={() => {
                setShareTab('public');
                setShareSuccessMsg('');
                setShareErrorMsg('');
              }}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                shareTab === 'public' 
                  ? 'text-blue-500' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Public Share Link
              {shareTab === 'public' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full glow-primary"></div>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Settings */}
            <div className="flex flex-col gap-5 border-r border-slate-200 dark:border-white/5 pr-0 lg:pr-6">
              {shareTab === 'direct' ? (
                /* Tab 1: Share directly with a user */
                <form onSubmit={handleDirectShare} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 bg-slate-200/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} className="text-blue-500" />
                      <span>Direct Collaboration settings</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                          Permission
                        </label>
                        <select
                          value={sharePermission}
                          onChange={(e) => setSharePermission(e.target.value)}
                          className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 mt-2"
                        >
                          <option value="viewer">Viewer (Read Only)</option>
                          <option value="editor">Editor (Edit / Upload)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                          Expiry
                        </label>
                        <select
                          value={expiresHours}
                          onChange={(e) => setExpiresHours(e.target.value)}
                          className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 mt-2"
                        >
                          <option value="1">1 Hour</option>
                          <option value="24">24 Hours</option>
                          <option value="168">7 Days</option>
                          <option value="">Unlimited</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-1">
                    <Input
                      label="Recipient Node Email Address"
                      placeholder="e.g. colleague@docushield.io"
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full py-2.5 font-bold">
                    Grant Collaboration Clearance
                  </Button>
                </form>
              ) : (
                /* Tab 2: Anonymous Share Link Token generation */
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 bg-slate-200/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Shield size={14} className="text-blue-500" />
                      <span>Security Envelope Settings</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                          Link Permission
                        </label>
                        <select
                          value={sharePermission}
                          onChange={(e) => setSharePermission(e.target.value)}
                          className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 mt-2"
                        >
                          <option value="viewer">Viewer (Download)</option>
                          <option value="editor">Editor (Allow Upload)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                          Link Expiration
                        </label>
                        <select
                          value={expiresHours}
                          onChange={(e) => setExpiresHours(e.target.value)}
                          className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-blue-500 mt-2"
                        >
                          <option value="1">1 Hour</option>
                          <option value="24">24 Hours</option>
                          <option value="168">7 Days</option>
                          <option value="">Unlimited</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced policy inputs */}
                  <div className="flex flex-col gap-3.5 bg-slate-200/20 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 p-4 rounded-xl">
                    <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                      Zero-Trust Access Control Rules
                    </h5>

                    <Input
                      label="Enforce Access Password (Optional)"
                      placeholder="Enter secure link decryption password..."
                      type="password"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Limit allowed IP/CIDR (Optional)"
                        placeholder="e.g. 192.168.1.50"
                        value={allowedIp}
                        onChange={(e) => setAllowedIp(e.target.value)}
                      />

                      <Input
                        label="Max views count (One-Time Link)"
                        placeholder="e.g. 1 for One-Time Access"
                        type="number"
                        min="1"
                        value={maxViews}
                        onChange={(e) => setMaxViews(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {!generatedLink ? (
                    <Button 
                      onClick={handleGenerateShareLink}
                      variant="primary"
                      className="w-full flex gap-2 justify-center py-2.5 font-bold"
                    >
                      <Plus size={15} />
                      <span>Initialize Public Cryptotarget Link</span>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedLink}
                          className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-cyan-400 rounded-lg py-2.5 px-3 text-[10px] font-mono select-all focus:outline-none"
                        />
                        <Button 
                          onClick={handleCopyLink} 
                          variant="secondary" 
                          className="px-4 shrink-0 flex items-center gap-1.5 font-bold"
                        >
                          {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </Button>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-semibold leading-none mt-1">
                        <Calendar size={11} />
                        <span>
                          {expiresHours ? `Link token auto-expires after ${expiresHours} hours.` : 'Link has unlimited lifetime.'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Active Shares (Access Revocation) */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Active Sharing Envelopes
              </h3>

              {loadingShares ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auditing Active Shares...</span>
                </div>
              ) : activeShares.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-xl flex flex-col items-center justify-center">
                  <Share2 className="text-slate-350 dark:text-white/10 mb-3 shrink-0" size={32} />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">
                    Strict Private Containment
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mt-1 leading-normal font-medium">
                    This file is restricted. No public tokens or direct collaborate shares exist.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
                  {activeShares.map((share) => (
                    <div 
                      key={share.id} 
                      className="bg-slate-200/40 dark:bg-white/[0.02] border border-slate-250/60 dark:border-white/5 p-3.5 rounded-xl flex items-start justify-between gap-3 transition-all"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                          {share.share_token ? <Eye size={13} /> : <User size={13} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          {share.share_token ? (
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              Public Secure Link
                              {share.password_protected && (
                                <Lock size={10} className="text-indigo-400 shrink-0" title="Password Protected" />
                              )}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {share.shared_with_email}
                            </span>
                          )}

                          {/* Extra Rules Badge metrics */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[8px] bg-slate-250 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
                              {share.permission}
                            </span>
                            {share.allowed_ip && (
                              <span className="text-[8px] bg-red-500/10 text-red-500 dark:text-red-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none border border-red-500/10">
                                IP: {share.allowed_ip}
                              </span>
                            )}
                            {share.max_views !== null && share.max_views !== undefined && (
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none border border-emerald-500/10">
                                Views: {share.current_views} / {share.max_views}
                              </span>
                            )}
                            {share.max_views === null && (
                              <span className="text-[8px] bg-blue-550/10 text-blue-500 dark:text-cyan-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none border border-blue-500/10">
                                Views: {share.current_views}
                              </span>
                            )}
                          </div>

                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                            {share.expires_at 
                              ? `Expires: ${new Date(share.expires_at).toLocaleString()}` 
                              : 'Access: Permanent'
                            }
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRevokeShare(share.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        title="Revoke Share"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Password Prompt Modal for Cryptotarget shares */}
      <Modal
        isOpen={isPasswordPromptOpen}
        onClose={() => {
          setIsPasswordPromptOpen(false);
          setPromptPassword('');
          setPromptError('');
          if (promptRejectRef.current) {
            promptRejectRef.current(new Error('Secure link password prompt cancelled.'));
          }
        }}
        title="Zero-Trust Authentication Verification"
        size="sm"
      >
        <form onSubmit={handlePasswordPromptSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2.5 bg-yellow-500/15 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-3.5 rounded-xl text-xs font-semibold leading-normal">
            <Lock className="shrink-0 text-yellow-500 mt-0.5" size={16} />
            <span>This shared link is password-protected. Enter the required passkey to authorize cryptographic stream decryption.</span>
          </div>

          {promptError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-550 dark:text-red-400 text-[10px] font-bold p-2.5 rounded-lg flex gap-1.5">
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              <span>{promptError}</span>
            </div>
          )}

          <Input
            type="password"
            label="Share Password"
            placeholder="Enter password..."
            value={promptPassword}
            onChange={(e) => setPromptPassword(e.target.value)}
            required
            autoFocus
          />

          <div className="flex gap-3 justify-end mt-1">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsPasswordPromptOpen(false);
                setPromptPassword('');
                setPromptError('');
                if (promptRejectRef.current) {
                  promptRejectRef.current(new Error('Secure link password prompt cancelled.'));
                }
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Decrypt Envelope
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Documents;
