import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Loader2 } from 'lucide-react';
import api from '../../services/api';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError(null);
    try {
      const token = sessionStorage.getItem('resetToken');
      if (!token) {
        setError('Reset session expired. Please request a new code.');
        return;
      }
      await api.post('/auth/reset-password', {
        token: token,
        new_password: data.password
      });
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('resetEmail');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="glass-card p-8 shadow-xl animate-fade-in w-full">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Set New Password</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">Please enter your new password below.</p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input {...register('password')} type="password" className="input-field pl-10" placeholder="••••••••" />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input {...register('confirmPassword')} type="password" className="input-field pl-10" placeholder="••••••••" />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full btn-primary h-10 mt-6">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};
