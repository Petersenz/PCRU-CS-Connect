import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    variant = 'warning',
    loading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const iconColors = {
        danger: 'text-red-500',
        warning: 'text-orange-500',
        info: 'text-blue-500'
    };

    const iconBgColors = {
        danger: 'bg-red-100 dark:bg-red-900/30',
        warning: 'bg-orange-100 dark:bg-orange-900/30',
        info: 'bg-blue-100 dark:bg-blue-900/30'
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    animation: 'slideUp 0.3s ease-out'
                }}
                className="w-full max-w-md"
            >
                <Card variant="glass">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-glass flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${iconBgColors[variant]}`}>
                                    <AlertTriangle className={`w-5 h-5 ${iconColors[variant]}`} />
                                </div>
                                <span>{title}</span>
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={loading}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">{message}</p>

                        <div className="flex space-x-3">
                            <Button
                                variant="glass"
                                className="flex-1"
                                onClick={onClose}
                                disabled={loading}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant="primary-glass"
                                className="flex-1"
                                onClick={onConfirm}
                                disabled={loading}
                                style={{
                                    background: variant === 'danger'
                                        ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.7) 0%, rgba(220, 38, 38, 0.7) 100%)'
                                        : undefined
                                }}
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    confirmText
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
