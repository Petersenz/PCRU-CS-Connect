'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Edit, MessageSquare, FileText, Heart, Flag } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('posts');
    const [isEditing, setIsEditing] = useState(false);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [userComments, setUserComments] = useState<any[]>([]);
    const [userLikes, setUserLikes] = useState<any[]>([]);
    const [userReports, setUserReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const isLoadingRef = useRef(false);
    const hasLoadedRef = useRef(false);

    const { user } = useAuthStore();
    const { t, language } = useLanguageStore();
    const router = useRouter();

    const [editForm, setEditForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        
        // Prevent multiple simultaneous calls
        if (isLoadingRef.current || hasLoadedRef.current) {
            return;
        }
        
        loadUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadUserData = async () => {
        if (isLoadingRef.current || hasLoadedRef.current) return;
        
        isLoadingRef.current = true;
        
        try {
            if (!supabase || !user) {
                isLoadingRef.current = false;
                return;
            }

            // Load full user data with created_at
            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', user.user_id)
                .single();

            if (userData) {
                // Update user in store with created_at
                useAuthStore.getState().setUser({ ...user, created_at: userData.created_at });
            }

            // Load user's posts
            const { data: posts } = await supabase
                .from('questions')
                .select(`
          *,
          categories:question_categories(
            category:categories(category_id, category_name)
          )
        `)
                .eq('user_id', user.user_id)
                .order('created_at', { ascending: false });

            setUserPosts(posts || []);

            // Load user's comments
            const { data: comments } = await supabase
                .from('comments')
                .select(`
          *,
          question:questions(question_id, title)
        `)
                .eq('user_id', user.user_id)
                .order('created_at', { ascending: false });

            setUserComments(comments || []);

            // Load user's likes (always load for count)
            const likesResponse = await fetch('/api/user/likes');
            const likesResult = await likesResponse.json();
            if (likesResult.success) {
                setUserLikes(likesResult.data || []);
            }

            // Load user's reports (always load for count)
            const reportsResponse = await fetch('/api/user/reports');
            const reportsResult = await reportsResponse.json();
            if (reportsResult.success) {
                setUserReports(reportsResult.data || []);
            }

            hasLoadedRef.current = true;
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('อัพเดทข้อมูลสำเร็จ');
                setIsEditing(false);
                // Update user in store
            } else {
                toast.error(result.error || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            toast.error('รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }

        if (passwordForm.new_password.length < 6) {
            toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: passwordForm.current_password,
                    new_password: passwordForm.new_password,
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
                setShowPasswordForm(false);
                setPasswordForm({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                });
            } else {
                toast.error(result.error || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen">
            <div className="container-glass py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-1">
                        <Card variant="glass">
                            <CardContent className="p-6">
                                {!isEditing ? (
                                    <>
                                        {/* Profile Display */}
                                        <div className="text-center mb-6">

                                            <h1 className="text-xl font-bold text-glass">
                                                {user.full_name}
                                            </h1>
                                            <p className="text-muted-foreground">
                                                {user.role === 's' ? t('role.student') :
                                                    user.role === 't' ? t('role.teacher') : t('role.admin')}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                    <User className="w-4 h-4 inline mr-2" />
                                                    {t('profile.userId')}
                                                </label>
                                                <p className="text-glass">{user.user_id}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                    <Mail className="w-4 h-4 inline mr-2" />
                                                    {t('profile.email')}
                                                </label>
                                                <p className="text-glass">{user.email}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                                    <Calendar className="w-4 h-4 inline mr-2" />
                                                    {t('profile.joinedDate')}
                                                </label>
                                                <p className="text-glass">
                                                    {user.created_at ? formatRelativeTime(user.created_at, language) : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mt-6">
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="primary-glass"
                                                className="w-full"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                {t('profile.edit')}
                                            </Button>
                                            <Button
                                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                                variant="glass"
                                                className="w-full"
                                            >
                                                {t('profile.changePassword')}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Edit Form */}
                                        <h2 className="text-lg font-semibold text-glass mb-4">
                                            {t('profile.edit')}
                                        </h2>

                                        <form onSubmit={handleEditSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-glass mb-1">
                                                    {t('profile.fullName')}
                                                </label>
                                                <Input
                                                    variant="glass"
                                                    value={editForm.full_name}
                                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-glass mb-1">
                                                    {t('profile.email')}
                                                </label>
                                                <Input
                                                    variant="glass"
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex space-x-3">
                                                <Button
                                                    type="submit"
                                                    variant="primary-glass"
                                                    className="flex-1"
                                                >
                                                    {t('common.save')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="glass"
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex-1"
                                                >
                                                    {t('common.cancel')}
                                                </Button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Password Change Form */}
                        {showPasswordForm && (
                            <Card variant="glass" className="mt-6">
                                <CardHeader>
                                    <CardTitle className="text-glass">{t('profile.changePassword')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-glass mb-1">
                                                {t('profile.currentPassword')}
                                            </label>
                                            <Input
                                                variant="glass"
                                                type="password"
                                                value={passwordForm.current_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-glass mb-1">
                                                {t('profile.newPassword')}
                                            </label>
                                            <Input
                                                variant="glass"
                                                type="password"
                                                value={passwordForm.new_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-glass mb-1">
                                                {t('profile.confirmPassword')}
                                            </label>
                                            <Input
                                                variant="glass"
                                                type="password"
                                                value={passwordForm.confirm_password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="flex space-x-3">
                                            <Button
                                                type="submit"
                                                variant="primary-glass"
                                                className="flex-1"
                                            >
                                                {t('common.save')}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="glass"
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setPasswordForm({
                                                        current_password: '',
                                                        new_password: '',
                                                        confirm_password: '',
                                                    });
                                                }}
                                                className="flex-1"
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stats */}
                        <Card variant="glass" className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-glass">{t('profile.stats')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('profile.postsCreated')}</span>
                                        <span className="font-semibold text-glass">{userPosts.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('profile.commentsCount')}</span>
                                        <span className="font-semibold text-glass">{userComments.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activity */}
                    <div className="lg:col-span-2">
                        <Card variant="glass">
                            {/* Tabs */}
                            <div className="border-b border-white/20 dark:border-gray-700/50">
                                <nav className="flex space-x-8 px-6">
                                    <button
                                        onClick={() => setActiveTab('posts')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'posts'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-muted-foreground hover:text-glass'
                                            }`}
                                    >
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        {t('profile.myPosts')} ({userPosts.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('comments')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'comments'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-muted-foreground hover:text-glass'
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4 inline mr-2" />
                                        {t('profile.myComments')} ({userComments.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('likes')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'likes'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-muted-foreground hover:text-glass'
                                            }`}
                                    >
                                        <Heart className="w-4 h-4 inline mr-2" />
                                        {t('profile.myLikes')} ({userLikes.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reports')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reports'
                                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                            : 'border-transparent text-muted-foreground hover:text-glass'
                                            }`}
                                    >
                                        <Flag className="w-4 h-4 inline mr-2" />
                                        {t('profile.myReports')} ({userReports.length})
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <CardContent className="p-6">
                                {activeTab === 'posts' && (
                                    <div className="space-y-4">
                                        {userPosts.length > 0 ? (
                                            userPosts.map(post => (
                                                <motion.div
                                                    key={post.question_id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="card-glass rounded-xl p-4 hover:shadow-glass transition-all"
                                                >
                                                    <Link
                                                        href={`/questions/${post.question_id}`}
                                                        className="text-lg font-semibold text-glass hover:text-primary-600 transition-colors block mb-2"
                                                    >
                                                        {post.title}
                                                    </Link>

                                                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                                        {post.content}
                                                    </p>

                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <div className="flex items-center space-x-2">
                                                            {post.categories?.slice(0, 2).map((cat: any, idx: number) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                                                                >
                                                                    {cat.category?.category_name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span>{post.created_at ? formatRelativeTime(post.created_at, language) : '-'}</span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium text-glass mb-2">
                                                    ยังไม่มีกระทู้
                                                </h3>
                                                <p className="text-muted-foreground mb-4">
                                                    คุณยังไม่ได้สร้างกระทู้ใดๆ
                                                </p>
                                                <Link href="/create">
                                                    <Button variant="primary-glass">
                                                        สร้างกระทู้แรก
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'comments' && (
                                    <div className="space-y-4">
                                        {userComments.length > 0 ? (
                                            userComments.map(comment => (
                                                <motion.div
                                                    key={comment.comment_id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="card-glass rounded-xl p-4"
                                                >
                                                    <Link
                                                        href={`/questions/${comment.question_id}`}
                                                        className="text-sm font-medium text-primary-600 hover:text-primary-500 block mb-2"
                                                    >
                                                        ตอบในกระทู้: {comment.question?.title}
                                                    </Link>

                                                    <p className="text-glass text-sm mb-3">
                                                        {comment.content}
                                                    </p>

                                                    <div className="text-xs text-muted-foreground">
                                                        {comment.created_at ? formatRelativeTime(comment.created_at, language) : '-'}
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium text-glass mb-2">
                                                    ยังไม่มีความคิดเห็น
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    คุณยังไม่ได้แสดงความคิดเห็นในกระทู้ใดๆ
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Likes Tab */}
                                {activeTab === 'likes' && (
                                    <div className="space-y-4">
                                        {userLikes.length > 0 ? (
                                            userLikes.map((like: any) => (
                                                <Card key={like.like_id} variant="hover-glass">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {like.content_type === 'q' ? 'กระทู้' : 'ความคิดเห็น'}
                                                                    </span>
                                                                </div>
                                                                {like.content_type === 'q' && like.question ? (
                                                                    <Link href={`/questions/${like.content_id}`}>
                                                                        <h3 className="font-semibold text-glass hover:text-primary-500 transition-colors mb-2">
                                                                            {like.question.title}
                                                                        </h3>
                                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                                            {like.question.content}
                                                                        </p>
                                                                    </Link>
                                                                ) : like.content_type === 'c' && like.comment ? (
                                                                    <Link href={`/questions/${like.comment.question_id}`}>
                                                                        <p className="text-sm text-glass hover:text-primary-500 transition-colors">
                                                                            {like.comment.content}
                                                                        </p>
                                                                    </Link>
                                                                ) : null}
                                                                <p className="text-xs text-muted-foreground mt-2">
                                                                    {formatRelativeTime(like.created_at, language)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium text-glass mb-2">
                                                    ยังไม่มีการกดถูกใจ
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    คุณยังไม่ได้กดถูกใจกระทู้หรือความคิดเห็นใดๆ
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reports Tab */}
                                {activeTab === 'reports' && (
                                    <div className="space-y-4">
                                        {userReports.length > 0 ? (
                                            userReports.map((report: any) => (
                                                <Card key={report.report_id} variant="hover-glass" className={report.is_resolved ? 'opacity-60' : ''}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <Flag className={`w-4 h-4 ${report.is_resolved ? 'text-green-500' : 'text-orange-500'}`} />
                                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                                        report.is_resolved 
                                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                                                    }`}>
                                                                        {report.is_resolved ? 'ดำเนินการแล้ว' : 'รอดำเนินการ'}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {report.content_type === 'q' ? 'กระทู้' : 'ความคิดเห็น'}
                                                                    </span>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <span className="text-sm font-medium text-glass">เหตุผล: </span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {report.reason === 'spam' ? 'สแปม' :
                                                                         report.reason === 'inappropriate' ? 'เนื้อหาไม่เหมาะสม' :
                                                                         report.reason === 'offensive' ? 'ก้าวร้าว/หยาบคาย' :
                                                                         report.reason === 'misleading' ? 'ข้อมูลเท็จ' : 'อื่นๆ'}
                                                                    </span>
                                                                </div>
                                                                {report.description && (
                                                                    <p className="text-sm text-muted-foreground mb-2">
                                                                        {report.description}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatRelativeTime(report.created_at, language)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <Flag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                <h3 className="text-lg font-medium text-glass mb-2">
                                                    ยังไม่มีการรายงาน
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    คุณยังไม่ได้รายงานเนื้อหาใดๆ
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
