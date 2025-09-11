import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, ClockIcon, FireIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { debounce } from '../utils/debounce';

interface SearchSuggestionsProps {
  isVisible: boolean;
  searchQuery: string;
  onClose: () => void;
  onSearch: (query: string) => void;
}

// 로컬 스토리지 키
const RECENT_SEARCHES_KEY = 'shoppuda_recent_searches';
const MAX_RECENT_SEARCHES = 5;

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  isVisible,
  searchQuery,
  onClose,
  onSearch,
}) => {
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 최근 검색어 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // API에서 검색 제안 가져오기
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await api.getSearchSuggestions(query);
        setSuggestions(response.suggestions || []);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // 인기 검색어 가져오기
  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        const response = await api.getPopularSearches();
        setPopularSearches(response.searches || []);
      } catch (error) {
        console.error('Failed to fetch popular searches:', error);
        // 기본값 사용
        setPopularSearches([
          '아이폰',
          '에어팟',
          '나이키 운동화',
          '맥북',
          '화장품',
          '향수',
          '가방',
          '시계'
        ]);
      }
    };
    
    if (isVisible && !searchQuery.trim()) {
      fetchPopularSearches();
    }
  }, [isVisible, searchQuery]);

  // 검색어 변경 시 제안 가져오기
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
    setSelectedIndex(-1);
  }, [searchQuery, fetchSuggestions]);

  // 최근 검색어 저장
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // 최근 검색어 삭제
  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter(item => item !== query);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // 검색 실행
  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveRecentSearch(query);
      onSearch(query);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + 
                      (searchQuery.trim() ? 0 : recentSearches.length + popularSearches.length);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selectedItem = getSelectedItem();
          if (selectedItem) {
            handleSearch(selectedItem);
          }
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // 선택된 아이템 가져오기
  const getSelectedItem = (): string | null => {
    if (searchQuery.trim()) {
      return suggestions[selectedIndex] || null;
    } else {
      const totalRecent = recentSearches.length;
      if (selectedIndex < totalRecent) {
        return recentSearches[selectedIndex];
      } else {
        return popularSearches[selectedIndex - totalRecent] || null;
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500 mt-2">검색 중...</p>
        </div>
      )}

      {/* 검색어가 있을 때: API 제안 */}
      {!isLoading && searchQuery.trim() && suggestions.length > 0 && (
        <div className="p-2">
          <div className="text-xs text-gray-500 px-3 py-2 font-medium">검색 제안</div>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors ${
                selectedIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
              onClick={() => handleSearch(suggestion)}
            >
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <span className="truncate">
                {/* 검색어 하이라이트 */}
                <span dangerouslySetInnerHTML={{
                  __html: suggestion.replace(
                    new RegExp(`(${searchQuery})`, 'gi'),
                    '<mark class="bg-yellow-200 text-gray-900">$1</mark>'
                  )
                }} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 검색어가 없을 때: 최근 검색어 + 인기 검색어 */}
      {!searchQuery.trim() && (
        <>
          {/* 최근 검색어 */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="text-xs text-gray-500 px-3 py-2 font-medium">최근 검색</div>
              {recentSearches.map((search, index) => (
                <div
                  key={`recent-${search}`}
                  className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md transition-colors ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                >
                  <button
                    className="flex-1 flex items-center text-left"
                    onClick={() => handleSearch(search)}
                  >
                    <ClockIcon className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="truncate text-gray-900">{search}</span>
                  </button>
                  <button
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                    }}
                  >
                    <XMarkIcon className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 인기 검색어 */}
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 font-medium">인기 검색어</div>
            {popularSearches.slice(0, 6).map((search, index) => {
              const actualIndex = recentSearches.length + index;
              return (
                <button
                  key={`popular-${search}`}
                  className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors ${
                    selectedIndex === actualIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                  onClick={() => handleSearch(search)}
                >
                  <FireIcon className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                  <span className="truncate">{search}</span>
                  <span className="ml-auto text-xs text-red-500 font-medium">#{index + 1}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 검색 결과가 없을 때 */}
      {!isLoading && searchQuery.trim() && suggestions.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">'{searchQuery}'에 대한 제안이 없습니다</p>
          <button
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            onClick={() => handleSearch(searchQuery)}
          >
            그래도 검색하기
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;