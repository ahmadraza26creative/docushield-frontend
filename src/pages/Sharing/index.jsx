import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Trash2, 
  Lock, 
  ExternalLink,
  Shield,
  FileText,
  User,
  Calendar,
  Copy,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const Sharing = () => {
  const { user, fetchPendingShares } = useAuth();
  
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [incomingDocs, setIncomingDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [shares, setShares] = useState([]);
  const [pendingShares, setPendingShares] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingShares, setLoadingShares] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('viewer');
  const [expiresHours, setExpiresHours] = useState('24');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // 1. Fetch documents owned by the user (including subfolders)
  const fetchOwnedDocuments = async () => {
    try {
      setLoadingDocs(true);
      const res = await api.get('/documents', { params: { all: 'true' } });
      const documents = res.data.documents || [];
      
      // Filter out files where permission is owner or admin (only those they own/control)
      const owned = documents.filter(d => d.effective_permission === 'owner' || d.effective_permission === 'admin' || user?.role === 'admin');
      const incoming = documents.filter(d => d.effective_permission !== 'owner' && d.effective_permission !== 'admin' && user?.role !== 'admin');
      setOwnedDocs(owned);
      setIncomingDocs(incoming);

      // Auto-select first doc
      if (owned.length > 0) {
        setSelectedDoc(owned[0]);
      } else {
        setSelectedDoc(null);
      }
    } catch (err) {
      console.error('Failed to fetch owned documents', err.message);
    } finally {
      setLoadingDocs(false);
    }
  };

  // 2. Fetch shares for selected document
  const fetchShares = async (docId) => {
    if (!docId) return;
    try {
      setLoadingShares(true);
      const res = await api.get(`/sharing/${docId}`);
      setShares(res.data.shares || []);
    } catch (err) {
      console.error('Failed to load shares for document', err.message);
    } finally {
      setLoadingShares(false);
    }
  };

  const loadPendingShares = async () => {
    try {
      setLoadingPending(true);
      const res = await api.get('/sharing/pending');
      console.log('Pending shares response:', res.data);
      setPendingShares(res.data.pendingShares || []);
    } catch (err) {
      console.error('Failed to load pending share invitations', err);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOwnedDocuments();
      loadPendingShares();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDoc) {
      fetchShares(selectedDoc.id);
    } else {
      setShares([]);
    }
  }, [selectedDoc]);

  // 3. Handle access revocation
  const handleRevoke = async (shareId) => {
    if (!window.confirm('WARNING: Revoking this access will immediately invalidate all associated tokens or user permissions. Proceed?')) {
      return;
    }

    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.delete(`/sharing/${shareId}`);
      setSuccessMsg('Access privilege successfully revoked.');
      fetchShares(selectedDoc.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to revoke sharing access.');
    }
  };

  const handleDirectShare = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !shareEmail) return;

    setSuccessMsg('');
    setErrorMsg('');
    setGeneratedLink('');

    try {
      await api.post('/sharing', {
        documentId: selectedDoc.id,
        targetEmail: shareEmail,
        permission: sharePermission,
        expiresHours: expiresHours || null
      });
      setSuccessMsg(`Document successfully shared with ${shareEmail}.`);
      setShareEmail('');
      fetchShares(selectedDoc.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to share document.');
    }
  };

  const handleAcceptShare = async (shareId) => {
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.post(`/sharing/${shareId}/accept`);
      setSuccessMsg('Share invitation accepted. Document is now visible in the Sharing Center.');
      loadPendingShares();
      if (fetchPendingShares) {
        fetchPendingShares();
      }
      fetchOwnedDocuments();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to accept share invitation.');
    }
  };

  const handleGenerateShareLink = async () => {
    if (!selectedDoc) return;

    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/sharing', {
        documentId: selectedDoc.id,
        generateLink: true,
        permission: sharePermission,
        expiresHours: expiresHours || null
      });
      const directUrl = `${window.location.origin}/api/documents/${selectedDoc.id}/download?share_token=${res.data.shareToken}`;
      setGeneratedLink(directUrl);
      setSuccessMsg('Secure public link generated.');
      fetchShares(selectedDoc.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to generate sharing link.');
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 transition-colors duration-300">
      {/* visual glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/[0.01] rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col gap-1.5 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white uppercase leading-none">
          Sharing <span className="text-blue-500 font-extrabold">Center</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Audit and revoke access permissions. Maintain tight control over all cryptographic keys and sharing envelopes.
        </p>
      </div>

      {loadingDocs ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-[10px] font-bold text-slate-450 tracking-widest uppercase">Analyzing Secure Index...</span>
        </div>
      ) : ownedDocs.length === 0 && incomingDocs.length === 0 && pendingShares.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-slate-200/20 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-2xl p-8 z-10">
          <FileText className="text-slate-350 dark:text-white/10 mb-4" size={48} />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            No Shared Documents
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-455 max-w-xs mt-2 leading-relaxed font-medium">
            No owned files or incoming direct shares are available for this account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start z-10">
          {/* List of owned documents */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1 leading-none">
              Select Document to Audit
            </h3>
            
            <div className="flex flex-col gap-3">
              {ownedDocs.length === 0 ? (
                <div className="text-[11px] text-slate-500 dark:text-slate-450 border border-dashed border-slate-200 dark:border-white/5 rounded-xl p-4">
                  You do not own any documents to audit or share.
                </div>
              ) : ownedDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`
                      rounded-xl p-4 cursor-pointer transition-all duration-300 flex items-start gap-3.5 border
                      ${isSelected 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm font-bold' 
                        : 'bg-slate-200/30 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/5 text-slate-800 dark:text-slate-200 hover:border-slate-350 dark:hover:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    <FileText size={18} className="shrink-0 mt-0.5 text-blue-500 dark:text-blue-450" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">
                        {doc.title}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-450 mt-1 uppercase font-bold tracking-wider leading-none">
                        {doc.original_name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {pendingShares.length > 0 && (
              <div className="flex flex-col gap-3 mt-4">
                <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1 leading-none">
                  Pending Invitations
                </h3>
                {pendingShares.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-xl p-4 border bg-amber-500/5 border-amber-500/15 text-slate-800 dark:text-slate-200 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <FileText size={18} className="shrink-0 mt-0.5 text-amber-500" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">
                          {invite.title}
                        </span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-450 mt-1 uppercase font-bold tracking-wider leading-none">
                          Invited by {invite.shared_by_email || invite.owner_email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[9px] text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {invite.permission} access • expires {invite.expires_at ? new Date(invite.expires_at).toLocaleString() : 'never'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAcceptShare(invite.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {incomingDocs.length > 0 && (
              <div className="flex flex-col gap-3 mt-4">
                <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest pl-1 leading-none">
                  Shared With Me
                </h3>
                {incomingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl p-4 border bg-emerald-500/5 border-emerald-500/15 text-slate-800 dark:text-slate-200 flex items-start gap-3.5"
                  >
                    <FileText size={18} className="shrink-0 mt-0.5 text-emerald-500" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">
                        {doc.title}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-450 mt-1 uppercase font-bold tracking-wider leading-none">
                        {doc.effective_permission} access • available in Secure Vault
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active shares list for the selected document */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-end pl-1 pr-1">
              <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                Active Sharing Envelopes
              </h3>
              {selectedDoc && (
                <span className="text-[10px] font-mono text-blue-500 dark:text-cyan-400 bg-slate-900/10 dark:bg-slate-950/40 px-2 py-0.5 rounded border border-slate-200/50 dark:border-white/5">
                  ID: {selectedDoc.id}
                </span>
              )}
            </div>

            <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-5 flex flex-col gap-4">
              {!selectedDoc && (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <Share2 className="text-slate-350 dark:text-white/10 mb-3" size={40} />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    No Owned Document Selected
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-450 max-w-xs mt-2 leading-relaxed font-medium">
                    Incoming shares are visible on the left and can be opened from Secure Vault. Only owners can grant or revoke access.
                  </p>
                </div>
              )}

              {selectedDoc && (
                <>
                <div className="bg-slate-200/20 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 p-4 rounded-xl flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                        Grant Access
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 font-medium">
                        Selected file: <strong>{selectedDoc.title}</strong>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 min-w-52">
                      <select
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value)}
                        className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                      <select
                        value={expiresHours}
                        onChange={(e) => setExpiresHours(e.target.value)}
                        className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg p-2 text-xs font-medium focus:outline-none focus:border-blue-500"
                      >
                        <option value="1">1 Hour</option>
                        <option value="24">24 Hours</option>
                        <option value="168">7 Days</option>
                        <option value="">Unlimited</option>
                      </select>
                    </div>
                  </div>

                  <form onSubmit={handleDirectShare} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                    <Input
                      label="Recipient Email"
                      type="email"
                      placeholder="colleague@docushield.io"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <Button type="submit" variant="primary" className="flex items-center gap-2 justify-center h-10">
                      <User size={14} />
                      <span>Share</span>
                    </Button>
                  </form>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleGenerateShareLink}
                      className="flex items-center gap-2 justify-center"
                    >
                      <Plus size={14} />
                      <span>Create Public Link</span>
                    </Button>
                    {generatedLink && (
                      <div className="flex gap-2 flex-1 min-w-0">
                        <input
                          type="text"
                          readOnly
                          value={generatedLink}
                          className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-cyan-400 rounded-lg py-2.5 px-3 text-[10px] font-mono select-all focus:outline-none"
                        />
                        <Button type="button" variant="secondary" onClick={handleCopyLink} className="px-4 shrink-0 flex items-center gap-1.5">
                          {copied ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-4 py-3 rounded-xl flex gap-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold px-4 py-3 rounded-xl flex gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {loadingShares ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="text-[10px] font-bold text-slate-455 tracking-widest uppercase">Loading Active Envelopes...</span>
                </div>
              ) : shares.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <Share2 className="text-slate-350 dark:text-white/10 mb-3" size={40} />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    No Active Sharing Configurations
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-450 max-w-xs mt-2 leading-relaxed font-medium">
                    This file is currently restricted under <strong>Strict Private Containment</strong>. No public tokens or direct grants exist.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {shares.map((share) => (
                    <div 
                      key={share.id} 
                      className="bg-slate-200/20 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300"
                    >
                      {/* Left: Share Target */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/[0.05] border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                          {share.share_token ? <ExternalLink size={15} /> : <User size={15} />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          {share.share_token ? (
                            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                              Secure Public Share Link
                              <span className="text-[9px] uppercase bg-blue-500/10 text-blue-600 dark:bg-cyan-500/10 dark:text-cyan-400 border border-blue-500/10 px-1.5 py-0.5 rounded font-bold tracking-wider">
                                Token Share
                              </span>
                              {share.password_protected && (
                                <Lock size={12} className="text-indigo-500 dark:text-indigo-400 shrink-0" title="Password Protected" />
                              )}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                              Direct User: <strong className="text-blue-500 dark:text-blue-450 font-bold">{share.shared_with_email}</strong>
                            </span>
                          )}
                          
                          {/* Advanced Policy Badges */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {share.allowed_ip && (
                              <span className="text-[9px] bg-red-500/10 text-red-655 border border-red-500/10 px-2 py-0.5 rounded font-bold tracking-wider">
                                Allowed IP: {share.allowed_ip}
                              </span>
                            )}
                            {share.max_views !== null && share.max_views !== undefined && (
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded font-bold tracking-wider">
                                Views: {share.current_views} / {share.max_views}
                              </span>
                            )}
                            {share.share_token && share.max_views === null && (
                              <span className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/10 px-2 py-0.5 rounded font-bold tracking-wider">
                                Views: {share.current_views}
                              </span>
                            )}
                          </div>

                          {/* Expiration Details */}
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 dark:text-slate-450 font-semibold">
                            <Calendar size={12} />
                            <span>
                              {share.expires_at 
                                ? `Expires: ${new Date(share.expires_at).toLocaleString()}` 
                                : 'Access Lifetime: Unlimited'
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Permissions & Revocation */}
                      <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-slate-200/50 dark:border-white/5 pt-3.5 md:pt-0 shrink-0">
                        <div className="flex flex-col md:items-end gap-1">
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                            Authorization
                          </span>
                          <Badge variant={share.permission === 'editor' ? 'editor' : 'viewer'}>
                            {share.permission}
                          </Badge>
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRevoke(share.id)}
                          className="px-3 py-1.5 flex items-center gap-2 hover:bg-red-500/10 hover:text-red-650 hover:border-red-500/20 dark:hover:text-red-400"
                        >
                          <Trash2 size={13} />
                          <span>Revoke Access</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
                </>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
