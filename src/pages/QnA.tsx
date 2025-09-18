import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  TagIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { 
  ChatBubbleLeftRightIcon as ChatSolidIcon,
  StarIcon
} from '@heroicons/react/24/solid'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface QnAItem {
  id: number
  title: string
  content: string
  category: string
  status: 'waiting' | 'answered' | 'closed'
  isPublic: boolean
  createdAt: string
  updatedAt: string
  answer?: {
    content: string
    answeredAt: string
    answeredBy: string
  }
  user: {
    name: string
    email: string
  }
}

const categories = [
  { value: 'all', label: '전체', color: 'bg-gray-500' },
  { value: 'product', label: '상품문의', color: 'bg-blue-500' },
  { value: 'delivery', label: '배송문의', color: 'bg-green-500' },
  { value: 'exchange', label: '교환/환불', color: 'bg-orange-500' },
  { value: 'payment', label: '결제문의', color: 'bg-purple-500' },
  { value: 'account', label: '계정문의', color: 'bg-pink-500' },
  { value: 'etc', label: '기타문의', color: 'bg-gray-400' }
]

const statusOptions = [
  { value: 'all', label: '전체 상태', color: 'text-gray-600' },
  { value: 'waiting', label: '답변 대기', color: 'text-yellow-600' },
  { value: 'answered', label: '답변완료', color: 'text-green-600' },
  { value: 'closed', label: '문의종료', color: 'text-gray-500' }
]

function QnA() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [showWriteForm, setShowWriteForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: 'product',
    isPublic: true
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // URL 파라미터 확인하여 "내 문의" 탭으로 자동 이동
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'my' && isAuthenticated) {
      setActiveTab('my')
      // URL에서 tab 파라미터 제거 (깔끔한 URL 유지)
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('tab')
      setSearchParams(newSearchParams, { replace: true })
    }
  }, [isAuthenticated, searchParams, setSearchParams])

  // 탭이 변경될 때 필터 초기화
  useEffect(() => {
    setSelectedCategory('all')
    setSelectedStatus('all')
    setSearchTerm('')
  }, [activeTab])

  // Mock data - 실제 API와 연결 시 수정 필요
  const mockQnAs: QnAItem[] = [
    {
      id: 1,
      title: '상품 문의가 있어요',
      content: '구매하려는 상품에 대한 자세한 정보를 알고 싶습니다.',
      category: 'product',
      status: 'answered',
      isPublic: true,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-21',
      answer: {
        content: '안녕하세요. 해당 상품에 대한 자세한 정보를 제공해드릴게요. 추가로 궁금하신 점이 있으시면 언제든 문의해 주세요.',
        answeredAt: '2024-01-21',
        answeredBy: '고객센터'
      },
      user: { name: '김**', email: 'k***@email.com' }
    },
    {
      id: 2,
      title: '배송비 관련 궁금한 점이 있어요',
      content: '무료배송 조건과 배송 기간에 대해 알고 싶습니다.',
      category: 'delivery',
      status: 'answered',
      isPublic: true,
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
      answer: {
        content: '50,000원 이상 구매시 무료배송이며, 일반적으로 주문 후 2-3일 내 배송됩니다.',
        answeredAt: '2024-01-19',
        answeredBy: '고객센터'
      },
      user: { name: '이**', email: 'l***@email.com' }
    },
    {
      id: 3,
      title: '교환 및 환불 절차는 어떻게 되나요?',
      content: '구매한 상품의 사이즈가 맞지 않아 교환을 하고 싶은데 절차가 궁금해요.',
      category: 'exchange',
      status: 'waiting',
      isPublic: false,
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      user: { name: '박**', email: 'p***@email.com' }
    },
    // 현재 사용자의 문의 예시 (로그인한 경우)
    ...(user ? [
      {
        id: 4,
        title: '내가 작성한 상품 문의',
        content: '구매를 고려하고 있는 상품의 재질과 관리 방법이 궁금합니다.',
        category: 'product',
        status: 'answered' as const,
        isPublic: true,
        createdAt: '2024-01-22',
        updatedAt: '2024-01-22',
        answer: {
          content: '해당 상품은 면 100% 소재로 제작되었으며, 찬물 세탁을 권장드립니다.',
          answeredAt: '2024-01-22',
          answeredBy: '고객센터'
        },
        user: { name: user.first_name || user.username || '현재사용자', email: user.email || 'current@user.com' }
      },
      {
        id: 5,
        title: '배송 관련 문의입니다',
        content: '주문한 상품의 배송 상태를 확인하고 싶습니다.',
        category: 'delivery' as const,
        status: 'waiting' as const,
        isPublic: false,
        createdAt: '2024-01-23',
        updatedAt: '2024-01-23',
        user: { name: user.first_name || user.username || '현재사용자', email: user.email || 'current@user.com' }
      }
    ] : [])
  ]

  const { data: qnaData, isLoading } = useQuery(
    ['qna', activeTab, selectedCategory, selectedStatus, searchTerm, user?.email],
    () => {
      // Mock API call - 실제 api.getQnAs() 호출로 대체
      return Promise.resolve(mockQnAs.filter(item => {
        // 탭 필터링
        if (activeTab === 'my') {
          if (!user || item.user.email !== user.email) {
            return false
          }
        }
        
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
        const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
        const matchesSearch = searchTerm === '' || 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesStatus && matchesSearch
      }))
    },
    {
      retry: 3,
      retryDelay: 1000
    }
  )

  const createQnAMutation = useMutation(
    (data: any) => {
      // Mock API call - 실제 api.createQnA() 호출로 대체
      return Promise.resolve({ ...data, id: Date.now() })
    },
    {
      onSuccess: () => {
        toast.success('문의가 등록되었습니다!')
        setShowWriteForm(false)
        setNewQuestion({ title: '', content: '', category: 'product', isPublic: true })
      },
      onError: () => {
        toast.error('문의 등록에 실패했습니다.')
      }
    }
  )

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.')
      return
    }
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.')
      return
    }
    createQnAMutation.mutate(newQuestion)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          답변 대기
        </span>
      case 'answered':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircleIcon className="w-3 h-3" />
          답변완료
        </span>
      case 'closed':
        return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
          문의종료
        </span>
      default:
        return null
    }
  }

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[0]
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Q&A를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* 상단 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
              <ChatSolidIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              고객 Q&A
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            궁금한 점을 문의해주시면 빠르게 답변드릴게요. 다른 분들의 질문도 확인해보세요.
          </p>
          
          {/* 통계 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-blue-600">10분 이내</div>
              <div className="text-sm text-gray-600">평균 답변 시간</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">답변 만족도</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="text-2xl font-bold text-purple-600">{mockQnAs.length}</div>
              <div className="text-sm text-gray-600">총 문의 건수</div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>전체 문의</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  activeTab === 'all' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {mockQnAs.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?next=/qna&tab=my')
                } else {
                  setActiveTab('my')
                }
              }}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'my'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                  : !isAuthenticated
                  ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserCircleIcon className="w-5 h-5" />
                <span>내 문의</span>
                {!isAuthenticated ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                    로그인 필요
                  </span>
                ) : user && (
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    activeTab === 'my' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {mockQnAs.filter(item => item.user.email === user.email).length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* 필터링 및 검색 헤더 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* 카테고리 필터 */}
              <div className="relative">
                <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-40"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 상태 필터 */}
              <div className="relative">
                <TagIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-36"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 검색 */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="제목이나 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 문의하기 버튼 */}
            <button
              onClick={() => setShowWriteForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              문의하기
            </button>
          </div>
        </div>

        {/* 문의 작성 폼 */}
        {showWriteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">새 문의 작성</h3>
                  <button
                    onClick={() => setShowWriteForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmitQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리
                    </label>
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {categories.slice(1).map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                      placeholder="문의 제목을 입력해주세요"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      문의 내용
                    </label>
                    <textarea
                      value={newQuestion.content}
                      onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                      placeholder="자세한 문의 내용을 입력해주세요"
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={newQuestion.isPublic}
                      onChange={(e) => setNewQuestion({...newQuestion, isPublic: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      다른 고객들도 볼 수 있도록 공개
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={createQnAMutation.isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                    >
                      {createQnAMutation.isLoading ? '등록 중...' : '문의 등록'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWriteForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Q&A 목록 */}
        <div className="space-y-4">
          {qnaData && qnaData.length > 0 ? (
            qnaData.map((item: QnAItem) => {
              const categoryInfo = getCategoryInfo(item.category)
              const isExpanded = expandedItems.has(item.id)
              
              return (
                <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-200">
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`${categoryInfo.color} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                            {categoryInfo.label}
                          </span>
                          {getStatusBadge(item.status)}
                          {!item.isPublic && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                              비공개
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <UserCircleIcon className="w-4 h-4" />
                            {item.user.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {item.createdAt}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.status === 'answered' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <StarIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">답변완료</span>
                          </div>
                        )}
                        <div className="text-gray-400">
                          {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상세 내용 */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50/80">
                      <div className="p-6 space-y-4">
                        {/* 질문 내용 */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <ExclamationCircleIcon className="w-5 h-5 text-blue-500" />
                            문의 내용
                          </h4>
                          <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border">
                            {item.content}
                          </p>
                        </div>

                        {/* 답변 내용 */}
                        {item.answer ? (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                              답변
                            </h4>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <p className="text-gray-800 leading-relaxed mb-3">
                                {item.answer.content}
                              </p>
                              <div className="flex items-center justify-between text-sm text-green-600">
                                <span className="font-medium">{item.answer.answeredBy}</span>
                                <span>{item.answer.answeredAt}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 text-yellow-700">
                              <ClockIcon className="w-5 h-5" />
                              <span className="font-medium">답변을 준비 중입니다</span>
                            </div>
                            <p className="text-sm text-yellow-600 mt-1">
                              빠른 시일 내에 정성껏 답변해드릴게요.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
              {activeTab === 'my' ? (
                <>
                  <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">작성한 문의가 없습니다</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                      ? '검색 조건에 맞는 내 문의를 찾을 수 없습니다.'
                      : '첫 번째 문의를 작성해보세요!'
                    }
                  </p>
                </>
              ) : (
                <>
                  <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">문의 내역이 없습니다</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                      ? '검색 조건에 맞는 문의를 찾을 수 없습니다.'
                      : '첫 번째 문의를 작성해보세요!'
                    }
                  </p>
                </>
              )}
              
              {isAuthenticated && (
                <button
                  onClick={() => setShowWriteForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  문의하기
                </button>
              )}
              
              {!isAuthenticated && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">로그인 후 문의를 작성할 수 있습니다</p>
                  <div className="flex gap-2 justify-center">
                    <a
                      href="/login"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                    >
                      로그인
                    </a>
                    <a
                      href="/signup"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                    >
                      회원가입
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 고객센터 헤더 */}
        <div className="mt-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-2xl p-8 text-center text-white">
          <ChatSolidIcon className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-4">더 빠른 답변을 원하시나요?</h3>
          <p className="text-lg mb-6 opacity-90">
            전화나 카카오톡으로도 문의 가능해요!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:1588-0000"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-full font-semibold transition-all duration-200"
            >
              전화 문의: 1588-0000
            </a>
            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-full font-semibold transition-all duration-200">
              실시간 카카오톡 상담
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QnA