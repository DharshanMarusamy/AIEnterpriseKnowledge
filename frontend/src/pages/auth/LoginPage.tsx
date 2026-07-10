import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import api from '../../services/api';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { instance } = useMsal();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', data.email);
      formData.append('password', data.password);
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      login(response.data.access_token, response.data.refresh_token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError(null);
      try {
        const response = await api.post('/auth/google', {
          token: tokenResponse.access_token,
        });
        login(response.data.access_token, response.data.refresh_token, response.data.user);
        navigate('/');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Google login failed');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => setError('Google login was cancelled or failed.'),
  });

  const handleMicrosoftLogin = async () => {
    setIsMicrosoftLoading(true);
    setError(null);
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ["user.read"]
      });
      
      if (loginResponse.accessToken) {
        const response = await api.post('/auth/microsoft', {
          token: loginResponse.accessToken,
        });
        login(response.data.access_token, response.data.refresh_token, response.data.user);
        navigate('/');
      }
    } catch (err: any) {
      if (err.name !== "BrowserAuthError") { // Ignore if user simply closed the popup
        setError(err.message || 'Microsoft login failed');
      }
    } finally {
      setIsMicrosoftLoading(false);
    }
  };

  const isAnyLoading = isSubmitting || isGoogleLoading || isMicrosoftLoading;

  return (
    <div className="glass-card p-8 shadow-xl animate-fade-in w-full">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Welcome Back</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">Sign in to access your Enterprise Knowledge Assistant</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              {...register('email')}
              type="email"
              className="input-field pl-10"
              placeholder="you@company.com"
              disabled={isAnyLoading}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              {...register('password')}
              type="password"
              className="input-field pl-10"
              placeholder="••••••••"
              disabled={isAnyLoading}
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              {...register('rememberMe')}
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-white dark:bg-slate-800 dark:border-slate-600 dark:checked:bg-brand-500"
              disabled={isAnyLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
              Forgot your password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isAnyLoading}
          className="w-full btn-primary h-10"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button 
            type="button" 
            className="btn-secondary h-10 w-full flex items-center justify-center gap-2"
            onClick={() => handleGoogleLogin()}
            disabled={isAnyLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            ) : (
              <>
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                  <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                </svg>
                Google
              </>
            )}
          </button>
          <button 
            type="button" 
            className="btn-secondary h-10 w-full flex items-center justify-center gap-2"
            onClick={handleMicrosoftLogin}
            disabled={isAnyLoading}
          >
            {isMicrosoftLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            ) : (
              <>
                <svg className="h-5 w-5 text-[#00a4ef]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
                Microsoft
              </>
            )}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">
          Register now
        </Link>
      </p>
    </div>
  );
};
