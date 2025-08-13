// src/pages/company/MyPage.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoItem from '../../components/company/InfoItem';
import { useNavigate } from 'react-router-dom';


import useDeliveryFilter from '../../hook/company/useDeliveryFilter';

import './MyPage.css';
import { logout } from '../../slice/company/companySlice';

const MyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, deliveryList, filteredList } = useSelector((state) => state.company);

  const {
    status,
    driverName,
    trackingNumber,
    handleChange,
    handleReset,
    STATUS_OPTIONS,
  } = useDeliveryFilter();

  const [showFullAccount, setShowFullAccount] = useState(true);
  const maskedAccount = userInfo?.accountNumber
    ? userInfo.accountNumber.slice(0, -7) + '•'.repeat(7)
    : '';

  // ✅ 임시 데이터 삽입 (실서버 연동 시 제거)
  useEffect(() => {
    const mockUser = {
      companyName: "테스트 주식회사",
      email: "test@example.com",
      phone: "010-1234-5678",
      address: "서울특별시 강남구 역삼동",
      bizNumber: "123-45-67890",
      accountNumber: "12345678901234",
    };

    const mockDeliveries = [
      {
        title: "전자제품 배송",
        trackingNumber: "TRK12345678",
        driverName: "홍길동",
        status: "배송완료",
        paymentMethod: "카드결제",
        price: 25000,
      },
      {
        title: "사무용 가구",
        trackingNumber: "TRK87654321",
        driverName: "이몽룡",
        status: "배송중",
        paymentMethod: "계좌이체",
        price: 42000,
      },
      {
        title: "식자재",
        trackingNumber: "TRK55553333",
        driverName: "성춘향",
        status: "배송시작",
        paymentMethod: "무통장",
        price: 31000,
      },
      {
        title: "생활용품",
        trackingNumber: "TRK99990000",
        driverName: "변학도",
        status: "주문접수",
        paymentMethod: "카드결제",
        price: 18000,
      },
    ];

    dispatch({ type: "company/fetchUserInfo/fulfilled", payload: mockUser });
    dispatch({ type: "company/fetchDeliveryList/fulfilled", payload: mockDeliveries });
  }, [dispatch]);

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
      <h2 className="mypage-title">마이페이지</h2>

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
        <InfoItem label="회사명" value={userInfo?.companyName} />
        <InfoItem label="이메일" value={userInfo?.email} />
        <InfoItem label="연락처" value={userInfo?.phone} />
        <InfoItem label="회사 주소" value={userInfo?.address} />
        <InfoItem label="사업자 등록번호" value={userInfo?.bizNumber} />
        <div className="info-item">
          <span className="info-label">메인 계좌</span>
          <span className="info-value">
            {showFullAccount ? userInfo?.accountNumber : maskedAccount}
            <button className="mask-toggle" onClick={() => setShowFullAccount(prev => !prev)}>
              {showFullAccount ? "숨기기" : "보이기"}
            </button>
          </span>
        </div>
      </div>

      {/* 배송 검색 필터 (✅ 상태 필터로 변경, 도착날짜 제거) */}
      <div className="delivery-filter">
        <select
          value={status}
          onChange={(e) => handleChange("status", e.target.value)}
          className="status-select"
        >
          <option value="">전체 상태</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="기사명"
          value={driverName}
          onChange={(e) => handleChange("driverName", e.target.value)}
        />
        <input
          type="text"
          placeholder="운송장번호"
          value={trackingNumber}
          onChange={(e) => handleChange("trackingNumber", e.target.value)}
        />
        <button className="filter-btn" onClick={() => handleChange("search")}>검색</button>
        <button className="filter-btn" onClick={handleReset}>초기화</button>
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
