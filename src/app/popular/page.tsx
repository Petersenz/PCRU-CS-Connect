'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Heart, MessageSquare, User, Clock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { useLanguageStore } from '@/stores/language';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime, truncateText } from '@/lib/utils';

export default function PopularPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'views' | 'comments' | 'trending' | 'likes'>('views');
  const { t, language } = useLanguageStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadPopularQuestions();
  }, [activeTab]);

  const loadPopularQuestions = async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      let data: any[] = [];

      if (activeTab === 'views') {
        // Most viewed
        const { data: questionsData, error } = await supabase
          .from('questions')
          .select(`
            *,
            user:users(user_id, full_name, role),
            categories:question_categories(
              category:categories(category_id, category_name)
            )
          `)
          .eq('is_visible', true)
          .order('view_count', { ascending: false })
          .limit(20);

        if (error) throw error;

        // Add likes and comments count
        if (questionsData && supabase) {
          const supabaseClient = supabase;
          const enrichedData = await Promise.all(
            questionsData.map(async (q: any) => {
              const [likesResult, commentsResult] = await Promise.all([
                supabaseClient.from('likes').select('*', { count: 'exact', head: true }).eq('content_id', q.question_id).eq('content_type', 'q'),
                supabaseClient.from('comments').select('*', { count: 'exact', head: true }).eq('question_id', q.question_id)
              ]);
              
              return { 
                ...q, 
                likes_count: likesResult.count || 0,
                comments_count: commentsResult.count || 0 
              };
            })
          );
          data = enrichedData;
        } else {
          data = questionsData || [];
        }

      } else if (activeTab === 'comments') {
        // Most commented
        const { data: questionsData, error } = await supabase
          .from('questions')
          .select(`
            *,
            user:users(user_id, full_name, role),
            categories:question_categories(
              category:categories(category_id, category_name)
            )
          `)
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (questionsData && supabase) {
          // Count comments and likes for each question
          const supabaseClient = supabase;
          const questionsWithComments = await Promise.all(
            questionsData.map(async (q: any) => {
              const [likesResult, commentsResult] = await Promise.all([
                supabaseClient.from('likes').select('*', { count: 'exact', head: true }).eq('content_id', q.question_id).eq('content_type', 'q'),
                supabaseClient.from('comments').select('*', { count: 'exact', head: true }).eq('question_id', q.question_id)
              ]);
              
              return { 
                ...q, 
                likes_count: likesResult.count || 0,
                comments_count: commentsResult.count || 0 
              };
            })
          );
          
          // Sort by comments count and take top 20
          data = questionsWithComments
            .sort((a, b) => b.comments_count - a.comments_count)
            .slice(0, 20);
        }

      } else if (activeTab === 'trending') {
        // Trending - based on views + likes
        const { data: questionsData, error } = await supabase
          .from('questions')
          .select(`
            *,
            user:users(user_id, full_name, role),
            categories:question_categories(
              category:categories(category_id, category_name)
            )
          `)
          .eq('is_visible', true)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (questionsData && supabase) {
          // Calculate trending score (views + likes * 2)
          const supabaseClient = supabase;
          const questionsWithScore = await Promise.all(
            questionsData.map(async (q: any) => {
              const { count: likesCount } = await supabaseClient
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('content_id', q.question_id)
                .eq('content_type', 'q');
              
              const { count: commentsCount } = await supabaseClient
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('question_id', q.question_id);
              
              const trendingScore = (q.view_count || 0) + (likesCount || 0) * 2;
              return { 
                ...q, 
                trending_score: trendingScore,
                likes_count: likesCount || 0,
                comments_count: commentsCount || 0
              };
            })
          );
          
          // Sort by trending score
          data = questionsWithScore
            .sort((a, b) => b.trending_score - a.trending_score)
            .slice(0, 20);
        }
      } else if (activeTab === 'likes') {
        // Most liked - use API
        const response = await fetch('/api/popular/most-liked?type=questions');
        const result = await response.json();
        
        if (result.success) {
          const questionsData = result.data.questions || [];
          
          // Add comments count if not already present
          if (questionsData.length > 0 && supabase) {
            const supabaseClient = supabase;
            const enrichedData = await Promise.all(
              questionsData.map(async (q: any) => {
                // If comments_count not present, fetch it
                if (q.comments_count === undefined) {
                  const { count } = await supabaseClient
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('question_id', q.question_id);
                  
                  return { ...q, comments_count: count || 0, likes_count: q.likes || 0 };
                }
                return { ...q, likes_count: q.likes || 0 };
              })
            );
            data = enrichedData;
          } else {
            data = questionsData.map((q: any) => ({ ...q, likes_count: q.likes || 0 }));
          }
        }
      }

      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading popular questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 text-primary-500 mr-3" />
            <h1 className="text-3xl font-bold text-glass">
              {t('nav.popular')}
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b border-white/20 dark:border-gray-700/50">
            <button
              onClick={() => setActiveTab('views')}
              className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${
                activeTab === 'views'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-muted-foreground hover:text-glass hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{t('popular.mostViewed')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${
                activeTab === 'comments'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-muted-foreground hover:text-glass hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>{t('popular.mostCommented')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${
                activeTab === 'likes'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-muted-foreground hover:text-glass hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>{t('popular.mostLiked')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`pb-3 px-4 font-medium text-sm transition-all border-b-2 ${
                activeTab === 'trending'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-muted-foreground hover:text-glass hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>{t('popular.trending')}</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Questions List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="card-glass rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-glass">{t('common.loading')}</p>
              </div>
            </div>
          ) : questions.length > 0 ? (
            questions.map((question: any, index: number) => (
              <motion.div
                key={question.question_id}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  variant="hover-glass" 
                  className={`group ${activeTab === 'trending' && index < 3 ? 'trending-card' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link
                          href={`/questions/${question.question_id}`}
                          className="block"
                        >
                          <h3 className="text-xl font-semibold text-glass group-hover:text-primary-600 transition-colors mb-2">
                            {question.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2">
                            {truncateText(question.content, 200)}
                          </p>
                        </Link>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className={`
                          flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                          ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' : 
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-md' : 
                            index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-md' : 
                            'bg-gradient-to-br from-primary-400 to-primary-500 text-white'}
                        `}>
                          #{index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.categories?.map((cat: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                        >
                          {cat.category?.category_name || cat.category_name}
                        </span>
                      ))}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>{question.user?.full_name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatRelativeTime(question.created_at, language)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center font-semibold text-primary-600">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>{question.view_count || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>{question.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span>{question.comments_count || question.comments?.length || 0}</span>
                        </div>
                        {activeTab === 'trending' && question.trending_score !== undefined && (
                          <div className="flex items-center">
                            <span className="trending-badge">
                              <span className="trending-fire">🔥</span> {question.trending_score}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="card-glass rounded-2xl p-8 max-w-md mx-auto">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-glass mb-2">
                  {t('popular.noPopular')}
                </h3>
                <p className="text-muted-foreground">
                  {t('popular.noPopularDesc')}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}