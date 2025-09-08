import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_logo: string | null;
  contact_email: string;
  contact_phone: string;
  business_hours: string;
  
  // 사업자 정보
  company_name: string;
  ceo_name: string;
  business_address: string;
  business_registration_number: string;
  online_business_number: string;
  privacy_officer: string;
  
  // 결제 정보
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;
  
  // 호스팅 정보
  hosting_provider: string;
  
  // 소셜 미디어
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  twitter_url: string;
  kakao_channel_url: string;
  naver_blog_url: string;
  
  currency_symbol: string;
  currency_code: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  show_top_banner: boolean;
  top_banner_text: string;
  top_banner_link: string;
}

const Footer = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // site_settings API 직접 호출
        const response = await axios.get('http://localhost:8000/api/site/settings/');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch site settings:', error);
        // 기본값 설정
        setSettings({
          site_name: 'ShopPuda',
          site_tagline: '해외 쇼핑, 클릭 한 번으로',
          site_logo: null,
          contact_email: 'seri00413@naver.com',
          contact_phone: '010-2474-0413',
          business_hours: '09:00 ~ 21:00',
          facebook_url: '',
          instagram_url: '',
          youtube_url: '',
          twitter_url: '',
          currency_symbol: '₩',
          currency_code: 'KRW',
          maintenance_mode: false,
          maintenance_message: '',
          show_top_banner: false,
          top_banner_text: '',
          top_banner_link: ''
        });
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-orange-100 via-pink-50 to-orange-50 pt-16 pb-12 text-gray-800">
      <div className="max-w-screen-xl mx-auto px-8">
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="mb-8 md:mb-0 md:flex-shrink-0">
            <div className="mb-8">
              <div className="text-[2.5rem] font-serif font-semibold brand-font bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer">
                {settings?.site_name || 'ShopPuda'}
              </div>
              <div className="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-orange-200 to-pink-200 text-orange-800 rounded-full font-semibold text-base brand-font shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                {settings?.site_tagline || '해외 쇼핑, 클릭 한 번으로'}
              </div>
            </div>
            <nav className="mb-6">
              <ul className="flex flex-wrap gap-8 font-medium text-base">
                <li><Link to="/about" className="hover:text-orange-600 transition-all duration-200 hover:scale-105 relative group">
                  회사소개
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link></li>
                <li><Link to="/terms" className="hover:text-orange-600 transition-all duration-200 hover:scale-105 relative group">
                  이용약관
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link></li>
                <li><Link to="/privacy" className="hover:text-orange-600 font-semibold transition-all duration-200 hover:scale-105 relative group">
                  개인정보처리방침
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link></li>
                <li><Link to="/guide" className="hover:text-orange-600 transition-all duration-200 hover:scale-105 relative group">
                  이용안내
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link></li>
              </ul>
            </nav>
            <div className="mt-8">
              <div className="font-bold mb-4 text-lg text-gray-700">쇼핑몰 기본정보</div>
              <div className="space-y-1 text-sm leading-6">
                <p><span className="font-bold">상호명</span> {settings?.company_name || settings?.site_name || 'ShopPuda'}</p>
                <p><span className="font-bold">대표자명</span> {settings?.ceo_name || '박수빈'}</p>
                <p><span className="font-bold">사업장 주소</span> {settings?.business_address || '서울특별시 강남구'}</p>
                <p><span className="font-bold">대표 전화</span> {settings?.contact_phone || '010-2474-0413'}</p>
                <p><span className="font-bold">사업자 등록번호</span> {settings?.business_registration_number || '123-45-67890'}</p>
                <p><span className="font-bold">통신판매업 신고번호</span> {settings?.online_business_number || '제2024-서울강남-0001호'}</p>
                <p><span className="font-bold">개인정보보호책임자</span> {settings?.privacy_officer || '박수빈'}</p>
              </div>
            </div>
          </div>
          <div className="flex-grow min-w-[220px] md:pl-4">
            <div className="font-bold mb-4 text-lg text-gray-700">고객센터 정보</div>
            <div className="space-y-1 text-sm leading-6">
              <p><span className="font-bold">상담/주문 전화</span> <span className="ml-2">{settings?.contact_phone || '010-2474-0413'}</span></p>
              <p><span className="font-bold">상담/주문 이메일</span> <span className="ml-2">{settings?.contact_email || 'seri00413@naver.com'}</span></p>
              <p><span className="font-bold">CS운영시간</span> {settings?.business_hours || '09:00 ~ 21:00'}</p>
            </div>
          </div>
          <div className="flex-grow min-w-[220px] md:pl-4">
            <div className="font-bold mb-4 text-lg text-gray-700">결제정보</div>
            <div className="space-y-1 text-sm leading-6">
              <p><span className="font-bold">무통장 계좌정보</span></p>
              <p>
                <span>{settings?.bank_name || '은행'}</span> 
                <span className="ml-4">{settings?.bank_account_number || '0000-000-00000'}</span> 
                <span className="ml-4">예금주: {settings?.bank_account_holder || '예금주'}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="border-t-2 border-gradient-to-r from-orange-200 to-pink-200 pt-6 mt-12 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="mb-3 md:mb-0">
            Copyright © {settings?.site_name || 'ShopPuda'}. All Rights Reserved. Hosting by {settings?.hosting_provider || 'Cafe24 Corp.'}.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700 mr-4 text-lg">SNS</span>
            {settings?.instagram_url && (
              <a href={settings.instagram_url} aria-label="instagram" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-pink-600 transition-all duration-300 hover:scale-110">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            )}
            {settings?.youtube_url && (
              <a href={settings.youtube_url} aria-label="youtube" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-red-600 transition-all duration-300 hover:scale-110">
                <i className="fab fa-youtube text-xl"></i>
              </a>
            )}
            {settings?.facebook_url && (
              <a href={settings.facebook_url} aria-label="facebook" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-blue-600 transition-all duration-300 hover:scale-110">
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
            )}
            {settings?.twitter_url && (
              <a href={settings.twitter_url} aria-label="twitter" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-blue-400 transition-all duration-300 hover:scale-110">
                <i className="fab fa-twitter text-xl"></i>
              </a>
            )}
            {/* 기본 SNS 아이콘들 - URL이 없어도 표시 */}
            {!settings?.instagram_url && (
              <a href="#" aria-label="instagram" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-pink-600 transition-all duration-300 hover:scale-110">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            )}
            {!settings?.youtube_url && (
              <a href="#" aria-label="youtube" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-red-600 transition-all duration-300 hover:scale-110">
                <i className="fab fa-youtube text-xl"></i>
              </a>
            )}
            {!settings?.facebook_url && (
              <a href="#" aria-label="facebook" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-blue-600 transition-all duration-300 hover:scale-110">
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
            )}
            {settings?.kakao_channel_url ? (
              <a href={settings.kakao_channel_url} aria-label="kakao" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-yellow-600 transition-all duration-300 hover:scale-110">
                <i className="fa fa-comment text-xl"></i>
              </a>
            ) : (
              <a href="#" aria-label="kakao" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-yellow-600 transition-all duration-300 hover:scale-110">
                <i className="fa fa-comment text-xl"></i>
              </a>
            )}
            {settings?.naver_blog_url ? (
              <a href={settings.naver_blog_url} aria-label="blog" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-green-600 transition-all duration-300 hover:scale-110">
                <i className="fab fa-blogger-b text-xl"></i>
              </a>
            ) : (
              <a href="#" aria-label="blog" className="p-2 rounded-full hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100 hover:text-orange-600 transition-all duration-300 hover:scale-110">
                <i className="fab fa-blogger-b text-xl"></i>
              </a>
            )}
          </div>
        </div>
      </div >
    </footer >
  );
};

export default Footer;