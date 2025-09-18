// 브라우저 콘솔에서 실행할 수 있는 디버그 함수들

export const debugAuth = () => {
  // localStorage에서 auth 정보 확인
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    const parsed = JSON.parse(authStorage);
    console.log('🔐 Auth Storage:', parsed);
    console.log('👤 User:', parsed.state?.user);
    console.log('🎫 Has Token:', !!parsed.state?.accessToken);
    return parsed.state;
  } else {
    console.log('❌ No auth storage found');
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('kakao_access_token');
  localStorage.removeItem('kakao_refresh_token');
  console.log('✅ Auth cleared. Please refresh the page.');
};

export const setUserName = (firstName: string) => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    const parsed = JSON.parse(authStorage);
    if (parsed.state?.user) {
      parsed.state.user.first_name = firstName;
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
      console.log('✅ Name updated. Please refresh the page.');
      return true;
    }
  }
  console.log('❌ Could not update name');
  return false;
};

// 브라우저 콘솔에서 사용 가능하도록 전역 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAuth = clearAuth;
  (window as any).setUserName = setUserName;
  console.log('🔧 Debug functions loaded. Available commands:');
  console.log('   debugAuth() - Check current auth state');
  console.log('   clearAuth() - Clear all auth data');
  console.log('   setUserName("이름") - Set user first name');
}