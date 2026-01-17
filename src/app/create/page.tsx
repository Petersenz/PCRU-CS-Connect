'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguageStore } from '@/stores/language';
import { useAuthStore } from '@/stores/auth';


export default function CreateQuestionPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check authentication
    if (!user) {
      router.push('/login');
      return;
    }
    loadCategories();
  }, [user, router]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('กรุณาเลือกหมวดหมู่อย่างน้อย 1 หมวดหมู่');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category_ids: selectedCategories
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('สร้างกระทู้สำเร็จ');
        router.push('/');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Create question error:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-glass py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {mounted ? t('common.back') : 'Back'}
          </Button>

          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-2xl text-glass">
                {mounted ? t('questions.create.title') : 'Create Question'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-glass mb-2">
                    {mounted ? t('questions.create.form.title') : 'Title'}
                  </label>
                  <Input
                    variant="glass"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={mounted ? t('questions.create.form.title.placeholder') : 'Enter question title'}
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-glass mb-2">
                    {mounted ? t('questions.create.form.content') : 'Content'}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={mounted ? t('questions.create.form.content.placeholder') : 'Enter question details'}
                    className="input-glass w-full min-h-[200px] resize-y"
                    required
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-glass mb-2">
                    {mounted ? t('questions.create.form.categories') : 'Categories'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.category_id);
                      return (
                        <button
                          key={category.category_id}
                          type="button"
                          onClick={() => toggleCategory(category.category_id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            isSelected
                              ? 'text-white border border-primary-400/50 shadow-lg'
                              : 'text-glass border border-white/20 dark:border-white/10 hover:border-white/30'
                          }`}
                          style={
                            isSelected
                              ? {
                                  backdropFilter: 'blur(12px) saturate(180%)',
                                  background: 'linear-gradient(135deg, rgba(255, 107, 26, 0.9) 0%, rgba(234, 88, 12, 0.95) 100%)',
                                  boxShadow: '0 10px 25px -5px rgba(255, 107, 26, 0.3)',
                                }
                              : {
                                  backdropFilter: 'blur(8px)',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                }
                          }
                        >
                          {category.category_name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="glass"
                    onClick={() => router.back()}
                  >
                    {mounted ? t('common.cancel') : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary-glass"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        {mounted ? t('questions.create.submit') : 'Create'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}