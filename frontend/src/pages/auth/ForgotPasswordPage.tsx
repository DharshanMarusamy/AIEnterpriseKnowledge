import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPasswordPage: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setError(null);
    try {
      await api.post('/auth/send-otp', data);
      setSuccess(true);
      // Save email to sessionStorage so OTP page can use it
      sessionStorage.setItem('resetEmail', data.email);
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="glass-card p-8 shadow-xl animate-fade-in w-full">
      <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to login
      </Link>
      
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter your email and we'll send you an OTP to reset your password.</p>

      {success ? (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 text-center">
          <p className="mb-4">Check your email for the OTP code.</p>
          <Link to="/otp-verification" className="btn-primary w-full inline-flex justify-center">Enter OTP</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input {...register('email')} type="email" className="input-field pl-10" placeholder="you@company.com" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full btn-primary h-10">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      )}
    </div>
  );
};
