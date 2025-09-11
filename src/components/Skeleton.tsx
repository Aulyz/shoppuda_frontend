import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200px_100%]',
    none: ''
  };
  
  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  };
  
  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
};

// 특화된 스켈레톤 컴포넌트들
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={`h-4 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <Skeleton
      variant="circular"
      className={`${sizes[size]} ${className}`}
    />
  );
};

export const SkeletonButton: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  };
  
  return (
    <Skeleton
      variant="rectangular"
      className={`${sizes[size]} ${className}`}
    />
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg space-y-3 ${className}`}>
      <Skeleton variant="rectangular" className="w-full h-48" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-3/4" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="h-6 w-20" />
        <Skeleton variant="rectangular" className="h-8 w-16" />
      </div>
    </div>
  );
};

// 상품 카드 전용 스켈레톤
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow border border-gray-100 overflow-hidden ${className}`}>
      {/* 이미지 영역 */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-2xl bg-gray-100 relative">
        <Skeleton variant="rectangular" className="w-full h-48" />
        {/* 위시리스트 버튼 */}
        <div className="absolute top-3 right-3">
          <Skeleton variant="circular" className="w-8 h-8" />
        </div>
        {/* 배지 */}
        <div className="absolute top-3 left-3">
          <Skeleton variant="rectangular" className="w-12 h-6 rounded-full" />
        </div>
      </div>
      
      {/* 콘텐츠 영역 */}
      <div className="p-4 space-y-2">
        {/* 브랜드명 */}
        <Skeleton variant="text" className="h-3 w-16" />
        
        {/* 상품명 */}
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-3/4" />
        
        {/* 가격 */}
        <div className="flex items-center space-x-2 pt-1">
          <Skeleton variant="text" className="h-5 w-20" />
          <Skeleton variant="text" className="h-4 w-16" />
        </div>
        
        {/* 평점 */}
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="circular" className="w-3 h-3" />
            ))}
          </div>
          <Skeleton variant="text" className="h-3 w-12" />
        </div>
        
        {/* 장바구니 버튼 */}
        <div className="pt-2">
          <Skeleton variant="rectangular" className="w-full h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// 목록 페이지용 스켈레톤
export const ProductGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 12, 
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// 상품 상세 페이지용 스켈레톤
export const ProductDetailSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 이미지 섹션 */}
        <div className="space-y-4">
          <Skeleton variant="rectangular" className="w-full h-96 rounded-lg" />
          <div className="flex space-x-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" className="w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* 정보 섹션 */}
        <div className="space-y-6">
          {/* 브랜드 */}
          <Skeleton variant="text" className="h-4 w-24" />
          
          {/* 제목 */}
          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-full" />
            <Skeleton variant="text" className="h-8 w-3/4" />
          </div>
          
          {/* 평점 */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="circular" className="w-4 h-4" />
              ))}
            </div>
            <Skeleton variant="text" className="h-4 w-20" />
          </div>
          
          {/* 가격 */}
          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-32" />
            <Skeleton variant="text" className="h-6 w-24" />
          </div>
          
          {/* 옵션 */}
          <div className="space-y-4">
            <Skeleton variant="text" className="h-5 w-16" />
            <Skeleton variant="rectangular" className="h-12 w-full rounded-lg" />
          </div>
          
          {/* 수량 선택 */}
          <div className="flex items-center space-x-4">
            <Skeleton variant="text" className="h-5 w-12" />
            <Skeleton variant="rectangular" className="h-10 w-32 rounded-lg" />
          </div>
          
          {/* 버튼들 */}
          <div className="space-y-3">
            <Skeleton variant="rectangular" className="h-12 w-full rounded-lg" />
            <Skeleton variant="rectangular" className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* 상품 설명 */}
      <div className="mt-12 space-y-4">
        <Skeleton variant="text" className="h-6 w-32" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="text" className="h-4 w-full" />
          ))}
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;