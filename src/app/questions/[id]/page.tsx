'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Heart, MessageSquare, User, Clock, Send, Flag, Edit2, Trash2, X, Check, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useLanguageStore } from '@/stores/language';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';

export default function QuestionDetailPage() {
  const [question, setQuestion] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportContentId, setReportContentId] = useState<string | null>(null);
  const [reportContentType, setReportContentType] = useState<'q' | 'c'>('q');
  
  // Edit states
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [deletingComment, setDeletingComment] = useState(false);
  
  // Show comments by default
  const [showComments, setShowComments] = useState(true);
  
  const { id } = useParams();
  const { t, language } = useLanguageStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (id) {
      loadQuestion();
      // Auto-load comments
      setShowComments(true);
    }
  }, [id]);

  // Real-time subscription for comments
  useEffect(() => {
    if (!supabase || !id) return;

    const channel = supabase
      .channel(`comments-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `question_id=eq.${id}`
        },
        () => {
          // Reload question (which includes comments)
          loadQuestion();
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [id]);

  useEffect(() => {
    // Increment view only once when component mounts
    if (id && mounted) {
      incrementViewCount();
    }
  }, [id, mounted]);

  const loadQuestion = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          user:users(user_id, full_name, role),
          categories:question_categories(
            category:categories(category_id, category_name)
          )
        `)
        .eq('question_id', id)
        .eq('is_visible', true)
        .single();

      if (error) throw error;

      // Count likes for this question (content_type = 'q')
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('content_id', id)
        .eq('content_type', 'q');

      // Check if current user liked
      let isLiked = false;
      if (user) {
        const { data: userLike } = await supabase
          .from('likes')
          .select('*')
          .eq('content_id', id)
          .eq('content_type', 'q')
          .eq('user_id', user.user_id)
          .single();

        isLiked = !!userLike;
      }

      data.likes_count = likesCount || 0;
      data.is_liked = isLiked;

      setQuestion(data);

      // Load comments immediately
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(user_id, full_name, role)
        `)
        .eq('question_id', id)
        .order('created_at', { ascending: true });

      // Count likes for each comment
      if (commentsData && commentsData.length > 0 && supabase) {
        const commentsWithLikes = await Promise.all(
          commentsData.map(async (comment: any) => {
            if (!supabase) return comment;
            const { count: likesCount } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('content_id', comment.comment_id)
              .eq('content_type', 'c');

            let isLiked = false;
            if (user && supabase) {
              const { data: userLike } = await supabase
                .from('likes')
                .select('*')
                .eq('content_id', comment.comment_id)
                .eq('content_type', 'c')
                .eq('user_id', user.user_id)
                .single();

              isLiked = !!userLike;
            }

            return { ...comment, likes_count: likesCount || 0, is_liked: isLiked };
          })
        );
        setComments(commentsWithLikes);
      } else {
        setComments(commentsData || []);
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast.error('ไม่พบกระทู้');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      if (!supabase || !id) return;

      // Increment view_count using RPC function
      await supabase.rpc('increment_view_count', { q_id: id });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      if (!supabase || !id) return;

      // Check if already liked (content_type = 'q' for question)
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('content_id', id)
        .eq('content_type', 'q')
        .eq('user_id', user.user_id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('content_id', id)
          .eq('content_type', 'q')
          .eq('user_id', user.user_id);

        setQuestion({ ...question, likes_count: (question.likes_count || 1) - 1 });
        toast.success('ยกเลิกถูกใจแล้ว');
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            content_id: id,
            content_type: 'q',
            user_id: user.user_id
          });

        setQuestion({ ...question, likes_count: (question.likes_count || 0) + 1 });
        toast.success('ถูกใจแล้ว');
      }

      // Reload to get updated count
      loadQuestion();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleReport = async () => {
    if (!user || !reportReason || !reportContentId) return;

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: reportContentId,
          content_type: reportContentType,
          reason: reportReason,
          description: reportDescription
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ส่งรายงานสำเร็จ');
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        setReportContentId(null);
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const openReportModal = (contentId: string, contentType: 'q' | 'c') => {
    setReportContentId(contentId);
    setReportContentType(contentType);
    setShowReportModal(true);
  };

  const handleCommentLike = async (commentId: number) => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      if (!supabase) return;

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('content_id', commentId)
        .eq('content_type', 'c')
        .eq('user_id', user.user_id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('content_id', commentId)
          .eq('content_type', 'c')
          .eq('user_id', user.user_id);

        // Update local state
        setComments(comments.map(c =>
          c.comment_id === commentId
            ? { ...c, likes_count: (c.likes_count || 1) - 1, is_liked: false }
            : c
        ));
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            content_id: commentId,
            content_type: 'c',
            user_id: user.user_id
          });

        // Update local state
        setComments(comments.map(c =>
          c.comment_id === commentId
            ? { ...c, likes_count: (c.likes_count || 0) + 1, is_liked: true }
            : c
        ));
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          question_id: id
        })
      });

      const result = await response.json();

      if (result.success) {
        setComments([...comments, result.data]);
        setNewComment('');
        toast.success('แสดงความคิดเห็นสำเร็จ');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Question
  const handleEditQuestion = () => {
    setEditTitle(question.title);
    setEditContent(question.content);
    setEditingQuestion(true);
  };

  const handleSaveQuestion = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });

      const result = await response.json();

      if (result.success) {
        setQuestion({ ...question, title: editTitle, content: editContent });
        setEditingQuestion(false);
        toast.success('แก้ไขกระทู้สำเร็จ');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Edit question error:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async () => {
    setDeletingQuestion(true);
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ลบกระทู้สำเร็จ');
        setShowDeleteModal(false);
        router.push('/');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Delete question error:', error);
      toast.error('เกิดข้อผิดพลาด');
      setShowDeleteModal(false);
    } finally {
      setDeletingQuestion(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async () => {
    if (!deletingCommentId) return;
    
    setDeletingComment(true);
    try {
      const response = await fetch(`/api/comments/${deletingCommentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ลบความคิดเห็นสำเร็จ');
        setComments(comments.filter(c => c.comment_id !== deletingCommentId));
        setShowDeleteCommentModal(false);
        setDeletingCommentId(null);
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
        setShowDeleteCommentModal(false);
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error('เกิดข้อผิดพลาด');
      setShowDeleteCommentModal(false);
    } finally {
      setDeletingComment(false);
    }
  };

  // Edit Comment
  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.comment_id);
    setEditCommentContent(comment.content);
  };

  const handleSaveComment = async (commentId: number) => {
    if (!editCommentContent.trim()) {
      toast.error('กรุณากรอกข้อมูล');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editCommentContent })
      });

      const result = await response.json();

      if (result.success) {
        setComments(comments.map(c => 
          c.comment_id === commentId ? { ...c, content: editCommentContent } : c
        ));
        setEditingCommentId(null);
        toast.success('แก้ไขความคิดเห็นสำเร็จ');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Edit comment error:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-glass rounded-2xl p-8">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="min-h-screen">
      <div className="container-glass py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {mounted ? t('common.back') : 'Back'}
        </Button>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card variant="glass" className="mb-6">
            <CardContent className="p-6">
              {/* Edit/Delete buttons for question owner */}
              {/* {user && user.user_id === question.user_id && !editingQuestion && (
                <div className="flex justify-end gap-2 mb-4">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={handleEditQuestion}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={handleDeleteQuestion}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบ
                  </Button>
                </div>
              )} */}

              {editingQuestion ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">
                      หัวข้อ
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                      className="input-glass w-full text-2xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">
                      เนื้อหา
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                      className="input-glass w-full min-h-[200px] resize-y"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary-glass"
                      size="sm"
                      onClick={handleSaveQuestion}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      บันทึก
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setEditingQuestion(false)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-glass mb-4">
                    {question.title}
                  </h1>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.categories?.map((cat: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                  >
                    {cat.category?.category_name}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{question.user?.full_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatRelativeTime(question.created_at, language)}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{question.view_count || 0}</span>
                  </div>
                </div>

                {/* Like & Report Buttons */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={handleLike}
                    className="flex items-center space-x-2"
                  >
                    <Heart className={`w-4 h-4 ${question.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{question.likes_count || 0}</span>
                  </Button>

                  {user && user.user_id === question.user_id ? (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowQuestionMenu(!showQuestionMenu)}
                        className="text-muted-foreground hover:text-glass"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      {showQuestionMenu && (
                        <div className="absolute right-0 mt-2 w-40 card-glass rounded-xl shadow-glass-xl overflow-hidden z-10">
                          <button
                            onClick={() => {
                              setEditTitle(question.title);
                              setEditContent(question.content);
                              setEditingQuestion(true);
                              setShowQuestionMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-glass hover:bg-primary-500/10 flex items-center space-x-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowQuestionMenu(false);
                              setShowDeleteModal(true);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>ลบ</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : user && (
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => openReportModal(id as string, 'q')}
                      className="flex items-center space-x-2"
                    >
                      <Flag className="w-4 h-4" />
                      <span className="hidden sm:inline">รายงาน</span>
                    </Button>
                  )}
                </div>
              </div>

                  {/* Content */}
                  <div className="prose prose-invert max-w-none">
                    <p className="text-glass whitespace-pre-wrap">{question.content}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card variant="glass">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-glass mb-6 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                ความคิดเห็น ({comments.length})
              </h2>

              {/* Comment Form */}
              {user && (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="แสดงความคิดเห็น..."
                    className="input-glass w-full min-h-[100px] resize-y mb-3"
                    required
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary-glass"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          ส่งความคิดเห็น
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div
                          key={comment.comment_id}
                          className="card-glass rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2 flex-1">
                              {/* <User className="w-4 h-4 text-muted-foreground" /> */}
                              <div>
                                <p className="text-sm font-medium text-glass">
                                  {comment.user?.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatRelativeTime(comment.created_at, language)}
                                </p>
                              </div>
                            </div>

                            {/* Edit/Delete/Report buttons */}
                            <div className="flex gap-1">
                              {user && user.user_id === comment.user_id && editingCommentId !== comment.comment_id && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditComment(comment)}
                                    className="text-muted-foreground hover:text-blue-500"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setDeletingCommentId(comment.comment_id);
                                      setShowDeleteCommentModal(true);
                                    }}
                                    className="text-muted-foreground hover:text-red-500"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              {user && user.user_id !== comment.user_id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openReportModal(comment.comment_id, 'c')}
                                  className="text-muted-foreground hover:text-red-500"
                                >
                                  <Flag className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {editingCommentId === comment.comment_id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                className="input-glass w-full min-h-[80px] resize-y"
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="primary-glass"
                                  size="sm"
                                  onClick={() => handleSaveComment(comment.comment_id)}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  บันทึก
                                </Button>
                                <Button
                                  variant="glass"
                                  size="sm"
                                  onClick={() => setEditingCommentId(null)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  ยกเลิก
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-glass whitespace-pre-wrap mb-3">
                              {comment.content}
                            </p>
                          )}

                          {/* Like Button for Comment */}
                          {user && editingCommentId !== comment.comment_id && (
                            <div className="flex items-center space-x-2 pt-2 border-t border-white/10 dark:border-gray-700/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCommentLike(comment.comment_id)}
                                className="flex items-center space-x-1 text-muted-foreground hover:text-red-500"
                              >
                                <Heart className={`w-3 h-3 ${comment.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span className="text-xs">{comment.likes_count || 0}</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    ยังไม่มีความคิดเห็น
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card variant="glass" className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-glass mb-4">
                  {reportContentType === 'q' ? 'รายงานกระทู้' : 'รายงานความคิดเห็น'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">
                      เหตุผล
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="input-glass w-full "
                      required
                    >
                      <option value="">เลือกเหตุผล</option>
                      <option value="spam">สแปม</option>
                      <option value="inappropriate">เนื้อหาไม่เหมาะสม</option>
                      <option value="offensive">ก้าวร้าว/หยาบคาย</option>
                      <option value="misleading">ข้อมูลเท็จ</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">
                      รายละเอียดเพิ่มเติม (ถ้ามี)
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      className="input-glass w-full min-h-[100px] resize-y"
                      placeholder="อธิบายปัญหาเพิ่มเติม..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="glass"
                      onClick={() => {
                        setShowReportModal(false);
                        setReportReason('');
                        setReportDescription('');
                      }}
                      className="flex-1"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      variant="primary-glass"
                      onClick={handleReport}
                      disabled={!reportReason}
                      className="flex-1"
                    >
                      ส่งรายงาน
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Question Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteQuestion}
          title="ยืนยันการลบกระทู้"
          message="คุณแน่ใจหรือไม่ที่จะลบกระทู้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
          confirmText="ลบ"
          cancelText="ยกเลิก"
          variant="danger"
          loading={deletingQuestion}
        />

        {/* Delete Comment Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteCommentModal}
          onClose={() => {
            setShowDeleteCommentModal(false);
            setDeletingCommentId(null);
          }}
          onConfirm={handleDeleteComment}
          title="ยืนยันการลบความคิดเห็น"
          message="คุณแน่ใจหรือไม่ที่จะลบความคิดเห็นนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
          confirmText="ลบ"
          cancelText="ยกเลิก"
          variant="danger"
          loading={deletingComment}
        />
      </div>
    </div>
  );
}