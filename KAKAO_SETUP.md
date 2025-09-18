# 카카오 로그인 설정 가이드

## 1. 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 접속
2. 앱 생성 또는 기존 앱 선택
3. **플랫폼** 설정:
   - `웹` 플랫폼 추가
   - 사이트 도메인: `http://localhost:3001` (개발 환경)
   - 사이트 도메인: `https://your-domain.com` (운영 환경)

4. **카카오 로그인** 활성화:
   - 제품 설정 > 카카오 로그인 > 활성화 설정: ON
   - OpenID Connect 활성화: ON (선택사항)

5. **Redirect URI** 설정:
   - 개발: `http://localhost:3001`
   - 운영: `https://your-domain.com`

6. **동의항목** 설정:
   - 닉네임: 선택동의
   - 프로필 사진: 선택동의  
   - 카카오계정(이메일): 선택동의

7. **JavaScript 키** 복사:
   - 앱 설정 > 앱 키 > JavaScript 키 복사
   - `.env` 파일의 `VITE_KAKAO_APP_KEY`에 설정

## 2. 환경변수 설정

`.env` 파일에 다음과 같이 설정:

```env
VITE_KAKAO_APP_KEY=your_javascript_key_here
VITE_API_BASE_URL=http://localhost:8000
```

## 3. 사용 방법

1. 로그인 페이지(`/login`)에서 카카오 로그인 버튼 클릭
2. 카카오 로그인 팝업에서 로그인 진행
3. 로그인 성공 시 자동으로 메인 페이지로 이동
4. 사용자 정보는 zustand store에 저장
5. 카카오 토큰은 localStorage에 저장

## 4. 개발 시 주의사항

- HTTPS가 아닌 HTTP에서는 일부 기능이 제한될 수 있음
- 카카오 개발자 콘솔에서 도메인이 정확히 설정되어야 함
- JavaScript 키는 클라이언트에서 사용되므로 보안에 주의

## 5. 백엔드 연동

프론트엔드에서는 카카오 토큰을 `X-Kakao-Token` 헤더로 전송합니다.
백엔드에서는 이 토큰을 사용하여 카카오 API로 사용자 정보를 검증할 수 있습니다.

```javascript
// API 요청 시 자동으로 헤더에 포함됨
headers: {
  'X-Kakao-Token': 'kakao_access_token_here'
}
```