'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Tag, 
  AlertTriangle,
  BarChart3,
  Shield,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { db } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_questions: 0,
    total_comments: 0,
    pending_reports: 0
  });
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.role === 'a') {
            setChecking(false);
            return;
          }
        }
        // If not admin, redirect to login
        window.location.href = '/login';
      } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!checking && user?.role === 'a') {
      const loadStats = async () => {
        try {
          const response = await fetch('/api/admin/statistics');
          const result = await response.json();
          
          if (result.success) {
            setStats(result.data);
          }
        } catch (error) {
          console.error('Error loading statistics:', error);
        } finally {
          setLoading(false);
        }
      };

      loadStats();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
  }, [checking, user]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-glass rounded-2xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-glass">{t('admin.dashboard.checkingAuth')}</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'a') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-glass rounded-2xl p-8 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-glass mb-2">{t('admin.dashboard.noAccess')}</h1>
          <p className="text-muted-foreground">{t('admin.dashboard.noAccessDesc')}</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      <div className="container-glass py-8">
        {/* Header */}
        <motion.div 
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-glass mb-2">
              {t('admin.dashboard.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('admin.dashboard.subtitle')}
            </p>
          </div>
          <Button
            variant="glass"
            size="sm"
            onClick={async () => {
              setLoading(true);
              try {
                const response = await fetch('/api/admin/statistics');
                const result = await response.json();
                
                if (result.success) {
                  setStats(result.data);
                }
              } catch (error) {
                console.error('Error loading statistics:', error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('admin.dashboard.refresh')}
          </Button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.totalUsers')}</p>
                    <p className="text-2xl font-bold text-glass">
                      {loading ? '...' : stats.total_users}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.totalQuestions')}</p>
                    <p className="text-2xl font-bold text-glass">
                      {loading ? '...' : stats.total_questions}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.totalComments')}</p>
                    <p className="text-2xl font-bold text-glass">
                      {loading ? '...' : stats.total_comments}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('admin.dashboard.pendingReports')}</p>
                    <p className="text-2xl font-bold text-glass">
                      {loading ? '...' : stats.pending_reports}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Link href="/admin/users">
              <Card variant="hover-glass">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-glass">
                      {t('admin.dashboard.manageUsers')}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t('admin.dashboard.manageUsers.desc')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/admin/categories">
              <Card variant="hover-glass">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Tag className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-glass">
                      {t('admin.dashboard.manageCategories')}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t('admin.dashboard.manageCategories.desc')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/admin/reports">
              <Card variant="hover-glass">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-glass">
                      {t('admin.dashboard.manageReports')}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t('admin.dashboard.manageReports.desc')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/admin/statistics">
              <Card variant="hover-glass">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-glass">
                      {t('admin.dashboard.viewStatistics')}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t('admin.dashboard.viewStatistics.desc')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/admin/profanity">
              <Card variant="hover-glass">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="ml-3 text-lg font-semibold text-glass">
                      จัดการคำหยาบคาย
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    ตรวจสอบและจัดการคำไม่สุภาพในระบบ
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}