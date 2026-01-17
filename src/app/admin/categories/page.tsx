'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useLanguageStore } from '@/stores/language';

export default function CategoriesManagement() {
  const { t } = useLanguageStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setShowModal(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.category_name);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const body = editingCategory
        ? { category_id: editingCategory.category_id, category_name: categoryName }
        : { category_name: categoryName };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingCategory ? 'แก้ไขหมวดหมู่สำเร็จ' : 'เพิ่มหมวดหมู่สำเร็จ');
        setShowModal(false);
        loadCategories();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteClick = (category: any) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories?category_id=${deletingCategory.category_id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'ลบหมวดหมู่สำเร็จ');
        setShowDeleteModal(false);
        setDeletingCategory(null);
        loadCategories();
      } else {
        // Show specific error message if category is in use
        if (result.inUse) {
          toast.error(result.error, { duration: 5000 });
        } else {
          toast.error(result.error || 'เกิดข้อผิดพลาด');
        }
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('เกิดข้อผิดพลาด');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-glass py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-glass mb-2">{t('admin.categories.title')}</h1>
            <p className="text-muted-foreground">{t('admin.dashboard.manageCategories.desc')}</p>
          </div>
          <Button variant="primary-glass" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.categories.addNew')}
          </Button>
        </div>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-glass">{t('admin.categories.allCategories')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.category_id} variant="hover-glass">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-glass">{category.category_name}</h3>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(category)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setShowModal(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-glass">
                      {editingCategory ? t('admin.categories.editCategory') : t('admin.categories.addNew')}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-glass mb-2">{t('admin.categories.categoryName')}</label>
                      <Input
                        variant="glass"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder={t('admin.categories.categoryNamePlaceholder')}
                        required
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button type="button" variant="glass" className="flex-1" onClick={() => setShowModal(false)}>
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" variant="primary-glass" className="flex-1">
                        {editingCategory ? t('common.save') : t('common.create')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingCategory(null);
          }}
          onConfirm={handleDeleteConfirm}
          title={t('admin.categories.deleteConfirm')}
          message={t('admin.categories.deleteMessage').replace('{name}', deletingCategory?.category_name || '')}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          variant="danger"
          loading={deleting}
        />
      </div>
    </div>
  );
}