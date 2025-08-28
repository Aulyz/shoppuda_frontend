import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';


function SignUp() {
  const navigate = useNavigate();

  // 현재 단계 관리 (1: 기본정보, 2: 약관동의)
  const [step, setStep] = useState(1);

  // 폼 데이터 상태 (API 스펙에 맞게 간소화)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    agree_terms: false,
    agree_privacy: false,
  });

  // 에러 상태
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 아이디 중복 확인 상태
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckResult, setIdCheckResult] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);

  // 전체 동의 체크
  const handleAllAgree = () => {
    setFormData((prev) => ({
      ...prev,
      agree_terms: !prev.agree_terms,
      agree_privacy: !prev.agree_privacy,
    }));
  };

  // 유효성 검사 함수 (기본 정보만)
  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.username) newErrors.username = '아이디는 필수입니다.';
    else if (formData.username.length < 3) newErrors.username = '아이디는 3자 이상이어야 합니다.';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = '아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.';
    if (!formData.email) newErrors.email = '이메일은 필수입니다.';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = '올바른 이메일 형식이 아닙니다.';
    if (!formData.password) newErrors.password = '비밀번호는 필수입니다.';
    else if (formData.password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!formData.password2) newErrors.password2 = '비밀번호 확인은 필수입니다.';
    else if (formData.password !== formData.password2) newErrors.password2 = '비밀번호가 일치하지 않습니다.';
    if (!isIdChecked) newErrors.id_check = '아이디 중복확인을 해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 2단계는 약관 동의만 남기고 제거
  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.agree_terms) newErrors.agree_terms = '이용약관 동의가 필요합니다.';
    if (!formData.agree_privacy) newErrors.agree_privacy = '개인정보처리방침 동의가 필요합니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 3단계 제거 (단계 간소화)

  // 아이디 중복 확인
  const checkIdDuplicate = async () => {
    if (!formData.username) {
      setIdCheckResult('아이디를 입력해주세요.');
      setIsIdChecked(false);
      setShowValidationError(true);
      return;
    }

    // 여러 조건을 체크하여 구체적인 문제점 표시
    const errors: string[] = [];
    if (formData.username.length < 3) {
      errors.push('3자 이상 입력 필요');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.push('영문, 숫자, 언더스코어(_)만 사용 가능');
    }

    if (errors.length > 0) {
      setIdCheckResult(`${errors.join(', ')}`);
      setIsIdChecked(false);
      setShowValidationError(true);
      return;
    }

    // 유효성 검사 통과 시 에러 상태 해제
    setShowValidationError(false);

    try {
      setIdCheckResult('중복 확인 중...');
      const res = await api.checkIdDuplicate(formData.username);
      
      if (res.available) {
        setIdCheckResult('사용 가능한 아이디입니다.');
        setIsIdChecked(true);
      } else {
        setIdCheckResult('이미 사용 중인 아이디입니다.');
        setIsIdChecked(false);
      }
    } catch (err: any) {
      console.error('ID check error:', err);
      setIdCheckResult('중복 확인에 실패했습니다.');
      setIsIdChecked(false);
    }
  };

  // 다음 단계 이동
  const handleNext = () => {
    switch (step) {
      case 1:
        if (validateStep1()) setStep(2);
        break;
      case 2:
        if (validateStep2()) {
          // 최종 회원가입 요청 (API 스펙에 맞는 데이터만 전송)
          const signupData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
          };
          signupMutation.mutate(signupData);
        }
        break;
    }
  };

  // 이전 단계 이동
  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // 회원가입 Mutation
  const signupMutation = useMutation(api.signup, {
    onSuccess: () => {
      toast.success('회원가입 성공! 로그인해주세요.');
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Signup error:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        const newErrors: {[key: string]: string} = {};
        if (errorData.username) newErrors.username = errorData.username[0];
        if (errorData.email) newErrors.email = errorData.email[0];
        if (errorData.password) newErrors.password = errorData.password[0];
        setErrors(newErrors);
        toast.error(errorData.detail || '회원가입에 실패했습니다.');
      } else {
        toast.error('네트워크 오류가 발생했습니다.');
      }
    },
  });

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // 아이디가 변경되면 중복확인 상태 리셋
    if (name === 'username') {
      setIsIdChecked(false);
      setIdCheckResult('');
      
      // 실시간으로 조건 체크해서 빨간색 표시
      if (value) {
        const errors: string[] = [];
        if (value.length < 3) {
          errors.push('3자 이상 입력 필요');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.push('영문, 숫자, 언더스코어(_)만 사용 가능 (한글 사용 불가)');
        }
        
        if (errors.length > 0) {
          setShowValidationError(true);
          setIdCheckResult(`아이디 조건 불충족: ${errors.join(', ')}`);
        } else {
          setShowValidationError(false);
          setIdCheckResult('');
        }
      } else {
        setShowValidationError(false);
      }
    }

    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext();
  };

  // 스타일 클래스
  const stepIndicator = (num: number, label: string) => (
    <div className={`flex items-center ${step >= num ? 'text-blue-600' : 'text-gray-400'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
        step === num ? 'bg-blue-600 text-white' : 'bg-transparent'
      }`}>
        {num}
      </div>
      <span className="ml-2 text-sm">{label}</span>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 min-h-screen overflow-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-start justify-center py-8">
        <div className="max-w-md w-full">
          {/* 상단 네비게이션 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">회원가입</h2>
            <p className="text-gray-500 text-sm">쇼프다에 오신 것을 환영합니다</p>
          </div>

          {/* 스텝 인디케이터 */}
          <div className="flex justify-center mb-6 space-x-4">
            {stepIndicator(1, '기본정보')}
            <div className="w-16 h-0.5 bg-gray-300"></div>
            {stepIndicator(2, '약관동의')}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: 기본 정보 */}
            {step === 1 && (
              <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="font-semibold text-gray-800 mb-4">기본 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      아이디 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                          showValidationError || errors.username
                            ? 'border-red-500 focus:ring-red-400 focus:border-red-500 bg-red-50'
                            : isIdChecked
                            ? 'border-green-500 focus:ring-green-400 focus:border-green-500 bg-green-50'
                            : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                        }`}
                        placeholder="아이디를 입력하세요"
                        value={formData.username}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        onClick={checkIdDuplicate}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 whitespace-nowrap"
                      >
                        중복확인
                      </button>
                    </div>
                    {/* 유효성 검사 에러 메시지 (강조 효과) */}
                    {showValidationError && idCheckResult && (
                      <div className="mt-1 p-2 bg-red-100 border border-red-300 rounded-md">
                        <p className="text-sm text-red-700 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {idCheckResult}
                        </p>
                      </div>
                    )}
                    
                    {/* 중복확인 결과 */}
                    {idCheckResult && !showValidationError && (
                      <p className={`text-sm mt-1 font-medium ${
                        idCheckResult.includes('사용 가능') 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {idCheckResult}
                      </p>
                    )}
                    
                    {/* 폼 제출 시 에러 */}
                    {errors.username && <p className="text-sm text-red-600 mt-1 font-medium">{errors.username}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      }`}
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">• 8자 이상 • 영문, 숫자, 특수문자 조합 권장</p>
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                      비밀번호 확인 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password2"
                      name="password2"
                      type="password"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.password2
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      }`}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={formData.password2}
                      onChange={handleChange}
                    />
                    {errors.password2 && <p className="text-xs text-red-600 mt-1">{errors.password2}</p>}
                  </div>

                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.first_name
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      }`}
                      placeholder="이름"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                    {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      }`}
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.username || !formData.password || !formData.email || !formData.first_name || !isIdChecked}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50"
                >
                  다음 단계 →
                </button>
              </div>
            )}

            {/* Step 2: 약관 동의 */}
            {step === 2 && (
              <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="font-semibold text-gray-800 mb-4">약관 동의</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="all_agree"
                      checked={formData.agree_terms && formData.agree_privacy}
                      onChange={handleAllAgree}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="all_agree" className="ml-2 text-sm font-medium text-gray-700">
                      전체 동의
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="agree_terms"
                      name="agree_terms"
                      checked={formData.agree_terms}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="agree_terms" className="ml-2 text-sm font-medium text-gray-700">
                      [필수] 이용약관 동의{' '}
                      <button type="button" className="text-blue-600 text-xs underline">내용보기</button>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="agree_privacy"
                      name="agree_privacy"
                      checked={formData.agree_privacy}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="agree_privacy" className="ml-2 text-sm font-medium text-gray-700">
                      [필수] 개인정보처리방침 동의{' '}
                      <button type="button" className="text-blue-600 text-xs underline">내용보기</button>
                    </label>
                  </div>

                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    ← 이전 단계
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
                  >
                    회원가입 완료
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center pt-4 mt-4 border-t border-gray-200">
            <span className="text-gray-600 text-sm">이미 회원이신가요? </span>
            <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;