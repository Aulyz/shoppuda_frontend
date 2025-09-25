import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ChatWebSocket } from '../services/websocket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import { 
  ChatBubbleLeftRightIcon, 
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface FAQ {
  id: number;
  category: number;
  category_name: string;
  question: string;
  answer: string;
  view_count: number;
}

interface FAQCategory {
  id: number;
  name: string;
  faqs: FAQ[];
}

interface ChatMessage {
  id: number;
  message: string;
  sender: number;
  sender_name: string;
  is_admin: boolean;
  is_read: boolean;
  created_at: string;
}

interface ChatRoom {
  id: number;
  subject: string;
  status: string;
  status_display: string;
  admin: number | null;
  admin_name: string | null;
  messages: ChatMessage[];
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface SupportSettings {
  working_hours: string;
  phone_number: string;
  email: string;
  kakao_channel_url: string;
  notice: string;
  is_chat_enabled: boolean;
  auto_response: string;
}

export default function Support() {
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'faq' | 'chat'>('faq');
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [supportSettings, setSupportSettings] = useState<SupportSettings | null>(null);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [chatSubject, setChatSubject] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    fetchSupportSettings();
    fetchFAQs();
  }, []);
  
  useEffect(() => {
    if (showChat && chatRoom) {
      scrollToBottom();
      markMessagesAsRead();
      
      // WebSocket 연결
      connectWebSocket();
    }
    
    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [chatRoom]);
  
  const fetchSupportSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/support/settings/`);
      setSupportSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch support settings:', error);
    }
  };
  
  const fetchFAQs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/support/faqs/by_category/`);
      setFaqCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    }
  };
  
  const startChat = async () => {
    if (!isAuthenticated) {
      alert('채팅 상담을 이용하시려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    if (!chatSubject.trim()) {
      alert('문의 제목을 입력해주세요.');
      return;
    }
    
    setIsLoadingChat(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/support/chat-rooms/`,
        { subject: chatSubject },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      setChatRoom(response.data);
      setShowChat(true);
      setChatSubject('');
    } catch (error) {
      console.error('Failed to create chat room:', error);
      alert('채팅방 생성에 실패했습니다.');
    } finally {
      setIsLoadingChat(false);
    }
  };
  
  const connectWebSocket = async () => {
    if (!chatRoom || wsRef.current) return;
    
    try {
      const ws = new ChatWebSocket(chatRoom.id);
      wsRef.current = ws;
      
      // 메시지 핸들러 설정
      ws.onMessage('chat_message', (data) => {
        setChatRoom(prev => {
          if (!prev) return prev;
          const newMessage: ChatMessage = {
            id: data.message_id,
            message: data.message,
            sender: data.user_id,
            sender_name: data.username,
            is_admin: data.is_staff,
            is_read: false,
            created_at: data.timestamp
          };
          return {
            ...prev,
            messages: [...prev.messages, newMessage]
          };
        });
        scrollToBottom();
      });
      
      ws.onMessage('typing', (data) => {
        if (data.is_typing) {
          setTypingUser(data.username);
          setIsTyping(true);
          
          // 3초 후 타이핑 표시 제거
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        } else {
          setIsTyping(false);
          setTypingUser(null);
        }
      });
      
      ws.onMessage('user_connected', (data) => {
        console.log(`${data.username} connected`);
      });
      
      ws.onMessage('chat_closed', (data) => {
        alert(`채팅이 ${data.closed_by}에 의해 종료되었습니다.`);
        setChatRoom(prev => prev ? { ...prev, status: 'closed' } : prev);
      });
      
      await ws.connect(accessToken);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  };
  
  const sendMessage = async () => {
    if (!chatMessage.trim() || !chatRoom) return;
    
    // WebSocket으로 메시지 전송
    if (wsRef.current && wsRef.current.isConnected()) {
      wsRef.current.sendMessage(chatMessage);
      setChatMessage('');
    } else {
      // WebSocket이 연결되지 않은 경우 API 사용
      try {
        const response = await axios.post(
          `${API_BASE_URL}/support/chat-rooms/${chatRoom.id}/send_message/`,
          { message: chatMessage },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        // Add message to chat room
        setChatRoom(prev => ({
          ...prev!,
          messages: [...prev!.messages, response.data]
        }));
        setChatMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        alert('메시지 전송에 실패했습니다.');
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatMessage(e.target.value);
    
    // 타이핑 상태 전송
    if (wsRef.current && wsRef.current.isConnected()) {
      wsRef.current.sendTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsRef.current.isConnected()) {
          wsRef.current.sendTyping(false);
        }
      }, 1000);
    }
  };
  
  const markMessagesAsRead = async () => {
    if (!chatRoom) return;
    
    try {
      await axios.post(
        `${API_BASE_URL}/support/chat-rooms/${chatRoom.id}/mark_as_read/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };
  
  const closeChat = async () => {
    if (!chatRoom) return;
    
    try {
      await axios.post(
        `${API_BASE_URL}/support/chat-rooms/${chatRoom.id}/close/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      setShowChat(false);
      setChatRoom(null);
    } catch (error) {
      console.error('Failed to close chat:', error);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleFAQ = (faqId: number) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-4">고객센터</h1>
          <p className="text-lg opacity-95">무엇을 도와드릴까요? 언제든지 문의해주세요.</p>
        </div>
        
        {/* Contact Info */}
        {supportSettings && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">전화 상담</p>
                  <p className="font-semibold">{supportSettings.phone_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-semibold">{supportSettings.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">운영 시간</p>
                  <p className="font-semibold">{supportSettings.working_hours}</p>
                </div>
              </div>
            </div>
            
            {supportSettings.notice && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{supportSettings.notice}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'faq'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <QuestionMarkCircleIcon className="h-5 w-5 inline-block mr-2" />
                자주 묻는 질문
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 inline-block mr-2" />
                실시간 채팅 상담
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'faq' ? (
              <div className="space-y-6">
                {faqCategories.map((category) => (
                  <div key={category.id}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {category.name}
                    </h3>
                    <div className="space-y-2">
                      {category.faqs.map((faq) => (
                        <div
                          key={faq.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900">
                              {faq.question}
                            </span>
                            {expandedFAQ === faq.id ? (
                              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          {expandedFAQ === faq.id && (
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {!showChat ? (
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      실시간 채팅 상담
                    </h3>
                    <p className="text-gray-600 mb-6">
                      상담원과 실시간으로 대화하실 수 있습니다.
                      문의 제목을 입력하고 채팅을 시작해주세요.
                    </p>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={chatSubject}
                        onChange={(e) => setChatSubject(e.target.value)}
                        placeholder="문의 제목을 입력하세요"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        onClick={startChat}
                        disabled={isLoadingChat || !supportSettings?.is_chat_enabled}
                        className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingChat ? '채팅방 생성 중...' : '채팅 시작하기'}
                      </button>
                    </div>
                    {!supportSettings?.is_chat_enabled && (
                      <p className="mt-4 text-sm text-red-600 text-center">
                        현재 채팅 상담 서비스를 이용할 수 없습니다.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200">
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{chatRoom?.subject}</h4>
                        <p className="text-sm text-gray-500">
                          {chatRoom?.status_display} 
                          {chatRoom?.admin_name && ` - ${chatRoom.admin_name} 상담원`}
                        </p>
                      </div>
                      <button
                        onClick={closeChat}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="h-96 overflow-y-auto p-4 space-y-4">
                      {chatRoom?.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.is_admin
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                            }`}
                          >
                            <p className="text-sm font-medium mb-1">
                              {message.sender_name}
                            </p>
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.is_admin ? 'text-gray-500' : 'text-white/80'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isTyping && typingUser && (
                        <div className="flex justify-start">
                          <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-100 text-gray-600 italic text-sm">
                            {typingUser}님이 입력 중...
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Chat Input */}
                    {chatRoom?.status !== 'closed' ? (
                      <div className="px-4 py-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={chatMessage}
                            onChange={handleInputChange}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="메시지를 입력하세요..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <button
                            onClick={sendMessage}
                            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg hover:shadow-md transition-shadow"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 border-t border-gray-200">
                        <p className="text-center text-gray-500 text-sm">
                          이 채팅은 종료되었습니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}