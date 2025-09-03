/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_APP_KEY: string;
  readonly VITE_KAKAO_REDIRECT_URI: string;
  // 필요한 환경변수 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}