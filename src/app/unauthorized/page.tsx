'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguageStore } from '@/stores/language';

export default function UnauthorizedPage() {
  const { t } = useLanguageStore();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card variant="glass" className="shadow-glass-xl text-center">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>

            <h1 className="text-2xl font-bold text-glass mb-4">
              {t('error.unauthorized')}
            </h1>
            
            <p className="text-muted-foreground mb-8">
              {t('unauthorized.message')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="glass"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.back')}
              </Button>
              
              <Link href="/" className="flex-1">
                <Button variant="primary-glass" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  {t('nav.home')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}