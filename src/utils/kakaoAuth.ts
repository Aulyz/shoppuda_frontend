declare global {
  interface Window {
    Kakao: any;
  }
}

export const getKakaoToken = () => {
  return localStorage.getItem('kakao_access_token');
};

export const refreshKakaoToken = async () => {
  try {
    if (!window.Kakao || !window.Kakao.Auth) {
      throw new Error('Kakao SDK not loaded');
    }

    const refreshToken = localStorage.getItem('kakao_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // 카카오 토큰 갱신
    const response = await new Promise((resolve, reject) => {
      window.Kakao.Auth.refreshAccessToken({
        success: resolve,
        fail: reject
      });
    });

    if (response && (response as any).access_token) {
      localStorage.setItem('kakao_access_token', (response as any).access_token);
      return (response as any).access_token;
    }

    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('카카오 토큰 갱신 실패:', error);
    // 토큰 갱신 실패 시 로그아웃
    localStorage.removeItem('kakao_access_token');
    localStorage.removeItem('kakao_refresh_token');
    throw error;
  }
};

export const isKakaoTokenValid = async () => {
  try {
    if (!window.Kakao || !window.Kakao.Auth) {
      return false;
    }

    const token = getKakaoToken();
    if (!token) {
      return false;
    }

    // 토큰 유효성 검사
    const response = await new Promise((resolve, reject) => {
      window.Kakao.API.request({
        url: '/v1/user/access_token_info',
        success: resolve,
        fail: reject
      });
    });

    return !!response;
  } catch (error) {
    console.error('카카오 토큰 검증 실패:', error);
    return false;
  }
};