import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { updateCompanyProfile } from '../../api/company/companyApi';
import './CompanyEditPage.css';

const CompanyEditPage = () => {
  const navigate = useNavigate();
  const { userInfo, myPageInfo, snsLogin } = useSelector((s) => s.company);
   
  // localStorage에서 사용자 정보 가져오기 (백업)
  const loginType = localStorage.getItem('loginType');
  const isSocialUser = snsLogin || !!(loginType && (loginType === 'google' || loginType === 'kakao'));
  
  

  // 폼 상태
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    email: '',
    pnumber: '',
    businessN: '',
    account: '',
    address: '',
    detailAddress: ''
  });

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 초기 데이터 로드 - myPageInfo 우선, userInfo 백업, localStorage 최후
  useEffect(() => {
    console.log('🔄 useEffect 실행 - myPageInfo:', myPageInfo, 'userInfo:', userInfo);
    
         if (myPageInfo && Object.keys(myPageInfo).length > 0) {
       console.log('✅ myPageInfo에서 데이터 로드:', myPageInfo);
       
               // 소셜 사용자이고 회원정보가 없는 경우 localStorage 정리
        if (isSocialUser) {
          const hasProfileInfo = !!(myPageInfo.pnumber || myPageInfo.account || myPageInfo.businessN || myPageInfo.address);
          console.log('🔍 소셜 사용자 localStorage 정리 확인:', {
            hasProfileInfo,
            pnumber: myPageInfo.pnumber,
            account: myPageInfo.account,
            businessN: myPageInfo.businessN,
            address: myPageInfo.address
          });
          
          if (!hasProfileInfo) {
            console.log('🧹 소셜 사용자 + 회원정보 없음 → localStorage 정리 시작');
            localStorage.removeItem('userPnumber');
            localStorage.removeItem('userBusinessN');
            localStorage.removeItem('userAccount');
            localStorage.removeItem('userAddress');
            console.log('🧹 localStorage 정리 완료');
          } else {
            console.log('✅ 소셜 사용자 + 회원정보 있음 → localStorage 정리 불필요');
          }
        }
       
       setFormData({
         password: '',
         confirmPassword: '',
         email: myPageInfo.email || '',
         pnumber: myPageInfo.pnumber || '', // myPageInfo의 pnumber (소문자 p)
         businessN: myPageInfo.businessN || '', // myPageInfo의 businessN
         account: myPageInfo.account || '', // myPageInfo의 account
         address: myPageInfo.address || '', // myPageInfo의 address
         detailAddress: ''
       });
    } else {
      console.log('⚠️ myPageInfo가 비어있음, 기본값으로 초기화');
      setFormData({
        password: '',
        confirmPassword: '',
        email: '',
        pnumber: '',
        businessN: '',
        account: '',
        address: '',
        detailAddress: ''
      });
    }
  }, [myPageInfo, userInfo]);

  // 본인인증 확인 - 소셜 사용자 + 회원정보 없음인 경우 건너뛰기
  useEffect(() => {
    const isVerified = sessionStorage.getItem("company_edit_verified");
    
    console.log('🔍 본인인증 확인 로직 실행:', {
      isSocialUser,
      snsLogin,
      loginType: localStorage.getItem('loginType'),
      myPageInfo: !!myPageInfo,
      isVerified: !!isVerified
    });
    
    // myPageInfo가 로드되지 않았으면 대기
    if (!myPageInfo) {
      console.log('⏳ myPageInfo 로딩 대기 중...');
      return;
    }
    
              // 소셜 사용자는 회원정보 유무에 따라 다르게 처리
     if (isSocialUser) {
       const hasProfileInfo = !!(myPageInfo.pnumber || myPageInfo.account || myPageInfo.businessN || myPageInfo.address);
       console.log('🔍 소셜 사용자 회원정보 확인:', {
         pnumber: myPageInfo.pnumber,
         account: myPageInfo.account,
         businessN: myPageInfo.businessN,
         address: myPageInfo.address,
         hasProfileInfo
       });
       
       if (!hasProfileInfo) {
         console.log('✅ 소셜 사용자 + 회원정보 없음 → 본인인증 건너뛰기');
         // localStorage 정리
         localStorage.removeItem('userPnumber');
         localStorage.removeItem('userBusinessN');
         localStorage.removeItem('userAccount');
         localStorage.removeItem('userAddress');
         console.log('🧹 localStorage 정리 완료');
         return; // 본인인증 확인 건너뛰기
       } else {
         console.log('🔒 소셜 사용자 + 회원정보 있음 → 본인인증 필요 (소셜 재인증)');
         // 회원정보가 있으면 본인인증 필요
       }
     }
     
     // 로컬 사용자이거나 회원정보가 있는 소셜 사용자는 본인인증 필요
     if (!isVerified) {
       console.log('🔒 본인인증 필요 → verify 페이지로 이동');
       navigate("/company/verify");
     } else {
       console.log('✅ 본인인증 완료됨');
     }
  }, [navigate, isSocialUser, myPageInfo]);

  

  // 전화번호 자동 포맷팅 함수
  const formatPhoneNumber = (numbersOnly) => {
    // 한국 전화번호 형식 정의
    const areaCodes = ['02', '031', '032', '033', '041', '043', '042', '044', '051', '052', '053', '054', '055', '061', '062', '063', '064', '070'];
    const mobileCodes = ['010', '011', '016', '017', '019'];
    
    let formattedNumber = '';
    
    if (numbersOnly.length === 0) {
      return '';
    }
    
    // 지역번호 (02: 서울, 03x: 경기/인천, 04x: 강원/충청, 05x: 전라/부산/대구/울산, 06x: 경상/제주, 070: 인터넷전화)
    if (areaCodes.includes(numbersOnly.slice(0, 2)) || areaCodes.includes(numbersOnly.slice(0, 3))) {
      const areaCode = areaCodes.includes(numbersOnly.slice(0, 2)) ? numbersOnly.slice(0, 2) : numbersOnly.slice(0, 3);
      const remaining = numbersOnly.slice(areaCode.length);
      
      if (remaining.length <= 3) {
        formattedNumber = `${areaCode}-${remaining}`;
      } else if (remaining.length <= 7) {
        formattedNumber = `${areaCode}-${remaining.slice(0, 3)}-${remaining.slice(3)}`;
      } else {
        formattedNumber = `${areaCode}-${remaining.slice(0, 3)}-${remaining.slice(3, 7)}`;
      }
    }
    // 휴대폰 번호
    else if (mobileCodes.includes(numbersOnly.slice(0, 3))) {
      if (numbersOnly.length <= 3) {
        formattedNumber = numbersOnly;
      } else if (numbersOnly.length <= 7) {
        formattedNumber = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
      } else {
        formattedNumber = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`;
      }
    }
    // 기타 번호 (기본 형식)
    else {
      if (numbersOnly.length <= 4) {
        formattedNumber = numbersOnly;
      } else if (numbersOnly.length <= 8) {
        formattedNumber = `${numbersOnly.slice(0, 4)}-${numbersOnly.slice(4)}`;
      } else {
        formattedNumber = `${numbersOnly.slice(0, 4)}-${numbersOnly.slice(4, 8)}-${numbersOnly.slice(8, 12)}`;
      }
    }
    
    return formattedNumber;
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 연락처 자동 포맷팅
    if (name === 'pnumber') {
      const numbersOnly = value.replace(/\D/g, ''); // 숫자만 추출
      const formattedNumber = formatPhoneNumber(numbersOnly);
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 주소 검색 핸들러 (기존 방식)
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        setFormData(prev => ({
          ...prev,
          address: data.address
        }));
      }
    }).open();
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // JWT 토큰 상태 확인
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('로그인이 필요합니다. 다시 로그인해주세요.');
      return;
    }

    // 수정된 필드만 수집
    const updateData = {};
    let hasChanges = false;

    // 비밀번호 검증 (소셜 사용자 제외)
    if (!isSocialUser) {
      if (formData.password || formData.confirmPassword) {
        if (!formData.password || !formData.confirmPassword) {
          setError('비밀번호와 비밀번호 확인을 모두 입력해주세요.');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          return;
        }
        if (formData.password.length < 4) {
          setError('비밀번호는 최소 4자 이상이어야 합니다.');
          return;
        }
        updateData.password = formData.password;
        hasChanges = true;
      }
    } else {
      // 소셜 사용자는 비밀번호 수정 시도 시 에러
      if (formData.password || formData.confirmPassword) {
        setError('소셜 로그인 사용자는 비밀번호를 이 페이지에서 수정할 수 없습니다.');
        return;
      }
    }

         // 이메일 검증 및 수정 (빈 값이 아닌 경우에만)
     if (formData.email !== '' && formData.email !== myPageInfo?.email) {
       updateData.email = formData.email;
       hasChanges = true;
     }

     // 연락처 검증 및 수정 (빈 값이 아닌 경우에만)
     if (formData.pnumber !== '' && formData.pnumber !== myPageInfo?.pnumber) {
       updateData.pnumber = formData.pnumber;
       hasChanges = true;
     }

     // 사업자등록번호 검증 및 수정 (빈 값이 아닌 경우에만)
     if (formData.businessN !== '' && formData.businessN !== myPageInfo?.businessN) {
       updateData.businessN = formData.businessN;
       hasChanges = true;
     }

     // 계좌번호 검증 및 수정 (빈 값이 아닌 경우에만)
     if (formData.account !== '' && formData.account !== myPageInfo?.account) {
       updateData.account = formData.account;
       hasChanges = true;
     }

     // 주소 검증 및 수정 (빈 값이 아닌 경우에만)
     const fullAddress = formData.detailAddress ? `${formData.address} ${formData.detailAddress}` : formData.address;
     if (fullAddress !== '' && fullAddress !== myPageInfo?.address) {
       updateData.address = fullAddress;
       hasChanges = true;
     }

    // 변경사항이 없으면 에러 메시지
    if (!hasChanges) {
      setError('수정할 내용이 없습니다. 하나 이상의 필드를 수정해주세요.');
      return;
    }

    try {
      setLoading(true);

      // updateData는 이미 위에서 수정된 필드만 포함하도록 구성됨
      
             // 전송 데이터 및 토큰 상태 확인
       console.log('📤 전송할 데이터:', updateData);
       console.log('🔑 JWT 토큰 상태:', accessToken ? '존재함' : '없음');
       console.log('👤 현재 사용자 정보:', userInfo);

      // API 호출
      const response = await updateCompanyProfile(updateData);
      
             if (response.ok) {
         setSuccess('회원정보가 성공적으로 수정되었습니다.');
         
                   // localStorage에 업데이트된 정보 저장
          if (updateData.email) localStorage.setItem('userEmail', updateData.email);
          if (updateData.pnumber) localStorage.setItem('userPnumber', updateData.pnumber);
          if (updateData.businessN) localStorage.setItem('userBusinessN', updateData.businessN);
          if (updateData.account) localStorage.setItem('userAccount', updateData.account);
          if (updateData.address) localStorage.setItem('userAddress', updateData.address);
          
          console.log('💾 localStorage 업데이트 완료:', updateData);
         
         // 2초 후 company 메인 페이지로 이동
         setTimeout(() => {
           navigate("/company");
         }, 2000);
              } else {
         setError(response.message || '회원정보 수정에 실패했습니다.');
         // 에러 발생 시에도 3초 후 company 페이지로 이동
         setTimeout(() => {
           navigate("/company");
         }, 3000);
       }

     } catch (error) {
       console.error('회원정보 수정 오류:', error);
       setError('회원정보 수정 중 오류가 발생했습니다.');
       // 에러 발생 시에도 3초 후 company 페이지로 이동
       setTimeout(() => {
         navigate("/company");
       }, 3000);
     } finally {
       setLoading(false);
     }
  };

  const goBack = () => navigate("/company");

  return (
         <div className="edit-wrap">
       <h2 className="edit-title">회원정보 수정</h2>
       <p className="edit-subtitle">수정하고 싶은 항목만 입력하세요. 빈 필드는 기존 정보가 유지됩니다.</p>

      <div className="edit-card">
        <form onSubmit={handleSubmit}>
          {/* 비밀번호 수정 (소셜 사용자 제외) */}
          {!isSocialUser && (
            <>
              <label className="field">
                <span>새 비밀번호</span>
                                 <input
                   type="password"
                   name="password"
                   value={formData.password}
                   onChange={handleInputChange}
                   placeholder="새 비밀번호를 입력하세요"
                   minLength="4"
                 />
              </label>

              <label className="field">
                <span>비밀번호 확인</span>
                                 <input
                   type="password"
                   name="confirmPassword"
                   value={formData.confirmPassword}
                   onChange={handleInputChange}
                   placeholder="새 비밀번호를 다시 입력하세요"
                   minLength="4"
                 />
              </label>
            </>
          )}

          {/* 소셜 사용자 비밀번호 수정 제한 안내 */}
          {isSocialUser && (
            <div className="social-notice">
              <p>🔐 소셜 로그인 사용자는 비밀번호를 이 페이지에서 수정할 수 없습니다.</p>
              <p>비밀번호 변경이 필요한 경우 소셜 계정 설정에서 변경해주세요.</p>
            </div>
          )}

          {/* 기본 정보 */}
          <label className="field">
            <span>이메일</span>
                         <input
               type="email"
               name="email"
               value={formData.email}
               onChange={handleInputChange}
               placeholder="example@company.com"
             />
          </label>

                     <label className="field">
             <span>연락처</span>
                           <input
                type="text"
                name="pnumber"
                value={formData.pnumber}
                onChange={handleInputChange}
                placeholder="01012345678 (숫자만 입력)"
                maxLength="13"
              />
                           <small className="field-hint">
                숫자만 입력하면 자동으로 포맷팅됩니다.<br/>
                📞 휴대폰: 010-1234-5678, 📞 지역번호: 02-1234-5678, 031-123-4567
              </small>
           </label>

          <label className="field">
            <span>사업자등록번호</span>
                                                   <input
                type="text"
                name="businessN"
                value={formData.businessN}
                onChange={handleInputChange}
                placeholder="새 사업자등록번호를 입력하세요"
              />
          </label>

          <label className="field">
            <span>계좌번호</span>
                                                   <input
                type="text"
                name="account"
                value={formData.account}
                onChange={handleInputChange}
                placeholder="새 계좌번호를 입력하세요"
              />
          </label>

          {/* 주소 설정 */}
          <div className="address-section">
            <label className="field">
              <span>주소</span>
              <div className="address-input-group">
                                                                   <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="주소를 입력하세요"
                    readOnly
                  />
                                 <button
                   type="button"
                   className="address-search-btn"
                   onClick={handleAddressSearch}
                 >
                   주소 검색
                 </button>
              </div>
            </label>

            <label className="field">
              <span>상세주소</span>
                             <input
                 type="text"
                 name="detailAddress"
                 value={formData.detailAddress}
                 onChange={handleInputChange}
                 placeholder="상세주소를 입력하세요 (건물명, 호수 등)"
               />
            </label>
          </div>

          {/* 액션 버튼 */}
          <div className="action-row">
            <button type="button" className="secondary" onClick={goBack}>
              취소
            </button>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? '저장 중...' : '변경하기'}
            </button>
          </div>
        </form>

        {/* 에러 및 성공 메시지 */}
        {error && <div className="error-text" aria-live="assertive">{error}</div>}
        {success && <div className="success-text" aria-live="assertive">{success}</div>}
      </div>

      
    </div>
  );
};

export default CompanyEditPage;

