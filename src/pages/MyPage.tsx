import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  HeartIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

declare global {
  interface Window {
    daum: any;
  }
}

interface ShippingAddress {
  id: number;
  nickname: string;
  recipient_name: string;
  phone_number: string;
  address: string;
  detail_address: string;
  postal_code: string;
  is_default: boolean;
}

interface PointHistory {
  id: number;
  point_type: 'EARN' | 'USE';
  amount: number;
  balance: number;
  description: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  birth_date: string | null;
  gender: string | null;
  points: number;
  user_type: string;
  is_email_verified: boolean;
  date_joined: string;
  shipping_addresses: ShippingAddress[];
  recent_points: PointHistory[];
  total_orders: number;
}

const MyPage: React.FC = () => {
  const { user, accessToken, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'points' | 'password'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    birth_date: '',
    gender: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [addressForm, setAddressForm] = useState({
    nickname: '',
    recipient_name: '',
    phone_number: '',
    postal_code: '',
    address: '',
    detail_address: '',
    is_default: false
  });

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [accessToken, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await api.getMyPageProfile();
      const data = response.profile || response; // API가 {profile: ...} 형태로 반환하는 경우 처리
      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || '',
        birth_date: data.birth_date || '',
        gender: data.gender || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('프로필을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await api.updateMyPageProfile(formData);
      const data = response.profile || response;
      setProfile(data);
      setEditMode(false);
      toast.success('프로필이 업데이트되었습니다.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('http://shoppuda.kro.kr:8000/api/mypage/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });
      
      if (response.ok) {
        toast.success('비밀번호가 변경되었습니다.');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        const data = await response.json();
        toast.error(data.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleAddressSubmit = async () => {
    try {
      const url = editingAddress 
        ? `http://shoppuda.kro.kr:8000/api/mypage/shipping-addresses/${editingAddress.id}/`
        : 'http://shoppuda.kro.kr:8000/api/mypage/shipping-addresses/';
      
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressForm)
      });
      
      if (response.ok) {
        toast.success(editingAddress ? '배송지가 수정되었습니다.' : '배송지가 추가되었습니다.');
        fetchProfile();
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
          nickname: '',
          recipient_name: '',
          phone_number: '',
          postal_code: '',
          address: '',
          detail_address: '',
          is_default: false
        });
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('배송지 저장에 실패했습니다.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('정말 이 배송지를 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`http://shoppuda.kro.kr:8000/api/mypage/shipping-addresses/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        toast.success('배송지가 삭제되었습니다.');
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('배송지 삭제에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // React Query 캐시 전체 초기화
      queryClient.clear();
      
      // zustand store 로그아웃
      logout();
      
      // 홈페이지로 이동
      navigate('/');
      toast.success('로그아웃되었습니다.');
    }
  };

  const searchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        setAddressForm({
          ...addressForm,
          postal_code: data.zonecode,
          address: data.roadAddress || data.jibunAddress
        });
      }
    }).open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', label: '프로필', icon: UserIcon },
    { id: 'addresses', label: '배송지 관리', icon: MapPinIcon },
    { id: 'orders', label: '주문 내역', icon: ClipboardDocumentListIcon },
    { id: 'points', label: '포인트', icon: CreditCardIcon },
    { id: 'password', label: '비밀번호 변경', icon: KeyIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">마이페이지</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* 모바일 메뉴 토글 버튼 */}
          <button
            className="lg:hidden flex items-center justify-between w-full bg-white p-4 rounded-lg shadow-sm mb-4"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="font-medium">메뉴</span>
            {mobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>

          {/* 사이드바 메뉴 - 모바일에서는 토글 */}
          <div className={`lg:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 lg:mb-6">
              {/* 사용자 정보 요약 */}
              <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mb-3">
                  <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{profile?.first_name || profile?.username}</h2>
                <p className="text-sm text-gray-600">{profile?.email}</p>
                <div className="mt-3 bg-orange-50 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-orange-600">
                    {profile?.points?.toLocaleString() || 0} P
                  </span>
                </div>
              </div>

              {/* 메뉴 아이템 */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'orders') {
                        navigate('/orders');
                      } else {
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                      activeTab === item.id 
                        ? 'bg-orange-50 text-orange-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm sm:text-base"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>로그아웃</span>
                </button>
              </nav>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              {/* 프로필 탭 */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">프로필 정보</h3>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
                      >
                        <PencilIcon className="w-4 h-4" />
                        <span>수정</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleProfileUpdate}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile?.first_name || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">성</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile?.last_name || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={formData.phone_number}
                          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile?.phone_number || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                      <p className="text-gray-900 py-2">{profile?.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                      {editMode ? (
                        <input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{profile?.birth_date || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                      {editMode ? (
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">선택</option>
                          <option value="M">남성</option>
                          <option value="F">여성</option>
                          <option value="O">기타</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 py-2">
                          {profile?.gender === 'M' ? '남성' : profile?.gender === 'F' ? '여성' : profile?.gender === 'O' ? '기타' : '-'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 배송지 관리 탭 */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">배송지 관리</h3>
                    <button
                      onClick={() => {
                        setShowAddressForm(true);
                        setEditingAddress(null);
                        setAddressForm({
                          nickname: '',
                          recipient_name: '',
                          phone_number: '',
                          postal_code: '',
                          address: '',
                          detail_address: '',
                          is_default: false
                        });
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>새 배송지 추가</span>
                    </button>
                  </div>

                  {showAddressForm && (
                    <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                      <h4 className="font-semibold mb-4">
                        {editingAddress ? '배송지 수정' : '새 배송지 추가'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">별칭</label>
                          <input
                            type="text"
                            value={addressForm.nickname}
                            onChange={(e) => setAddressForm({...addressForm, nickname: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="예: 집, 회사"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">수령인</label>
                          <input
                            type="text"
                            value={addressForm.recipient_name}
                            onChange={(e) => setAddressForm({...addressForm, recipient_name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="받는 분 성함"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                          <input
                            type="tel"
                            value={addressForm.phone_number}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              setAddressForm({...addressForm, phone_number: formatted});
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="010-0000-0000"
                            maxLength={13}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={addressForm.postal_code}
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                              placeholder="00000"
                            />
                            <button
                              type="button"
                              onClick={searchAddress}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                              검색
                            </button>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                          <input
                            type="text"
                            value={addressForm.address}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                            placeholder="우편번호 검색을 클릭하세요"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">상세주소</label>
                          <input
                            type="text"
                            value={addressForm.detail_address}
                            onChange={(e) => setAddressForm({...addressForm, detail_address: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="동/호수 등 상세주소 입력"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={addressForm.is_default}
                              onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                              className="text-orange-600 focus:ring-orange-500 rounded"
                            />
                            <span className="text-sm">기본 배송지로 설정</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleAddressSubmit}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {profile?.shipping_addresses?.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 mb-3 sm:mb-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold">{address.nickname}</span>
                              {address.is_default && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                  기본 배송지
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{address.recipient_name}</p>
                            <p className="text-sm text-gray-600">{address.phone_number}</p>
                            <p className="text-sm text-gray-600">
                              [{address.postal_code}] {address.address} {address.detail_address}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingAddress(address);
                                setAddressForm({
                                  nickname: address.nickname,
                                  recipient_name: address.recipient_name,
                                  phone_number: address.phone_number,
                                  postal_code: address.postal_code,
                                  address: address.address,
                                  detail_address: address.detail_address,
                                  is_default: address.is_default
                                });
                                setShowAddressForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!profile?.shipping_addresses || profile.shipping_addresses.length === 0) && (
                      <p className="text-center text-gray-500 py-8">등록된 배송지가 없습니다.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 주문 내역 탭 */}
              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">주문 내역</h3>
                  <div className="text-center py-8">
                    <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">주문 내역이 없습니다.</p>
                  </div>
                </div>
              )}

              {/* 포인트 탭 */}
              {activeTab === 'points' && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">포인트</h3>
                  <div className="bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg p-4 sm:p-6 text-white mb-6">
                    <p className="text-sm mb-2">사용 가능 포인트</p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {profile?.points?.toLocaleString() || 0} P
                    </p>
                  </div>
                  
                  <h4 className="font-semibold mb-3">최근 포인트 내역</h4>
                  <div className="space-y-2">
                    {profile?.recent_points?.map((point) => (
                      <div key={point.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b">
                        <div className="mb-2 sm:mb-0">
                          <p className="text-sm font-medium">{point.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(point.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:block">
                          <span className={`font-semibold ${
                            point.point_type === 'EARN' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {point.point_type === 'EARN' ? '+' : '-'}
                            {point.amount.toLocaleString()} P
                          </span>
                          <span className="text-sm text-gray-500 sm:ml-4">
                            잔액: {point.balance.toLocaleString()} P
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {(!profile?.recent_points || profile.recent_points.length === 0) && (
                      <p className="text-center text-gray-500 py-4">포인트 내역이 없습니다.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 비밀번호 변경 탭 */}
              {activeTab === 'password' && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">비밀번호 변경</h3>
                  <div className="max-w-md">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          현재 비밀번호
                        </label>
                        <input
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          새 비밀번호
                        </label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          새 비밀번호 확인
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        비밀번호 변경
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 다음 주소 검색 API 스크립트 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
    </div>
  );
};

export default MyPage;