// src/pages/company/MyPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoItem from '../../components/company/InfoItem';
import { useNavigate } from 'react-router-dom';

import useDeliveryFilter from '../../hook/company/useDeliveryFilter';
import './MyPage.css';

import {
  logout,
  fetchCompanyMyPageInfo,
} from '../../slice/company/companySlice';
import { getMyPageInfo, getDeliveryList } from '../../api/company/companyApi';

const MyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myPageInfo, isLoading, error } = useSelector((state) => state.company);

  const {
    status,
    name,
    trackingNumber,
    handleChange,
    handleReset,
    STATUS_OPTIONS,
  } = useDeliveryFilter();

  const [showFullAccount, setShowFullAccount] = useState(false); 
  
  // 배송 리스트 관련 state
  const [statusFilter, setStatusFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('');
  const [appliedNameFilter, setAppliedNameFilter] = useState('');
  const [deliveryList, setDeliveryList] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  
  // 계좌번호 마스킹 처리
  const maskedAccount = useMemo(() => {
    if (!myPageInfo?.account) return '';
    const account = myPageInfo.account;
    if (account.length <= 4) {
      return '•'.repeat(account.length);
    } else {
      return account.slice(0, -4) + '•'.repeat(4);
    }
  }, [myPageInfo?.account]);

  // ✅ 서버 데이터 불러오기
  useEffect(() => {
    dispatch(fetchCompanyMyPageInfo());
  }, [dispatch]);

  // 배송 데이터 불러오기
  useEffect(() => {
    const loadDeliveryData = async () => {
      if (myPageInfo?.companyId) {
        setDeliveryLoading(true);
        try {
          const deliveryData = await getDeliveryList();
          console.log('배송 데이터 로드됨:', deliveryData);
          if (deliveryData && Array.isArray(deliveryData)) {
            deliveryData.forEach((item, index) => {
              console.log(`배송 ${index + 1} 상세:`, {
                requestId: item.requestId,
                name: item.name,          // ✅ driverName → name
                status: item.status,      // ✅ deliveryStatus → status
                payMethod: item.payMethod,
                displayFee: item.displayFee,
                payAmount: item.payAmount, // ✅ estimatedFee → payAmount
                actualFee: item.actualFee,
                cargoType: item.cargoType,
                startAddress: item.startAddress,
                endAddress: item.endAddress
              });
            });
            setDeliveryList(deliveryData);
          }
        } catch (error) {
          console.error('배송 데이터 로드 실패:', error);
        } finally {
          setDeliveryLoading(false);
        }
      }
    };
    loadDeliveryData();
  }, [myPageInfo?.companyId]);

  useEffect(() => {
    if (myPageInfo) {
      console.log('마이페이지 정보 로드됨:', myPageInfo);
    }
  }, [myPageInfo]);

  useEffect(() => {
    if (error) {
      console.error('마이페이지 데이터 로딩 실패:', error);
    }
  }, [error]);

  // 배송 리스트 필터링
  const filteredDeliveries = useMemo(() => {
    if (!deliveryList || deliveryList.length === 0) return [];
    return deliveryList.filter(item => {
      const matchesName = !appliedNameFilter || 
        (item.name && item.name.toLowerCase().includes(appliedNameFilter.toLowerCase()));
      const matchesStatus = !appliedStatusFilter || item.status === appliedStatusFilter;
      return matchesName && matchesStatus;
    });
  }, [deliveryList, appliedNameFilter, appliedStatusFilter]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const handleNameChange = (e) => {
    setNameFilter(e.target.value);
  };
  
  const handleSearch = () => {
    setAppliedStatusFilter(statusFilter);
    setAppliedNameFilter(nameFilter);
  };
  
  const handleFilterReset = () => {
    setStatusFilter('');
    setNameFilter('');
    setAppliedStatusFilter('');
    setAppliedNameFilter('');
  };

  // 📌 이용기록 보기
  const moveToAnotherDay = () => {
    navigate('/company/history');
  };

  // 📌 회원탈퇴
  const handleWithdraw = async () => {
    if (window.confirm('정말 회원 탈퇴하시겠습니까?')) {
      try {
        // 회원탈퇴 API 호출
        const response = await fetch('/api/company/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT 토큰이 있다면
          },
          body: JSON.stringify({
            userId: myPageInfo?.userId
          })
        });

        if (response.ok) {
          alert('회원탈퇴가 완료되었습니다.');
          // 로그아웃 처리
          dispatch(logout());
          localStorage.clear();
          sessionStorage.clear();
          navigate('/');
        } else {
          alert('회원탈퇴 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('회원탈퇴 실패:', error);
        alert('회원탈퇴 처리 중 오류가 발생했습니다.');
      }
    }
  };



  return (
    <div className="mypage-container">
      
      {/* 페이지 제목 */}
      <div className="mypage-title">
        <h1>마이페이지</h1>
      </div>
      
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
          <div className="error-message">데이터를 불러올 수 없습니다.</div>
        ) : (
          <>
            <InfoItem label="이름" value={myPageInfo?.name || "정보 없음"} />
            <InfoItem label="이메일" value={myPageInfo?.email || "정보 없음"} />
            <InfoItem label="연락처" value={myPageInfo?.pnumber || "정보 없음"} />
            <InfoItem label="회사 주소" value={myPageInfo?.address || "정보 없음"} />
            <InfoItem label="사업자 등록번호" value={myPageInfo?.businessN || "정보 없음"} />

            {/* 계좌번호 */}
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

      {/* 배송 정보 */}
      <div className="delivery-section">
        <h3>배송 정보</h3>
        
        {/* 검색 및 필터 */}
        <div className="delivery-filter">
          <div className="filter-row">
            <div className="filter-item">
              <label htmlFor="name">기사명:</label>
              <input
                type="text"
                id="name"
                value={nameFilter}
                onChange={handleNameChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="기사명을 입력하세요"
              />
            </div>
            <div className="filter-item">
              <label htmlFor="status">배송 상태:</label>
              <select
                id="status"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="">전체</option>
                <option value="주문접수">주문접수</option>
                <option value="배송중">배송중</option>
                <option value="배송완료">배송완료</option>
                <option value="취소">취소</option>
              </select>
            </div>
            <button className="filter-search-btn" onClick={handleSearch}>
              검색
            </button>
            <button className="filter-reset-btn" onClick={handleFilterReset}>
              초기화
            </button>
          </div>
        </div>
        
        {/* 배송 테이블 */}
        <div className="delivery-table-container">
          {deliveryLoading ? (
            <div className="loading-message">배송 정보를 불러오는 중...</div>
          ) : (
            <table className="delivery-table">
              <thead>
                <tr>
                  <th>기사명</th>
                  <th>화물 종류</th>
                  <th>배송 상태</th>
                  <th>결제 방법</th>
                  <th>금액</th>
                  <th>출발지</th>
                  <th>도착지</th>
                </tr>
              </thead>
              <tbody>
                {(!filteredDeliveries || filteredDeliveries.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="no-delivery">
                      배송 정보가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name !== null ? item.name : '미배정'}</td>
                      <td>{item.cargoType !== null ? item.cargoType : '정보 없음'}</td>
                      <td>
                        <span className={`status-badge status-${item.status?.toLowerCase() || 'unknown'}`}>
                          {item.status !== null ? item.status : '미배정'}
                        </span>
                      </td>
                      <td>{item.payMethod !== null ? item.payMethod : '정보 없음'}</td>
                      <td className="price-cell">
                        {(() => {
                          if (item.displayFee && item.displayFee > 0) {
                            if (item.status === '배송완료') {
                              return `${item.displayFee.toLocaleString()}원 (실제)`;
                            } else {
                              return `${item.displayFee.toLocaleString()}원 (결제)`;
                            }
                          } else if (item.payAmount && item.payAmount > 0) {
                            return `${item.payAmount.toLocaleString()}원 (예상)`;
                          } else {
                            return '정보 없음';
                          }
                        })()}
                      </td>
                      <td>{item.startAddress || '정보 없음'}</td>
                      <td>{item.endAddress || '정보 없음'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mypage-bottom-buttons">
        <button className="bottom-btn review" onClick={moveToAnotherDay}>
          이용기록
        </button>
        <button className="withdraw-link" onClick={handleWithdraw}>
          회원탈퇴
        </button>
      </div>
    </div>
  );
};

export default MyPage;
