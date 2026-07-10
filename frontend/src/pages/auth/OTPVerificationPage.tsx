import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

export const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const [error, setError] = useState<string | null>(null);

  const verifyOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = sessionStorage.getItem('resetEmail');
      if (!email) {
        setError("Email not found. Please go back to forgot password.");
        setLoading(false);
        return;
      }
      const otpCode = otp.join('');
      await api.post('/auth/verify-otp', { email, otp_code: otpCode });
      
      sessionStorage.setItem('resetToken', otpCode);
      
      setLoading(false);
      navigate('/reset-password');
    } catch (err: any) {
      setError('Invalid or expired OTP');
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 shadow-xl animate-fade-in w-full">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Verify Email</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">We've sent a 6-digit code to your email.</p>
      
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4 text-center">{error}</div>}

      <div className="flex justify-center gap-2 mb-8">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-${idx}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        ))}
      </div>

      <button onClick={verifyOTP} disabled={loading || otp.join('').length !== 6} className="w-full btn-primary h-10">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
      </button>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Didn't receive the code? <button className="font-medium text-brand-600 hover:text-brand-500">Resend</button>
      </p>
    </div>
  );
};
