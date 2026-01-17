'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Trash2, Search, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguageStore } from '@/stores/language';

export default function ProfanityManagement() {
  const [words, setWords] = useState<string[]>([]);
  const [filteredWords, setFilteredWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [stats, setStats] = useState({ count: 0, version: '', lastUpdated: '' });
  const { t } = useLanguageStore();

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredWords(
        words.filter(word => 
          word.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredWords(words);
    }
  }, [searchTerm, words]);

  const loadWords = async () => {
    try {
      const response = await fetch('/api/admin/profanity');
      const result = await response.json();
      
      if (result.success) {
        setWords(result.data.words);
        setFilteredWords(result.data.words);
        setStats({
          count: result.data.count,
          version: result.data.version,
          lastUpdated: result.data.lastUpdated
        });
      }
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      toast.error('กรุณากรอกคำที่ต้องการเพิ่ม');
      return;
    }

    try {
      const response = await fetch('/api/admin/profanity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord.trim() })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('เพิ่มคำสำเร็จ');
        setNewWord('');
        setShowAddModal(false);
        loadWords();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error adding word:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteWord = async (word: string) => {
    if (!confirm(`ยืนยันการลบคำ "${word}"?`)) return;

    try {
      const response = await fetch(`/api/admin/profanity?word=${encodeURIComponent(word)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('ลบคำสำเร็จ');
        loadWords();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-glass py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-glass">จัดการคำหยาบคาย</h1>
              <p className="text-muted-foreground">ระบบตรวจสอบและกรองคำไม่สุภาพ</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">จำนวนคำทั้งหมด</p>
                    <p className="text-2xl font-bold text-glass">{stats.count}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground">เวอร์ชัน</p>
                  <p className="text-lg font-semibold text-glass">{stats.version}</p>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground">อัปเดตล่าสุด</p>
                  <p className="text-lg font-semibold text-glass">{stats.lastUpdated}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Add */}
        <Card variant="glass" className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  variant="glass"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาคำ..."
                  className="pl-10"
                />
              </div>
              <Button variant="primary-glass" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มคำใหม่
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Words List */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-glass">
              รายการคำทั้งหมด ({filteredWords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredWords.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredWords.map((word, index) => (
                  <motion.div
                    key={word}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="card-glass rounded-lg p-3 flex items-center justify-between group hover:border-red-500/30"
                  >
                    <span className="text-glass font-medium blur-sm group-hover:blur-none transition-all">
                      {word}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWord(word)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-glass mb-2">
                  ไม่พบคำที่ค้นหา
                </h3>
                <p className="text-muted-foreground">
                  ลองค้นหาด้วยคำอื่น
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <Card variant="glass" className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-glass">เพิ่มคำใหม่</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-glass mb-2">
                      คำที่ต้องการเพิ่ม
                    </label>
                    <Input
                      variant="glass"
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="กรอกคำที่ต้องการเพิ่ม"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddWord();
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      * ระบบจะแปลงเป็นตัวพิมพ์เล็กและตัดช่องว่างอัตโนมัติ
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="glass"
                      className="flex-1"
                      onClick={() => setShowAddModal(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      variant="primary-glass"
                      className="flex-1"
                      onClick={handleAddWord}
                    >
                      เพิ่ม
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Warning Notice */}
        <Card variant="glass" className="mt-6 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-glass mb-1">คำเตือน:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>ระบบจะตรวจสอบคำเหล่านี้ในทุกกระทู้และความคิดเห็น</li>
                  <li>การเพิ่มหรือลบคำจะมีผลทันที</li>
                  <li>ควรตรวจสอบให้แน่ใจก่อนเพิ่มคำใหม่</li>
                  <li>คำที่เพิ่มจะถูกแปลงเป็นตัวพิมพ์เล็กอัตโนมัติ</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
