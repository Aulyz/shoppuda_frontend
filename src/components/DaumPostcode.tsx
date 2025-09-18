import React, { useEffect, useRef } from 'react'

interface DaumPostcodeProps {
  onComplete: (data: {
    address: string
    zonecode: string
    addressType: string
    bname: string
    buildingName: string
  }) => void
  onClose?: () => void
}

declare global {
  interface Window {
    daum: any
  }
}

const DaumPostcode: React.FC<DaumPostcodeProps> = ({ onComplete, onClose }) => {
  const scriptLoaded = useRef(false)

  useEffect(() => {
    // 모달이 열릴 때 body 스크롤 비활성화
    document.body.style.overflow = 'hidden'

    const loadPostcode = () => {
      // DOM 요소가 준비될 때까지 대기
      setTimeout(() => {
        const element = document.getElementById('daum-postcode-wrap')
        if (element && window.daum && window.daum.Postcode) {
          new window.daum.Postcode({
            oncomplete: function(data: any) {
              let fullAddress = data.address
              let extraAddress = ''

              if (data.addressType === 'R') {
                if (data.bname !== '') {
                  extraAddress += data.bname
                }
                if (data.buildingName !== '') {
                  extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName
                }
                fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''
              }

              onComplete({
                address: fullAddress,
                zonecode: data.zonecode,
                addressType: data.addressType,
                bname: data.bname,
                buildingName: data.buildingName
              })
            },
            onclose: function() {
              if (onClose) {
                onClose()
              }
            },
            width: '100%',
            height: '100%'
          }).embed(element)
        }
      }, 100)
    }

    // 스크립트가 이미 로드되었는지 확인
    if (window.daum && window.daum.Postcode) {
      loadPostcode()
    } else {
      // 스크립트가 없으면 로드
      const script = document.createElement('script')
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        loadPostcode()
      }
    }

    return () => {
      // 컴포넌트 언마운트 시 body 스크롤 복원
      document.body.style.overflow = 'unset'
      scriptLoaded.current = false
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">우편번호 찾기</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div 
          id="daum-postcode-wrap" 
          className="w-full overflow-auto" 
          style={{ height: '450px' }}
        ></div>
      </div>
    </div>
  )
}

export default DaumPostcode