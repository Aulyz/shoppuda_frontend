import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { EnvelopeIcon, ArrowLeftIcon, KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'token' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 이메일로 토큰 발송
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.resetPassword({ email });
      
      if (response.status || response.success) {
        setStep('token');
        toast.success('인증 코드가 이메일로 발송되었습니다.');
      } else {
        toast.error(response.message || '이메일 발송에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('비밀번호 재설정 요청 실패:', error);
      
      if (error?.response?.status === 404) {
        toast.error('비밀번호 재설정 기능이 현재 준비 중입니다. 관리자에게 문의해주세요.');
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('비밀번호 재설정 기능이 현재 준비 중입니다. 관리자에게 문의해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰 확인 및 비밀번호 재설정
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!token) {
      toast.error('인증 코드를 입력해주세요.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.resetPasswordConfirm({
        email,
        token,
        new_password: newPassword
      });

      if (response.status || response.success) {
        toast.success('비밀번호가 성공적으로 변경되었습니다.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(response.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('비밀번호 재설정 실패:', error);
      
      if (error?.response?.status === 400) {
        toast.error('잘못된 인증 코드입니다.');
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('비밀번호 변경에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mb-4">
            {step === 'email' && <EnvelopeIcon className="w-8 h-8 text-white" />}
            {step === 'token' && <KeyIcon className="w-8 h-8 text-white" />}
            {step === 'reset' && <LockClosedIcon className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
            비밀번호 찾기
          </h2>
          <p className="text-gray-600">
            {step === 'email' && '가입하신 이메일로 인증 코드를 보내드립니다.'}
            {step === 'token' && '이메일로 받은 인증 코드를 입력해주세요.'}
            {step === 'reset' && '새로운 비밀번호를 설정해주세요.'}
          </p>
        </div>

        {/* 단계 표시 */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'email' ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${
            step !== 'email' ? 'bg-orange-500' : 'bg-gray-300'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'token' ? 'bg-orange-500 text-white' : step === 'reset' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${
            step === 'reset' ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'reset' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
          }`}>
            3
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: 이메일 입력 */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold py-3 rounded-lg hover:from-orange-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    발송 중...
                  </div>
                ) : (
                  '인증 코드 받기'
                )}
              </button>
            </form>
          )}

          {/* Step 2: 토큰 입력 및 새 비밀번호 설정 */}
          {(step === 'token' || step === 'reset') && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {/* 이메일 표시 */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  인증 코드 발송: <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              {/* 토큰 입력 */}
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  인증 코드
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  placeholder="6자리 인증 코드"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isLoading}
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">
                  이메일로 받은 6자리 코드를 입력해주세요.
                </p>
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                    placeholder="8자 이상 입력"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                    placeholder="비밀번호를 다시 입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !token || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold py-3 rounded-lg hover:from-orange-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    처리 중...
                  </div>
                ) : (
                  '비밀번호 변경'
                )}
              </button>

              {/* 인증 코드 재발송 */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setToken('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                >
                  인증 코드를 받지 못하셨나요? 다시 받기
                </button>
              </div>
            </form>
          )}

          {/* 하단 링크 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link 
                to="/login" 
                className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                로그인으로 돌아가기
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                to="/signup" 
                className="text-gray-600 hover:text-orange-600 transition-colors"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>

        {/* 도움말 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            도움이 필요하신가요?{' '}
            <Link to="/support" className="text-orange-600 hover:text-orange-700 font-medium">
              고객센터
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;