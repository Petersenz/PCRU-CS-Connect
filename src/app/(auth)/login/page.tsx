'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';

const MotionDiv = motion.div as any;

export default function LoginPage() {
  const [formData, setFormData] = useState({
    user_id: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  const { setUser, setLoading } = useAuthStore();
  const { t } = useLanguageStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setUser(result.user);
        toast.success('เข้าสู่ระบบสำเร็จ');
        router.push('/');
      } else {
        toast.error(result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t('auth.reset.success'));
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        toast.error(result.error || t('auth.reset.error'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {!showForgotPassword ? (
          <Card className="shadow-glass-xl bg-white/10 backdrop-blur-md border border-white/20">
            <CardHeader className="text-center">
              <MotionDiv
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <img 
                  src="/logo.png" 
                  alt="PCRU CS Logo" 
                  className="w-20 h-20 object-contain mx-auto drop-shadow-lg"
                />
              </MotionDiv>
              <CardTitle className="text-2xl font-bold text-glass">
                {mounted ? t('auth.login.title') : 'Login'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {mounted ? t('auth.login.subtitle') : 'Sign in to your account'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-glass">
                    {mounted ? t('auth.login.userId') : 'User ID'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      variant="glass"
                      type="text"
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      placeholder=""
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-glass">
                    {mounted ? t('auth.login.password') : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      variant="glass"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder=""
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    {mounted ? t('auth.login.forgotPassword') : 'Forgot password?'}
                  </button>
                </div> */}

                <Button
                  type="submit"
                  variant="primary-glass"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mounted ? t('auth.login.submit') : 'Login'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card variant="glass" className="shadow-glass-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-glass">
                {mounted ? t('auth.reset.title') : 'Reset Password'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {mounted ? t('auth.reset.subtitle') : 'Enter your email to reset password'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-glass">
                    {mounted ? t('auth.reset.email') : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      variant="glass"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="example@pcru.ac.th"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="glass"
                    className="flex-1"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    {mounted ? t('common.back') : 'Back'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary-glass"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      mounted ? t('auth.reset.submit') : 'Submit'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </MotionDiv>
    </div>
  );
}