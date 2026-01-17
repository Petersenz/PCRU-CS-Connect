'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  User,
  ArrowUpDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { useLanguageStore } from '@/stores/language';
import { useAuthStore } from '@/stores/auth';
import { formatRelativeTime, truncateText } from '@/lib/utils';

import { db, supabase } from '@/lib/supabase';

type SortBy = 'latest' | 'oldest' | 'popular' | 'views';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [questions, setQuestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { t, language } = useLanguageStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load data from database with pagination and filters
  useEffect(() => {
    loadData();
  }, [currentPage, sortBy, searchTerm, selectedCategory]);

  // Load categories once
  useEffect(() => {
    loadCategories();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('questions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        () => {
          // Reload data when questions change
          loadData();
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentPage, sortBy, searchTerm, selectedCategory]);

  const loadCategories = async () => {
    try {
      const categoriesData = await db.getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Find category ID if category name is selected
      let categoryId = undefined;
      if (selectedCategory) {
        const category = categories.find(c => c.category_name === selectedCategory);
        categoryId = category?.category_id;
      }

      const result = await db.getQuestions({
        limit: 10,
        page: currentPage,
        search: searchTerm || undefined,
        category_id: categoryId,
        sortBy
      });

      // Count likes and comments for each question
      if (result.data && result.data.length > 0 && supabase) {
        const questionsWithCounts = await Promise.all(
          result.data.map(async (q: any) => {
            if (!supabase) return q;
            const [
              { count: likesCount },
              { count: commentsCount }
            ] = await Promise.all([
              supabase.from('likes').select('*', { count: 'exact', head: true }).eq('content_id', q.question_id).eq('content_type', 'q'),
              supabase.from('comments').select('*', { count: 'exact', head: true }).eq('question_id', q.question_id)
            ]);
            return { ...q, likes_count: likesCount || 0, comments_count: commentsCount || 0 };
          })
        );
        setQuestions(questionsWithCounts);
      } else {
        setQuestions(result.data || []);
      }

      setTotalPages(result.totalPages);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (value: SortBy) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page
  };



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
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 } as any}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <img 
              src="/logo.png" 
              alt="PCRU CS Logo" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto drop-shadow-2xl"
            />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold text-glass my-4">
            <span className="bg-linear-to-b from-orange-500 to-orange-500 bg-clip-text text-transparent">
              {mounted ? t('app.title') : 'PCRU CS CONNECT'}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {mounted ? t('app.description') : 'Connect and Share Computer Science Knowledge'}
          </p>

          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link href="/create">
                <Button variant="primary-glass" size="lg" className="mr-4">
                  <Plus className="w-5 h-5 mr-2" />
                  {mounted ? t('questions.create') : 'Create Question'}
                </Button>
              </Link>

              <Link href="/popular">
                <Button variant="glass" size="lg">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {mounted ? t('nav.popular') : 'Popular'}
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card variant="glass" className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-glass mb-2">
                    {mounted ? t('common.search') : 'Search'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      variant="glass"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder={mounted ? t('questions.search.placeholder') : 'Search questions...'}
                      className="pl-10 pr-10 h-[48px]"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-glass mb-2">
                    {mounted ? t('questions.filter.category') : 'Category'}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="input-glass w-full "
                  >
                    <option value="">{mounted ? t('questions.filter.all') : 'All Categories'}</option>
                    {categories.map((category: any) => (
                      <option key={category.category_id} value={category.category_name} className='text-gray-800'>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-glass mb-2">
                    <ArrowUpDown className="w-4 h-4 inline mr-2" />
                    {mounted ? t('home.sortBy') : 'Sort by'}
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortBy)}
                    className="input-glass w-full"
                  >
                    <option className='text-gray-700'value="latest">{mounted ? t('home.latest') : 'Latest'}</option>
                    <option className='text-gray-700'value="oldest">{mounted ? t('home.oldest') : 'Oldest'}</option>
                    <option className='text-gray-700'value="views">{mounted ? t('home.mostViewed') : 'Most Viewed'}</option>
                    <option className='text-gray-700'value="popular">{mounted ? t('home.popular') : 'Popular'}</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Results count */}
          {!loading && (
            <div className="text-sm text-muted-foreground mb-4">
              {mounted ? `${t('home.found')} ${totalCount} ${t('home.questions')}` : `Found ${totalCount} questions`}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="card-glass rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-glass">{mounted ? t('common.loading') : 'Loading...'}</p>
              </div>
            </div>
          ) : questions.length > 0 ? (
            <>
              {questions.map((question: any, index: number) => (
              <motion.div
                key={question.question_id}
                variants={itemVariants}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="hover-glass" className="group">
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
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>{question.view_count || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>{question.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span>{question.comments_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              ))}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-8"
              />
            </>
          ) : (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <div className="card-glass rounded-2xl p-8 max-w-md mx-auto">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-glass mb-2">
                  {mounted ? t('questions.empty') : 'No questions found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {mounted ? t('questions.empty.description') : 'Be the first to ask a question'}
                </p>
                {user && (
                  <Link href="/create">
                    <Button variant="primary-glass">
                      <Plus className="w-4 h-4 mr-2" />
                      {mounted ? t('questions.create') : 'Create Question'}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}