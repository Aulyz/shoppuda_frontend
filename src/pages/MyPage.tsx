import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
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
  MagnifyingGlassIcon
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
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'points' | 'password'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
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

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [accessToken, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://shoppuda.kro.kr:8000/api/mypage/profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status && data.profile) {
          setProfile(data.profile);
          setFormData({
            first_name: data.profile.first_name || '',
            last_name: data.profile.last_name || '',
            phone_number: data.profile.phone_number || '',
            birth_date: data.profile.birth_date || '',
            gender: data.profile.gender || ''
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch('http://shoppuda.kro.kr:8000/api/mypage/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.status) {
          setProfile(data.profile);
          setEditMode(false);
          toast.success('프로필이 업데이트되었습니다.');
        }
      } else {
        console.error('Profile update error:', data);
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          toast.error(`프로필 업데이트 실패:\n${errorMessages}`);
        } else {
          toast.error(data.message || '프로필 업데이트에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
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

      const data = await response.json();
      if (data.status) {
        toast.success('비밀번호가 변경되었습니다.');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        toast.error(data.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
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
      toast.error('배송지 저장에 실패했습니다.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) return;

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
      toast.error('배송지 삭제에 실패했습니다.');
    }
  };

  const handleEditAddress = (address: ShippingAddress) => {
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
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 전화번호 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone_number' | 'phone_number_address') => {
    const formatted = formatPhoneNumber(e.target.value);
    if (field === 'phone_number') {
      setFormData({ ...formData, phone_number: formatted });
    } else {
      setAddressForm({ ...addressForm, phone_number: formatted });
    }
  };

  const searchPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // 우편번호와 주소 정보를 해당 필드에 넣기
        const fullAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        
        setAddressForm(prev => ({
          ...prev,
          postal_code: data.zonecode,
          address: fullAddress
        }));
      },
      theme: {
        bgColor: "#FFFFFF",
        searchBgColor: "#FF6B35",
        contentBgColor: "#FFFFFF",
        pageBgColor: "#FAFAFA",
        textColor: "#333333",
        queryTextColor: "#FFFFFF",
        postcodeTextColor: "#FA5858",
        emphTextColor: "#FF6B35",
        outlineColor: "#E0E0E0"
      }
    }).open();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.first_name || profile?.username}님 안녕하세요!
                </h1>
                <p className="text-gray-600">{profile?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">포인트: {profile?.points?.toLocaleString()}P</span>
                  <span className="text-sm text-gray-500">주문: {profile?.total_orders}건</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>프로필 정보</span>
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'addresses' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <MapPinIcon className="h-5 w-5" />
                  <span>배송지 관리</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5" />
                  <span>주문 내역</span>
                </button>
                <button
                  onClick={() => setActiveTab('points')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'points' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5" />
                  <span>포인트 내역</span>
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'password' ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <KeyIcon className="h-5 w-5" />
                  <span>비밀번호 변경</span>
                </button>
                <Link
                  to="/wishlist"
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>위시리스트</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">프로필 정보</h2>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>수정</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleProfileUpdate}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">성</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => handlePhoneNumberChange(e, 'phone_number')}
                        disabled={!editMode}
                        placeholder="010-0000-0000"
                        maxLength={13}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                      <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                      >
                        <option value="">선택안함</option>
                        <option value="M">남성</option>
                        <option value="F">여성</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">배송지 관리</h2>
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
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>배송지 추가</span>
                    </button>
                  </div>

                  {showAddressForm && (
                    <div className="border border-gray-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-medium mb-4">
                        {editingAddress ? '배송지 수정' : '새 배송지 추가'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">배송지 별칭</label>
                          <input
                            type="text"
                            value={addressForm.nickname}
                            onChange={(e) => setAddressForm({ ...addressForm, nickname: e.target.value })}
                            placeholder="예: 집, 회사"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">받는 분</label>
                          <input
                            type="text"
                            value={addressForm.recipient_name}
                            onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                          <input
                            type="tel"
                            value={addressForm.phone_number}
                            onChange={(e) => handlePhoneNumberChange(e, 'phone_number_address')}
                            placeholder="010-0000-0000"
                            maxLength={13}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">우편번호</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={addressForm.postal_code}
                              readOnly
                              placeholder="우편번호"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={searchPostcode}
                              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center space-x-2"
                            >
                              <MagnifyingGlassIcon className="h-4 w-4" />
                              <span>주소 검색</span>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                          <input
                            type="text"
                            value={addressForm.address}
                            readOnly
                            placeholder="기본 주소"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">상세주소</label>
                          <input
                            type="text"
                            value={addressForm.detail_address}
                            onChange={(e) => setAddressForm({ ...addressForm, detail_address: e.target.value })}
                            placeholder="동/호수 등 상세 주소를 입력하세요"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={addressForm.is_default}
                              onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                              className="rounded text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">기본 배송지로 설정</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleAddressSubmit}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {profile?.shipping_addresses?.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{address.nickname}</h4>
                              {address.is_default && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                                  기본 배송지
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 text-sm font-medium">{address.recipient_name}</p>
                            <p className="text-gray-600 text-sm">{address.phone_number}</p>
                            <p className="text-gray-600 text-sm">
                              [{address.postal_code}] {address.address} {address.detail_address}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">주문 내역</h2>
                  <div className="text-center py-12 text-gray-500">
                    주문 내역이 없습니다.
                  </div>
                </div>
              )}

              {/* Points Tab */}
              {activeTab === 'points' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">포인트 내역</h2>
                  <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">현재 보유 포인트</p>
                    <p className="text-2xl font-bold text-orange-600">{profile?.points?.toLocaleString()}P</p>
                  </div>
                  <div className="space-y-3">
                    {profile?.recent_points?.map((point) => (
                      <div key={point.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium">{point.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(point.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${point.point_type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                            {point.point_type === 'EARN' ? '+' : '-'}{point.amount.toLocaleString()}P
                          </p>
                          <p className="text-sm text-gray-500">잔액: {point.balance.toLocaleString()}P</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">비밀번호 변경</h2>
                  <div className="max-w-md">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
                        <input
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
    </div>
  );
};

export default MyPage;