// 금액 포맷팅 함수 - .00은 제거
export const formatPrice = (price: string | number | undefined | null): string => {
  if (price === undefined || price === null) return '0'
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  // NaN 체크
  if (isNaN(numPrice)) return '0'
  
  // 정수인지 확인 (소수점 이하가 0인지)
  if (numPrice % 1 === 0) {
    return Math.round(numPrice).toLocaleString()
  }
  
  // 소수점이 있는 경우 그대로 표시
  return numPrice.toLocaleString()
}