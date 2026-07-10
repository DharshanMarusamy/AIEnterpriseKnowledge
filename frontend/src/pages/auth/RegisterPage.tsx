import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User, Briefcase, Phone, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from '@azure/msal-react';
import { useAuth } from '../../store/AuthContext';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

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
        setError(err.response?.data?.detail || 'Google authentication failed');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => setError('Google authentication was cancelled or failed.'),
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
        setError(err.message || 'Microsoft authentication failed');
      }
    } finally {
      setIsMicrosoftLoading(false);
    }
  };

  const isAnyLoading = isSubmitting || isGoogleLoading || isMicrosoftLoading;

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.fullName
      });
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during registration');
    }
  };

  return (
    <div className="glass-card p-8 shadow-xl animate-fade-in w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Create your account</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">Join the Enterprise Knowledge Platform</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input {...register('fullName')} type="text" className="input-field pl-10" placeholder="John Doe" />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-sm font-medium">ID</span>
              </div>
              <input {...register('employeeId')} type="text" className="input-field pl-10" placeholder="EMP-12345" />
            </div>
            {errors.employeeId && <p className="mt-1 text-xs text-red-500">{errors.employeeId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-slate-400" />
              </div>
              <select {...register('department')} className="input-field pl-10">
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
            <input {...register('designation')} type="text" className="input-field" placeholder="Software Engineer" />
            {errors.designation && <p className="mt-1 text-xs text-red-500">{errors.designation.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input {...register('email')} type="email" className="input-field pl-10" placeholder="you@company.com" />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-slate-400" />
              </div>
              <input {...register('phone')} type="tel" className="input-field pl-10" placeholder="+1 (555) 000-0000" />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input {...register('password')} type="password" className="input-field pl-10" placeholder="••••••••" />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input {...register('confirmPassword')} type="password" className="input-field pl-10" placeholder="••••••••" />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <input
            id="terms"
            {...register('termsAccepted')}
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-white dark:bg-slate-800 dark:border-slate-600 dark:checked:bg-brand-500"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
            I agree to the <a href="#" className="text-brand-600 hover:underline">Terms of Service</a> and <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>
          </label>
        </div>
        {errors.termsAccepted && <p className="mt-1 text-xs text-red-500">{errors.termsAccepted.message}</p>}

        <button
          type="submit"
          disabled={isAnyLoading}
          className="w-full btn-primary h-10 mt-6"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
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

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};
