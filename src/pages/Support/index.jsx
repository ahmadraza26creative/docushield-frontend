import React from 'react';
import { AlertCircle, BookOpen, LifeBuoy, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const supportOptions = [
  {
    title: 'Account and access',
    description: 'Get help with login, MFA setup, roles, and account permissions.',
    icon: ShieldCheck,
    badge: 'Security'
  },
  {
    title: 'Document sharing',
    description: 'Troubleshoot invitations, previews, downloads, and secure links.',
    icon: MessageCircle,
    badge: 'Collaboration'
  },
  {
    title: 'Vault operations',
    description: 'Learn how upload, preview, archive listing, and audit logging work.',
    icon: BookOpen,
    badge: 'Docs'
  }
];

const knownChecks = [
  'Refresh the page after backend restarts so the newest frontend bundle is loaded.',
  'For shared files, accept the invitation before trying preview or download.',
  'For MFA, remove old DocuShield entries in Google Authenticator before scanning a new QR.',
  'Only admins can create team members or view audit/admin consoles.'
];

export const Support = () => {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Support</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Help center
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Find common fixes and support paths for DocuShield access, vault, sharing, and security workflows.
          </p>
        </div>
        <a href="mailto:support@docushield.local?subject=DocuShield support request">
          <Button>
            <Mail size={15} />
            Contact support
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {supportOptions.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} hoverEffect>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Icon size={18} />
                </div>
                <Badge>{item.badge}</Badge>
              </div>
              <h2 className="mt-5 text-sm font-semibold text-slate-950 dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <LifeBuoy size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Support request details</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                When reporting a problem, include the account email, page name, action attempted, and the visible error message.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#12151b]">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Example</p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              “I am signed in as ayazjutt126@gmail.com. On Secure Vault, clicking preview on a shared PDF shows failed to load.”
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Quick checks</h2>
          </div>
          <div className="mt-4 space-y-3">
            {knownChecks.map((check) => (
              <div key={check} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-[#12151b] dark:text-slate-300">
                {check}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Support;
