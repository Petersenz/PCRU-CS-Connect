import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please check your .env.local file.');
}

// Client-side Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : null;

// Database helper functions
export const db = {
  // Users
  async getUsers() {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserById(userId: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('users')
      .select('user_id, email, password, full_name, role, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Categories
  async getCategories() {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_name');

    if (error) throw error;
    return data;
  },

  // Questions
  async getQuestions(filters?: {
    search?: string;
    category_id?: string;
    user_id?: string;
    limit?: number;
    page?: number;
    sortBy?: 'latest' | 'oldest' | 'popular' | 'views';
  }) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const limit = filters?.limit || 10;
    const page = filters?.page || 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('questions')
      .select(`
        *,
        user:users(user_id, full_name, role),
        categories:question_categories(
          category:categories(category_id, category_name)
        )
      `, { count: 'exact' })
      .eq('is_visible', true);

    // Search filter
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Category filter
    if (filters?.category_id) {
      const { data: categoryQuestions } = await supabase
        .from('question_categories')
        .select('question_id')
        .eq('category_id', filters.category_id);

      if (categoryQuestions && categoryQuestions.length > 0) {
        const questionIds = categoryQuestions.map(cq => cq.question_id);
        query = query.in('question_id', questionIds);
      } else {
        // No questions in this category, return empty
        return { data: [], count: 0, totalPages: 0 };
      }
    }

    // User filter
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    // Sorting
    switch (filters?.sortBy) {
      case 'latest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'views':
        query = query.order('view_count', { ascending: false, nullsFirst: false });
        break;
      case 'popular':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0, totalPages: Math.ceil((count || 0) / limit) };
  },

  async getQuestionById(questionId: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        user:users(user_id, full_name, role),
        categories:question_categories(
          category:categories(category_id, category_name)
        ),
        comments(
          *,
          user:users(user_id, full_name, role)
        )
      `)
      .eq('question_id', questionId)
      .eq('is_visible', true)
      .single();

    if (error) throw error;
    return data;
  },

  // Comments
  async getCommentsByQuestionId(questionId: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(user_id, full_name, role)
      `)
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Likes
  async getLikesCount(contentId: string, contentType: 'q' | 'c') {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_id', contentId)
      .eq('content_type', contentType);

    if (error) throw error;
    return count || 0;
  },

  async isLiked(userId: string, contentId: string, contentType: 'q' | 'c') {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('likes')
      .select('like_id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single();

    return !error && data;
  },

  // Reports
  async getReports(resolved?: boolean) {
    if (!supabase) throw new Error('Supabase client not initialized');

    let query = supabase
      .from('reports')
      .select(`
        *,
        user:users(user_id, full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (typeof resolved === 'boolean') {
      query = query.eq('is_resolved', resolved);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Statistics
  async getStatistics() {
    // Use admin client for statistics to bypass RLS
    const client = supabaseAdmin || supabase;
    if (!client) throw new Error('Supabase client not initialized');

    const [
      usersCount,
      questionsCount,
      commentsCount,
      reportsCount
    ] = await Promise.all([
      client.from('users').select('*', { count: 'exact', head: true }),
      client.from('questions').select('*', { count: 'exact', head: true }).eq('is_visible', true),
      client.from('comments').select('*', { count: 'exact', head: true }),
      client.from('reports').select('*', { count: 'exact', head: true }).eq('is_resolved', false)
    ]);

    return {
      total_users: usersCount.count || 0,
      total_questions: questionsCount.count || 0,
      total_comments: commentsCount.count || 0,
      pending_reports: reportsCount.count || 0
    };
  },

  // Delete question (soft delete)
  async deleteQuestion(questionId: string, userId: string) {
    const client = supabaseAdmin || supabase;
    if (!client) throw new Error('Supabase client not initialized');

    // Check ownership
    const { data: question, error: fetchError } = await client
      .from('questions')
      .select('user_id, question_id')
      .eq('question_id', questionId)
      .single();

    console.log('Delete question check:', { 
      questionId, 
      userId, 
      questionUserId: question?.user_id,
      match: question?.user_id === userId,
      fetchError 
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if (String(question.user_id) !== String(userId)) {
      throw new Error('Unauthorized');
    }

    // Soft delete - use the question_id from the fetched question
    const { error } = await client
      .from('questions')
      .update({ is_visible: false })
      .eq('question_id', question.question_id);

    console.log('Delete result:', { error });

    if (error) throw error;
    return { success: true };
  },

  // Delete comment
  async deleteComment(commentId: number, userId: string) {
    const client = supabaseAdmin || supabase;
    if (!client) throw new Error('Supabase client not initialized');

    // Check ownership
    const { data: comment, error: fetchError } = await client
      .from('comments')
      .select('user_id, comment_id')
      .eq('comment_id', commentId)
      .single();

    console.log('Delete comment check:', { 
      commentId, 
      userId, 
      commentUserId: comment?.user_id,
      match: comment?.user_id === userId,
      fetchError 
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (String(comment.user_id) !== String(userId)) {
      throw new Error('Unauthorized');
    }

    // Delete - use the comment_id from the fetched comment
    const { error } = await client
      .from('comments')
      .delete()
      .eq('comment_id', comment.comment_id);

    console.log('Delete result:', { error });

    if (error) throw error;
    return { success: true };
  },

  // Update question
  async updateQuestion(questionId: string, userId: string, updates: { title?: string; content?: string }) {
    const client = supabaseAdmin || supabase;
    if (!client) throw new Error('Supabase client not initialized');

    // Check ownership
    const { data: question, error: fetchError } = await client
      .from('questions')
      .select('user_id, question_id')
      .eq('question_id', questionId)
      .single();

    console.log('Update question check:', { 
      questionId, 
      userId, 
      questionUserId: question?.user_id,
      match: question?.user_id === userId,
      fetchError 
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if (String(question.user_id) !== String(userId)) {
      throw new Error('Unauthorized');
    }

    // Update - use the question_id from the fetched question to ensure correct type
    const { error } = await client
      .from('questions')
      .update(updates)
      .eq('question_id', question.question_id);

    console.log('Update result:', { error });

    if (error) throw error;

    // Fetch updated data
    const { data: updatedQuestion } = await client
      .from('questions')
      .select('*')
      .eq('question_id', question.question_id)
      .single();

    return updatedQuestion;
  },

  // Update comment
  async updateComment(commentId: number, userId: string, content: string) {
    const client = supabaseAdmin || supabase;
    if (!client) throw new Error('Supabase client not initialized');

    // Check ownership
    const { data: comment, error: fetchError } = await client
      .from('comments')
      .select('user_id, comment_id')
      .eq('comment_id', commentId)
      .single();

    console.log('Update comment check:', { 
      commentId, 
      userId, 
      commentUserId: comment?.user_id,
      match: comment?.user_id === userId,
      fetchError 
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (String(comment.user_id) !== String(userId)) {
      throw new Error('Unauthorized');
    }

    // Update - use the comment_id from the fetched comment to ensure correct type
    const { error } = await client
      .from('comments')
      .update({ content })
      .eq('comment_id', comment.comment_id);

    console.log('Update result:', { error });

    if (error) throw error;

    // Fetch updated data
    const { data: updatedComment } = await client
      .from('comments')
      .select('*')
      .eq('comment_id', comment.comment_id)
      .single();

    return updatedComment;
  },
};