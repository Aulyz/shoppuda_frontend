import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'
import { api } from '../services/api'

function SignUp() {
  const navigate = useNavigate()
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  })

  const signupMutation = useMutation(api.signup, {
    onSuccess: () => {
      toast.success('회원가입 성공! 로그인해주세요.')
      navigate('/login')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '회원가입 실패'
      toast.error(message)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.password2) {
      toast.error('비밀번호가 일치하지 않습니다')
      return
    }

    signupMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 overflow-hidden px-4 sm:px-6 lg:px-8" style={{height: 'calc(100vh - 70px)'}}>
      <div className="h-full flex items-start justify-center pt-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
              회원가입
            </h2>
            <p className="text-gray-500 text-sm">쇼프다에 오신 것을 환영합니다</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                placeholder="아이디를 입력하세요"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  placeholder="이름"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">성</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                  placeholder="성"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
              <input
                id="password2"
                name="password2"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.password2}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={signupMutation.isLoading}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-semibold py-2.5 rounded-lg hover:from-orange-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all duration-200 disabled:opacity-50"
            >
              {signupMutation.isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>
          
          <div className="text-center pt-4 mt-4 border-t border-gray-200">
            <span className="text-gray-600 text-sm">이미 계정이 있으신가요? </span>
            <Link to="/login" className="text-sm font-semibold text-orange-600 hover:text-pink-600 transition-colors">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp