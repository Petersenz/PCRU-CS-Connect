'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit, Trash2, X, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguageStore } from '@/stores/language';
import { getRoleDisplayName, getRoleColor } from '@/lib/utils';

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    email: '',
    password: '',
    full_name: '',
    role: 's'
  });
  const [mounted, setMounted] = useState(false);
  const { t, language } = useLanguageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        email: 'student@pcru.ac.th',
        password: 'password123',
        full_name: 'ชื่อ-นามสกุล',
        role: 's'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    // Add column widths
    ws['!cols'] = [
      { wch: 30 }, // email
      { wch: 15 }, // password
      { wch: 25 }, // full_name
      { wch: 10 }  // role
    ];

    XLSX.writeFile(wb, 'user_import_template.xlsx');
    toast.success('ดาวน์โหลด Template สำเร็จ');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.error('ไฟล์ Excel ว่างเปล่า');
          return;
        }

        setImportData(jsonData);
        setShowImportModal(true);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('ไม่สามารถอ่านไฟล์ได้');
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const response = await fetch('/api/admin/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: importData })
      });

      const result = await response.json();

      if (result.success) {
        const { results } = result;
        toast.success(`Import สำเร็จ ${results.success} คน, ล้มเหลว ${results.failed} คน`);
        
        if (results.errors.length > 0) {
          console.log('Import errors:', results.errors);
        }

        setShowImportModal(false);
        setImportData([]);
        loadUsers();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setImporting(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      user_id: '',
      email: '',
      password: '',
      full_name: '',
      role: 's'
    });
    setShowModal(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      user_id: user.user_id,
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingUser ? 'แก้ไขผู้ใช้สำเร็จ' : 'เพิ่มผู้ใช้สำเร็จ');
        setShowModal(false);
        loadUsers();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (user_id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return;

    try {
      const response = await fetch(`/api/admin/users?user_id=${user_id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ลบผู้ใช้สำเร็จ');
        loadUsers();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-glass py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-glass mb-2">{t('admin.users.manage')}</h1>
            <p className="text-muted-foreground">{t('admin.users.description')}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="glass" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              {t('admin.users.downloadTemplate')}
            </Button>
            <Button variant="glass" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {t('admin.users.importUsers')}
            </Button>
            <Button variant="primary-glass" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.users.addNewUser')}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-glass">{t('admin.users.allUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-glass">{t('admin.users.userId')}</th>
                      <th className="text-left py-3 px-4 text-glass">{t('admin.users.fullName')}</th>
                      <th className="text-left py-3 px-4 text-glass">{t('admin.users.email')}</th>
                      <th className="text-left py-3 px-4 text-glass">{t('admin.users.role')}</th>
                      <th className="text-right py-3 px-4 text-glass">{t('admin.users.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.user_id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-glass">{user.user_id}</td>
                        <td className="py-3 px-4 text-glass">{user.full_name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4">
                          <span 
                            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
                            style={
                              user.role === 'a'
                                ? {
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'rgb(185, 28, 28)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                  }
                                : user.role === 't'
                                ? {
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'rgb(29, 78, 216)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                  }
                                : {
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'rgb(21, 128, 61)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                  }
                            }
                          >
                            {getRoleDisplayName(user.role, language)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleEdit(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(user.user_id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card variant="glass" className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-glass">
                    {editingUser ? t('admin.users.editUser') : t('admin.users.addNewUser')}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">{t('admin.users.userId')}</label>
                    <Input
                      variant="glass"
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      placeholder="661102064100"
                      required
                      disabled={!!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">{t('admin.users.email')}</label>
                    <Input
                      variant="glass"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@pcru.ac.th"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">
                      {t('admin.users.password')} {editingUser && (language === 'th' ? '(เว้นว่างถ้าไม่ต้องการเปลี่ยน)' : '(leave blank to keep current)')}
                    </label>
                    <Input
                      variant="glass"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required={!editingUser}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">{t('admin.users.fullName')}</label>
                    <Input
                      variant="glass"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder={language === 'th' ? 'ชื่อ-สกุล' : 'Full Name'}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">{t('admin.users.role')}</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-glass w-full"
                      required
                    >
                      <option value="s">{t('role.student')}</option>
                      <option value="t">{t('role.teacher')}</option>
                      <option value="a">{t('role.admin')}</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="button" variant="glass" className="flex-1" onClick={() => setShowModal(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" variant="primary-glass" className="flex-1">
                      {editingUser ? t('common.save') : t('common.create')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => !importing && setShowImportModal(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[80vh] overflow-auto">
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-glass flex items-center">
                      <FileSpreadsheet className="w-5 h-5 mr-2" />
                      ตรวจสอบข้อมูลก่อน Import
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => !importing && setShowImportModal(false)} disabled={importing}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      พบข้อมูล {importData.length} รายการ
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                      <p className="text-blue-800 dark:text-blue-300">
                        <strong>หมายเหตุ:</strong> ระบบจะตรวจสอบข้อมูลและข้ามรายการที่มีปัญหา
                      </p>
                      <ul className="mt-2 ml-4 list-disc text-blue-700 dark:text-blue-400">
                        <li>ต้องมี: email, password, full_name</li>
                        <li>role: s (นักศึกษา), t (อาจารย์), a (แอดมิน) - ค่าเริ่มต้น: s</li>
                        <li>อีเมลต้องไม่ซ้ำกับที่มีอยู่ในระบบ</li>
                      </ul>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-auto border border-border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-2 text-left">#</th>
                          <th className="p-2 text-left">Email</th>
                          <th className="p-2 text-left">ชื่อ-นามสกุล</th>
                          <th className="p-2 text-left">บทบาท</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 10).map((user: any, index) => (
                          <tr key={index} className="border-t border-border">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.full_name}</td>
                            <td className="p-2">{user.role || 's'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importData.length > 10 && (
                      <div className="p-2 text-center text-xs text-muted-foreground bg-muted">
                        และอีก {importData.length - 10} รายการ...
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <Button 
                      variant="glass" 
                      className="flex-1" 
                      onClick={() => setShowImportModal(false)}
                      disabled={importing}
                    >
                      ยกเลิก
                    </Button>
                    <Button 
                      variant="primary-glass" 
                      className="flex-1"
                      onClick={handleImport}
                      disabled={importing}
                    >
                      {importing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          กำลัง Import...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Import {importData.length} รายการ
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}