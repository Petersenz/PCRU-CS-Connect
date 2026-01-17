'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { formatRelativeTime } from '@/lib/utils';

export default function ReportsManagement() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const { user } = useAuthStore();
  const { language, t } = useLanguageStore();

  useEffect(() => {
    // Check if user is admin or teacher
    if (!user || (user.role !== 'a' && user.role !== 't')) {
      window.location.href = '/unauthorized';
      return;
    }
    loadReports();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadReports, 30000);
    return () => clearInterval(interval);
  }, [user, filter]);

  const loadReports = async () => {
    try {
      const response = await fetch(`/api/admin/reports?filter=${filter}`);
      const result = await response.json();
      if (result.success) {
        setReports(result.data || []);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('ไม่สามารถโหลดรายงานได้');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: number) => {
    if (!confirm('ยืนยันการดำเนินการ? เนื้อหาจะถูกซ่อน/ลบ')) return;

    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, is_resolved: true, action: 'hide' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ดำเนินการสำเร็จ - เนื้อหาถูกซ่อนแล้ว');
        await loadReports();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Resolve error:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleReject = async (reportId: number) => {
    if (!confirm('ยืนยันการปฏิเสธรายงาน? เนื้อหาจะยังคงอยู่')) return;

    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, is_resolved: true, action: 'reject' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ปฏิเสธรายงานสำเร็จ - เนื้อหายังคงอยู่');
        await loadReports();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const getReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
      spam: t('admin.reports.spam'),
      inappropriate: t('admin.reports.inappropriate'),
      offensive: t('admin.reports.offensive'),
      misleading: t('admin.reports.misleading'),
      other: t('admin.reports.other')
    };
    return reasons[reason] || reason;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="container-glass py-8">
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-glass flex items-center">
                <Flag className="w-6 h-6 mr-2" />
                {t('admin.reports.manageReports')}
              </CardTitle>
              
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'pending' ? 'primary-glass' : 'glass'}
                  size="sm"
                  onClick={() => setFilter('pending')}
                >
                  {t('admin.reports.pending')}
                </Button>
                <Button
                  variant={filter === 'resolved' ? 'primary-glass' : 'glass'}
                  size="sm"
                  onClick={() => setFilter('resolved')}
                >
                  {t('admin.reports.resolved')}
                </Button>
                <Button
                  variant={filter === 'all' ? 'primary-glass' : 'glass'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  {t('admin.reports.allReports')}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <motion.div
                    key={report.report_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-glass rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            report.is_resolved
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-500 text-red-100 dark:text-red-100'
                          }`}>
                            {report.is_resolved ? t('admin.reports.resolved') : t('admin.reports.pending')}
                          </span>
                          <span className="px-3 py-1 text-xs font-medium bg-orange-900 dark:bg-orange-500 text-orange-800 dark:text-white rounded-full">
                            {getReasonText(report.reason)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {report.content_type === 'q' ? t('admin.reports.question') : t('admin.reports.comment')}
                          </span>
                        </div>

                        <p className="text-sm text-glass mb-2">
                          <strong>{t('admin.reports.reportedBy')}:</strong> {report.reporter?.full_name}
                        </p>

                        {report.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {report.description}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(report.created_at, language)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/questions/${report.content_id}`} target="_blank">
                          <Button variant="glass" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        {!report.is_resolved && (
                          <>
                            <Button
                              variant="primary-glass"
                              size="sm"
                              onClick={() => handleResolve(report.report_id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {t('admin.reports.hideDelete')}
                            </Button>
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => handleReject(report.report_id)}
                              className="text-muted-foreground hover:text-glass"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {t('admin.reports.reject')}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Flag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-glass mb-2">
                  {t('admin.reports.noReports')}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'pending' ? t('admin.reports.noPendingReports') : t('admin.reports.noReportsInCategory')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
