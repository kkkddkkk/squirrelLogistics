// src/pages/company/MyPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoItem from '../../components/company/InfoItem';
import { useNavigate } from 'react-router-dom';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import LoadingComponent from '../../components/common/LoadingComponent';

import useDeliveryFilter from '../../hook/company/useDeliveryFilter';
import './MyPage.css';

import {
  logout,
  fetchCompanyMyPageInfo,
} from '../../slice/company/companySlice';
import { getMyPageInfo, getDeliveryList, withdrawAccount } from '../../api/company/companyApi';
import { Box, Grid, MenuItem, Paper, Select, useTheme } from '@mui/material';
import { theme, applyThemeToCssVars } from '../../components/common/CommonTheme';
import { ButtonContainer, OneButtonAtRight, TwoButtonsAtEnd } from '../../components/common/CommonButton';
import CommonList from '../../components/common/CommonList';
import { CommonSubTitle, CommonTitle } from '../../components/common/CommonText';


const MyPage = () => {
  const thisTheme = useTheme();
  applyThemeToCssVars(thisTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myPageInfo, isLoading, error, snsLogin, hasProfileInfo } = useSelector((state) => state.company);

  const {
    status,
    name,
    trackingNumber,
    handleChange,
    handleReset,
    STATUS_OPTIONS,
  } = useDeliveryFilter();

  const [showFullAccount, setShowFullAccount] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
          // console.log('배송 데이터 로드됨:', deliveryData);
          if (deliveryData && Array.isArray(deliveryData)) {
            deliveryData.forEach((item, index) => {
              // console.log(`배송 ${index + 1} 상세:`, {
              //   requestId: item.requestId,
              //   name: item.name,          // ✅ driverName → name
              //   status: item.status,      // ✅ deliveryStatus → status
              //   payMethod: item.payMethod,
              //   displayFee: item.displayFee,
              //   payAmount: item.payAmount, // ✅ estimatedFee → payAmount
              //   actualFee: item.actualFee,
              //   cargoType: item.cargoType,
              //   startAddress: item.startAddress,
              //   endAddress: item.endAddress
              // });
            });
            setDeliveryList(deliveryData);
          }
        } catch (error) {
          // console.error('배송 데이터 로드 실패:', error);
        } finally {
          setDeliveryLoading(false);
        }
      }
    };
    loadDeliveryData();
  }, [myPageInfo?.companyId]);

  // useEffect(() => {
  //   if (myPageInfo) {
  //     console.log('마이페이지 정보 로드됨:', myPageInfo);
  //     console.log('🔍 Redux 상태 확인:', {
  //       snsLogin,
  //       hasProfileInfo,
  //       myPageInfo
  //     });
  //   }
  // }, [myPageInfo, snsLogin, hasProfileInfo]);

  // useEffect(() => {
  //   if (error) {
  //     console.error('마이페이지 데이터 로딩 실패:', error);
  //   }
  // }, [error]);

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

  //프로필 수정(김도경, 2025-08-30)
  const handleEditProfile = () => {
    // 디버깅: 상태 값 확인
    // console.log('🔍 Edit 클릭 시 상태:', {
    //   snsLogin,
    //   hasProfileInfo,
    //   myPageInfo: myPageInfo
    // });

    // 회원정보 보유 여부 직접 계산
    const hasProfileInfoDirect = !!(myPageInfo?.pnumber || myPageInfo?.account || myPageInfo?.businessN || myPageInfo?.address);
    // console.log('🔍 직접 계산한 hasProfileInfo:', hasProfileInfoDirect);
    // console.log('🔍 개별 필드 확인:', {
    //   pnumber: myPageInfo?.pnumber,
    //   account: myPageInfo?.account,
    //   businessN: myPageInfo?.businessN,
    //   address: myPageInfo?.address
    // });
    // 소셜 사용자는 회원정보 유무에 따라 다르게 처리
    if (snsLogin) {
      const hasProfileInfo = !!(myPageInfo?.pnumber || myPageInfo?.account || myPageInfo?.businessN || myPageInfo?.address);

      if (!hasProfileInfo) {
        // console.log('✅ 소셜 사용자 + 회원정보 없음 → edit 페이지로 이동');
        navigate('/company/edit');
      } else {
        // console.log('🔒 소셜 사용자 + 회원정보 있음 → verify 페이지로 이동 (소셜 재인증 필요)');
        navigate('/company/verify');
      }
    } else {
      // console.log('🔒 로컬 사용자 → verify 페이지로 이동');
      // 로컬 사용자만 본인인증 페이지로 이동
      navigate('/company/verify');
    }
  }

  // 📌 이용기록 보기
  const moveToAnotherDay = () => {
    navigate('/company/history');
  };

  // 📌 회원탈퇴
  const handleWithdraw = async () => {
    if (window.confirm('정말 회원 탈퇴하시겠습니까?\n\n회원탈퇴 시 더 이상 서비스를 이용할 수 없습니다.')) {
      try {
        // JWT 토큰 상태 확인
        const accessToken = localStorage.getItem('accessToken');
        // console.log('🔍 회원탈퇴 시도 - JWT 토큰 상태:', {
        //   hasToken: !!accessToken,
        //   tokenLength: accessToken ? accessToken.length : 0,
        //   tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : '없음'
        // });

        if (!accessToken) {
          alert('로그인이 필요합니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }

        // 회원탈퇴 API 호출
        const response = await withdrawAccount();

        if (response.ok) {
          alert('회원탈퇴가 완료되었습니다.');
          // 로그아웃 처리
          dispatch(logout());
          localStorage.clear();
          sessionStorage.clear();
          navigate('/');
        } else {
          alert(response.message || '회원탈퇴 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        // console.error('회원탈퇴 실패:', error);

        // 401 에러인 경우 로그인 페이지로 이동
        if (error.response?.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('accessToken');
          navigate('/login');
        } else {
          alert('회원탈퇴 처리 중 오류가 발생했습니다.');
        }
      }
    }
  };



  return (
    <Grid container sx={{
      backgroundColor: thisTheme.palette.background.default,
      minHeight: '100vh',
      py: { xs: 2, sm: 3, md: 4 }
    }}>
      <LoadingComponent open={deliveryLoading} text='마이페이지 정보를 불러오는 중...'></LoadingComponent>
      <Grid size={{ xs: 0, sm: 0, md: 3 }} />
      <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        {/* 페이지 제목 */}
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"} mb={{ xs: 3, sm: 4 }}>
          <CommonTitle sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
            마이페이지
          </CommonTitle>
        </Box>

        {/* 회원정보 */}
        <CommonList padding={{ xs: 2, sm: 3, md: 5 }}>
          <div className="info-header">
            <CommonSubTitle>회원정보</CommonSubTitle>
            <EditDocumentIcon
              onClick={handleEditProfile}
              sx={{
                color: thisTheme.palette.primary.main,
                cursor: "pointer"
              }}
            ></EditDocumentIcon>
          </div>

          {isLoading ? (
            <div className="loading-message">데이터를 불러오는 중...</div>
          ) : error ? (
            <div className="error-message">데이터를 불러올 수 없습니다.</div>
          ) : (
            <>
              {/* 소셜 사용자 안내 메시지 */}
              {snsLogin && (
                <div className="social-notice">
                  <p><strong>소셜 로그인 사용자</strong></p>
                  <p>회원정보가 없으면 본인인증 없이 수정 가능합니다.</p>
                  <p>회원정보가 있으면 소셜 재인증이 필요합니다.</p>
                </div>
              )}

              <InfoItem label="이름" value={myPageInfo?.name || "정보 없음"} color={thisTheme.palette.text.primary}/>
              <InfoItem label="이메일" value={myPageInfo?.email || "정보 없음"} color={thisTheme.palette.text.primary} />
              <InfoItem label="연락처" value={myPageInfo?.pnumber || "정보 없음"} color={thisTheme.palette.text.primary} />
              <InfoItem label="회사 주소" value={myPageInfo?.address || "정보 없음"} color={thisTheme.palette.text.primary} />
              <InfoItem label="사업자 등록번호" value={myPageInfo?.businessN || "정보 없음"} color={thisTheme.palette.text.primary} />

              {/* 계좌번호 */}
              <div className="info-item">
                <span className="info-label" style={{color: thisTheme.palette.text.primary}}>계좌번호</span>
                <span className="info-value" style={{color: thisTheme.palette.text.primary}}>
                  {showFullAccount ? (myPageInfo?.account || "정보 없음") : (maskedAccount || "정보 없음")}
                  {myPageInfo?.account && (
                    <OneButtonAtRight
                      clickEvent={() => setShowFullAccount(prev => !prev)}
                      disabled={!myPageInfo?.account}
                    >
                      {showFullAccount ? "숨기기" : "보이기"}
                    </OneButtonAtRight>
                  )}
                </span>
              </div>
            </>
          )}
        </CommonList>

        {/* 배송 정보 */}
        <CommonList padding={{ xs: 2, sm: 3, md: 5 }}>
          {/* <h3></h3> */}
          <CommonSubTitle>배송정보</CommonSubTitle>

          {/* 검색 및 필터 */}
          <div className="delivery-filter"  style={{
            backgroundColor: thisTheme.palette.background.default,
            borderColor: thisTheme.palette.background.default
            }}>
            <div className="filter-row" >
              <Box display={"flex"} gap={3} sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" }
              }}>
                <div className="filter-item">
                  <label htmlFor="name" style={{color: thisTheme.palette.text.primary}}>기사명:</label>
                  <input
                    type="text"
                    id="name"
                    value={nameFilter}
                    onChange={handleNameChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="기사명을 입력하세요"
                    className='searchInput'
                    style={{
                      width: "100%",
                      backgroundColor: thisTheme.palette.background.paper,
                      color: thisTheme.palette.text.primary
                    }}
                  />
                </div>
                <div className="filter-item">
                  <label htmlFor="status" style={{color: thisTheme.palette.text.primary}}>배송 상태:</label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className='searchInput'
                    style={{
                      backgroundColor: thisTheme.palette.background.paper,
                      color: thisTheme.palette.text.primary
                    }}
                  >
                    <option value="">전체</option>
                    <option value="주문접수">주문접수</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                    <option value="취소">취소</option>
                  </select>
                </div>
              </Box>
              <ButtonContainer width={{ xs: "100%", sm: "22%" }}>
                <TwoButtonsAtEnd
                  leftTitle={"검색"}
                  leftClickEvent={handleSearch}
                  rightTitle={"초기화"}
                  rightClickEvent={handleFilterReset}
                  rightColor={theme.palette.warning.main}
                />
              </ButtonContainer>
            </div>
          </div>

          {/* 배송 테이블 */}
          <div className="delivery-table-container">
            <table className="delivery-table" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ width: "10%", color: thisTheme.palette.text.primary }}>기사명</th>
                  <th style={{ width: "13%", color: thisTheme.palette.text.primary }}>화물 종류</th>
                  <th style={{ width: "13%", color: thisTheme.palette.text.primary }}>배송 상태</th>
                  <th style={{ width: "15%", color: thisTheme.palette.text.primary }}>결제 방법</th>
                  <th style={{ width: "15%", color: thisTheme.palette.text.primary }}>금액</th>
                  <th style={{ width: "17%", color: thisTheme.palette.text.primary }}>출발지</th>
                  <th style={{ width: "17%", color: thisTheme.palette.text.primary }}>도착지</th>
                </tr>
              </thead>
              <tbody>
                {(!filteredDeliveries || filteredDeliveries.length === 0) ? (
                  <tr>
                    <td colSpan={7} className="no-delivery" style={{color: thisTheme.palette.text.primary}}>
                      배송 정보가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((item, i) => (
                    <tr key={i}>
                      <td style={{color: thisTheme.palette.text.primary}}>{item.name !== null ? item.name : '미배정'}</td>
                      <td style={{color: thisTheme.palette.text.primary}}>{item.cargoType !== null ? item.cargoType : '정보 없음'}</td>
                      <td style={{ fontWeight: "bold", color: thisTheme.palette.text.primary }}>
                        {item.status !== null ? item.status : '미배정'}
                      </td>
                      <td style={{color: thisTheme.palette.text.primary}}>{item.payMethod !== null ? item.payMethod : '정보 없음'}</td>
                      <td className="price-cell" style={{color: thisTheme.palette.text.primary}}>
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
                      <td style={{color: thisTheme.palette.text.primary}}>{item.startAddress || '정보 없음'}</td>
                      <td style={{color: thisTheme.palette.text.primary}}>{item.endAddress || '정보 없음'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CommonList>

        {/* 하단 버튼 */}
        <ButtonContainer marginBottom={"5%"} marginTop={"5%"} width={"100%"}>
          <TwoButtonsAtEnd
            leftTitle={"이 용 기 록"}
            leftClickEvent={moveToAnotherDay}
            rightTitle={"회 원 탈 퇴"}
            rightColor={theme.palette.error.main}
            rightClickEvent={handleWithdraw}
          />
        </ButtonContainer>

      </Grid>
      <Grid size={{ xs: 0, sm: 0, md: 3 }} />
    </Grid>
  );
};

export default MyPage;
