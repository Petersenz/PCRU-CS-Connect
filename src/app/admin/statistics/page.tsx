'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/supabase';
import { useLanguageStore } from '@/stores/language';

export default function StatisticsPage() {
  const { t } = useLanguageStore();
  const [stats, setStats] = useState({
    total_users: 0,
    total_questions: 0,
    total_comments: 0,
    pending_reports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/statistics');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Failed to load statistics:', result.error);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-glass py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-glass mb-2">{t('admin.statistics.title')}</h1>
          <p className="text-muted-foreground">{t('admin.statistics.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.totalUsers')}</p>
                  <p className="text-3xl font-bold text-glass mt-2">
                    {loading ? '...' : stats.total_users}
                  </p>
                </div>
                <Users className="w-10 h-10 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.totalQuestions')}</p>
                  <p className="text-3xl font-bold text-glass mt-2">
                    {loading ? '...' : stats.total_questions}
                  </p>
                </div>
                <MessageSquare className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.totalComments')}</p>
                  <p className="text-3xl font-bold text-glass mt-2">
                    {loading ? '...' : stats.total_comments}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.pendingReports')}</p>
                  <p className="text-3xl font-bold text-glass mt-2">
                    {loading ? '...' : stats.pending_reports}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* <Card variant="glass" className="mt-8">
          <CardHeader>
            <CardTitle className="text-glass flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              สถิติการใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              กราฟและรายงานเพิ่มเติมจะพัฒนาในอนาคต
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}