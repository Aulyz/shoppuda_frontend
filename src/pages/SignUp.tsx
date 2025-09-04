import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

// Daum 우편번호 서비스 타입 선언
declare global {
  interface Window {
    daum: any;
  }
}


function SignUp() {
  const navigate = useNavigate();

  // 현재 단계 관리 (1: 기본정보, 2: 추가정보, 3: 약관동의 및 회원가입)
  const [step, setStep] = useState(1);

  // 팝업 상태 관리
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showFinalTermsModal, setShowFinalTermsModal] = useState(false);

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    // 필수 필드
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    phone_number: '',
    terms_agreed: false,
    privacy_agreed: false,
    // 선택 필드 (추가정보)
    birth_date: '',
    gender: '',
    postal_code: '',
    address: '',
    detail_address: '',
    marketing_agreed: false,
  });

  // 에러 상태
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 아이디 중복 확인 상태
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idCheckResult, setIdCheckResult] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);

  // 전체 동의 체크
  const handleAllAgree = () => {
    const allChecked = formData.terms_agreed && formData.privacy_agreed && formData.marketing_agreed;
    setFormData((prev) => ({
      ...prev,
      terms_agreed: !allChecked,
      privacy_agreed: !allChecked,
      marketing_agreed: !allChecked,
    }));
  };

  // 유효성 검사 함수 (기본 정보만)
  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.username) newErrors.username = '아이디는 필수입니다.';
    else if (formData.username.length < 3) newErrors.username = '아이디는 3자 이상이어야 합니다.';
    else if (formData.username.length > 20) newErrors.username = '아이디는 20자 이하여야 합니다.';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = '아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다.';
    if (!formData.email) newErrors.email = '이메일은 필수입니다.';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = '올바른 이메일 형식이 아닙니다.';
    if (!formData.password1) newErrors.password1 = '비밀번호는 필수입니다.';
    else if (formData.password1.length < 8) newErrors.password1 = '비밀번호는 8자 이상이어야 합니다.';
    else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password1)) newErrors.password1 = '비밀번호는 영문과 숫자를 포함해야 합니다.';
    if (!formData.password2) newErrors.password2 = '비밀번호 확인은 필수입니다.';
    else if (formData.password1 !== formData.password2) newErrors.password2 = '비밀번호가 일치하지 않습니다.';
    if (!formData.phone_number) newErrors.phone_number = '전화번호는 필수입니다.';
    else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone_number)) newErrors.phone_number = '올바른 전화번호 형식이 아닙니다 (010-1234-5678).';
    if (!isIdChecked) newErrors.id_check = '아이디 중복확인을 해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


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
    if (formData.username.length > 20) {
      errors.push('20자 이하로 입력 필요');
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
        setStep(3);
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

  // Daum 주소 검색 열기
  const openAddressSearch = () => {
    if (!window.daum) {
      toast.error('주소 검색 서비스를 로드할 수 없습니다.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // 팝업 완료시 실행될 코드
        let addr = ''; // 주소 변수
        let extraAddr = ''; // 참고항목 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
          addr = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
          addr = data.jibunAddress;
        }

        // 사용자가 도로명 주소를 선택했고, 참고항목이 있을 경우 추가한다.
        if(data.userSelectedType === 'R'){
          // 법정동명이 있을 경우 추가한다. (법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.)
          if(data.bname !== '' && /[^0-9]$/.test(data.bname)){
            extraAddr += data.bname;
          }
          // 건물명이 있고, 공동주택일 경우 추가한다.
          if(data.buildingName !== '' && data.apartment === 'Y'){
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if(extraAddr !== ''){
            extraAddr = ' (' + extraAddr + ')';
          }
        }

        // 선택된 주소를 폼에 설정
        setFormData(prev => ({
          ...prev,
          postal_code: data.zonecode,
          address: addr + extraAddr
        }));

        // 주소 에러 취소
        if (errors.address) {
          setErrors(prev => ({ ...prev, address: '' }));
        }
      }
    }).open();
  };

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
        if (value.length > 20) {
          errors.push('20자 이하로 입력 필요');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.push('영문, 숫자, 언더스코어(_)만 사용 가능');
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
          <div className="flex justify-center mb-6 space-x-2">
            {stepIndicator(1, '기본정보')}
            <div className="w-12 h-0.5 bg-gray-300 mt-3"></div>
            {stepIndicator(2, '추가정보')}
            <div className="w-12 h-0.5 bg-gray-300 mt-3"></div>
            {stepIndicator(3, '약관동의')}
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
                    <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-1">
                      비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password1"
                      name="password1"
                      type="password"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.password1
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      }`}
                      placeholder="비밀번호를 입력하세요"
                      value={formData.password1}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">• 8자 이상 • 영문, 숫자 포함 필수 • 특수문자 조합 권장</p>
                    {errors.password1 && <p className="text-xs text-red-600 mt-1">{errors.password1}</p>}
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

                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.phone_number
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      }`}
                      placeholder="010-1234-5678"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">• 배송 및 주문 안내를 위해 수집됩니다</p>
                    {errors.phone_number && <p className="text-xs text-red-600 mt-1">{errors.phone_number}</p>}
                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.username || !formData.password1 || !formData.email || !formData.first_name || !formData.phone_number || !isIdChecked}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50"
                >
                  다음 단계 →
                </button>
              </div>
            )}

            {/* Step 2: 추가 정보 */}
            {step === 2 && (
              <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="font-semibold text-gray-800 mb-4">추가 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                      생년월일
                    </label>
                    <input
                      id="birth_date"
                      name="birth_date"
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.birth_date
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      }`}
                      value={formData.birth_date}
                      onChange={handleChange}
                    />
                    {errors.birth_date && <p className="text-xs text-red-600 mt-1">{errors.birth_date}</p>}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      성별
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.gender
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                      }`}
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">성별을 선택해주세요</option>
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                      <option value="O">기타</option>
                    </select>
                    {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      주소
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          id="address"
                          name="address"
                          type="text"
                          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.address
                              ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                              : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                          }`}
                          placeholder="주소를 검색해주세요"
                          value={formData.address}
                          onChange={handleChange}
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={openAddressSearch}
                          className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200 whitespace-nowrap"
                        >
                          주소찾기
                        </button>
                      </div>
                      <input
                        id="detail_address"
                        name="detail_address"
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.detail_address
                            ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                            : 'border-gray-300 focus:ring-orange-400 focus:border-orange-400'
                        }`}
                        placeholder="상세주소를 입력해주세요"
                        value={formData.detail_address}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
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
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
                  >
                    다음 단계 →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: 약관 동의 및 회원가입 */}
            {step === 3 && (
              <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="font-semibold text-gray-800 mb-4">회원가입 완료</h3>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">모든 정보가 입력되었습니다</h4>
                    <p className="text-gray-600 mb-6">약관에 동의하시고 회원가입을 완료해주세요.</p>
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
                    type="button"
                    onClick={() => setShowFinalTermsModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition"
                  >
                    약관동의
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

      {/* 이용약관 모달 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">이용약관</h3>
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-sm text-gray-700 space-y-4">
                <h4 className="font-semibold">제1조 (목적)</h4>
                <p>이 약관은 쇼프다(이하 &apos;회사&apos;)가 제공하는 온라인 쇼핑몰 서비스의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                
                <h4 className="font-semibold">제2조 (정의)</h4>
                <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>&apos;쇼핑몰&apos;이란 회사가 상품 또는 용역을 이용자에게 제공하기 위하여 카드결제, 계좌이체 등의 방법을 이용하여 결제기능을 갖춘 가상의 영업장을 말합니다.</li>
                  <li>&apos;이용자&apos;란 쇼핑몰에 접속하여 이 약관에 따라 쇼핑몰이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                </ul>
                
                <h4 className="font-semibold">제3조 (약관의 공개와 개정)</h4>
                <p>회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 쇼핑몰의 초기서비스화면에 게시합니다.</p>
                
                <p className="text-xs text-gray-500 mt-6">최종 업데이트: 2024년 1월 1일</p>
              </div>
            </div>
            <div className="p-6 border-t">
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  닫기
                </button>
                <button 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, agree_terms: true }));
                    setShowTermsModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  동의하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">개인정보처리방침</h3>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-sm text-gray-700 space-y-4">
                <h4 className="font-semibold">제1조 (개인정보의 처리 목적)</h4>
                <p>쇼프다(이하 &apos;회사&apos;)는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>회원가입 및 관리</li>
                  <li>서비스 제공 및 계약이행</li>
                  <li>물품 배송 및 결제서비스 제공</li>
                  <li>마케팅 및 광고 활용</li>
                </ul>
                
                <h4 className="font-semibold">제2조 (처리하는 개인정보의 항목)</h4>
                <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>필수항목: 이름, 아이디, 비밀번호, 이메일, 전화번호</li>
                  <li>선택항목: 주소, 생년월일, 성별</li>
                </ul>
                
                <h4 className="font-semibold">제3조 (개인정보의 보유 및 이용기간)</h4>
                <p>회사는 개인정보 수집·이용 목적이 달성된 후에는 지체 없이 해당 정보를 파기합니다. 단, 개인정보보호법 등 관련 법령에 의해 보존해야 하는 경우에는 예외로 합니다.</p>
                
                <p className="text-xs text-gray-500 mt-6">최종 업데이트: 2024년 1월 1일</p>
              </div>
            </div>
            <div className="p-6 border-t">
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  닫기
                </button>
                <button 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, agree_privacy: true }));
                    setShowPrivacyModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  동의하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 최종 약관동의 및 회원가입 팝업 */}
      {showFinalTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">약관 동의 및 회원가입</h3>
                <button 
                  onClick={() => setShowFinalTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="final_all_agree"
                    checked={formData.terms_agreed && formData.privacy_agreed && formData.marketing_agreed}
                    onChange={handleAllAgree}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="final_all_agree" className="ml-2 text-sm font-medium text-gray-700">
                    전체 동의
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="final_agree_terms"
                      name="terms_agreed"
                      checked={formData.terms_agreed}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="final_agree_terms" className="ml-2 text-sm font-medium text-gray-700">
                      [필수] 이용약관 동의
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 text-xs underline hover:text-blue-800"
                  >
                    내용보기
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="final_agree_privacy"
                      name="privacy_agreed"
                      checked={formData.privacy_agreed}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="final_agree_privacy" className="ml-2 text-sm font-medium text-gray-700">
                      [필수] 개인정보처리방침 동의
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-blue-600 text-xs underline hover:text-blue-800"
                  >
                    내용보기
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="final_agree_marketing"
                      name="marketing_agreed"
                      checked={formData.marketing_agreed}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="final_agree_marketing" className="ml-2 text-sm font-medium text-gray-700">
                      [선택] 마케팅 정보 수신 동의
                    </label>
                  </div>
                </div>

                {(errors.terms_agreed || errors.privacy_agreed) && (
                  <p className="text-xs text-red-600 mt-1">아래 필수 약관에 동의해주세요.</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t">
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowFinalTermsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    if (!formData.terms_agreed || !formData.privacy_agreed) {
                      setErrors({
                        terms_agreed: !formData.terms_agreed ? '이용약관 동의가 필요합니다.' : '',
                        privacy_agreed: !formData.privacy_agreed ? '개인정보처리방침 동의가 필요합니다.' : ''
                      });
                      return;
                    }
                    
                    // 최종 회원가입 요청 - 백엔드 모델 필드명에 맞춤
                    const signupData = {
                      username: formData.username,
                      email: formData.email,
                      password1: formData.password1,
                      password2: formData.password2,
                      first_name: formData.first_name,
                      phone_number: formData.phone_number,
                      birth_date: formData.birth_date || undefined,
                      gender: formData.gender || undefined,
                      postal_code: formData.postal_code || undefined,
                      address: formData.address || undefined,
                      detail_address: formData.detail_address || undefined,
                      terms_agreed: formData.terms_agreed,
                      privacy_agreed: formData.privacy_agreed,
                      marketing_agreed: formData.marketing_agreed,
                    };
                    signupMutation.mutate(signupData);
                    setShowFinalTermsModal(false);
                  }}
                  disabled={signupMutation.isLoading || !formData.terms_agreed || !formData.privacy_agreed}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50"
                >
                  {signupMutation.isLoading ? '처리 중...' : '회원가입 완료'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;