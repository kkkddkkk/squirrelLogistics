// src/pages/company/MyPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoItem from '../../components/company/InfoItem';
import { useNavigate } from 'react-router-dom';

import useDeliveryFilter from '../../hook/company/useDeliveryFilter';
import './MyPage.css';

import {
  logout,
  fetchDeliveryList,
  fetchCompanyMyPageInfo,
} from '../../slice/company/companySlice';

const MyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { deliveryList, filteredList, myPageInfo, isLoading, error } = useSelector((state) => state.company);

  const {
    status,
    driverName,
    trackingNumber,
    handleChange,
    handleReset,
    STATUS_OPTIONS,
  } = useDeliveryFilter();

  const [showFullAccount, setShowFullAccount] = useState(false); // 기본값을 false로 설정하여 계좌번호 숨김 상태로 시작
  
  // 계좌번호 마스킹 처리 (안전한 처리)
  const maskedAccount = useMemo(() => {
    if (!myPageInfo?.account) return '';
    
    const account = myPageInfo.account;
    if (account.length <= 4) {
      // 계좌번호가 4자리 이하면 전체를 마스킹
      return '•'.repeat(account.length);
    } else {
      // 앞부분은 보여주고 뒷부분 4자리는 마스킹 (더 안전)
      return account.slice(0, -4) + '•'.repeat(4);
    }
  }, [myPageInfo?.account]);

  // ✅ 실제 서버 데이터 불러오기
  useEffect(() => {
    dispatch(fetchCompanyMyPageInfo());
    dispatch(fetchDeliveryList());
  }, [dispatch]);

  useEffect(() => {
    if (myPageInfo) {
      console.log('마이페이지 정보 로드됨:', myPageInfo);
      console.log('연락처(pnumber):', myPageInfo.pnumber);
      console.log('이름:', myPageInfo.name);
      console.log('이메일:', myPageInfo.email);
    }
  }, [myPageInfo]);

  useEffect(() => {
    if (error) {
      console.error('마이페이지 데이터 로딩 실패:', error);
    }
  }, [error]);

  // (선택) 탭으로 돌아왔을 때 최신화하고 싶다면 아래 주석 해제
  // useEffect(() => {
  //   const onFocus = () => dispatch(fetchUserInfo());
  //   window.addEventListener('focus', onFocus);
  //   return () => window.removeEventListener('focus', onFocus);
  // }, [dispatch]);

  const deliveries = filteredList.length ? filteredList : deliveryList;

  // 📌 내가 쓴 리뷰 보기
  const handleMyReviews = () => {
    navigate('/company/my-reviews');
  };

  // 📌 회원탈퇴
  const handleDeleteAccount = () => {
    if (window.confirm('정말 탈퇴하시겠습니까?')) {
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();
      navigate('/');
    }
  };

  return (
    <div className="mypage-container">
      
      {/* 회원정보 */}
      <div className="info-section">
        <div className="info-header">
          <h3>회원정보</h3>
          <img
            src="/images/edit.png"
            alt="수정"
            className="edit-images"
            onClick={() => navigate('/company/verify')}
          />
        </div>
        
        {isLoading ? (
          <div className="loading-message">데이터를 불러오는 중...</div>
        ) : error ? (
          <div className="error-message">데이터를 불러올 수 없습니다. 다시 시도해주세요.</div>
        ) : (
          <>
            <InfoItem label="이름" value={myPageInfo?.name || "정보 없음"} />
            <InfoItem label="이메일" value={myPageInfo?.email || "정보 없음"} />
            <InfoItem label="연락처" value={myPageInfo?.pnumber || "정보 없음"} />
            <InfoItem label="회사 주소" value={myPageInfo?.address || "정보 없음"} />
            <InfoItem label="사업자 등록번호" value={myPageInfo?.businessN || "정보 없음"} />

            {/* 계좌번호는 별도로 처리 (숨기기/보이기 기능 포함) */}
            <div className="info-item">
              <span className="info-label">계좌번호</span>
              <span className="info-value">
                {showFullAccount ? (myPageInfo?.account || "정보 없음") : (maskedAccount || "정보 없음")}
                {myPageInfo?.account && (
                  <button 
                    className="mask-toggle" 
                    onClick={() => setShowFullAccount(prev => !prev)}
                    disabled={!myPageInfo?.account}
                  >
                    {showFullAccount ? "숨기기" : "보이기"}
                  </button>
                )}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 배송 검색 필터 */}
      <div className="delivery-filter">
        
      </div>

      {/* 배송 정보 테이블 */}
      <div className="delivery-section">
        <h3>배송 정보</h3>
        <table className="delivery-table">
          <thead>
            <tr>
              <th>상품 제목</th>
              <th>운송장 번호</th>
              <th>기사명</th>
              <th>배송 상태</th>
              <th>결제 방법</th>
              <th>금액</th>
            </tr>
          </thead>
          <tbody>
            {(!deliveries || deliveries.length === 0) ? (
              <tr>
                <td colSpan={6} className="no-delivery">
                  배송 정보가 없습니다.
                </td>
              </tr>
            ) : (
              deliveries.map((item, i) => (
                <tr key={i}>
                  <td>{item.title}</td>
                  <td>{item.trackingNumber}</td>
                  <td>{item.driverName}</td>
                  <td>{item.status}</td>
                  <td>{item.paymentMethod}</td>
                  <td>{item.price?.toLocaleString()}원</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 버튼 */}
      <div className="mypage-bottom-buttons">
        <button className="bottom-btn review" onClick={handleMyReviews}>
          내가 쓴 리뷰 보기
        </button>
        <button className="withdraw-link" onClick={handleDeleteAccount}>
          회원탈퇴
        </button>
      </div>
    </div>
  );
};

export default MyPage;
