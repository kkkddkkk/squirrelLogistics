import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DriverCard from "./DriverCard";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import {
  setKeyword,
  setRegion,
  setSortOption,
  setMaxWeight,
  setVehicleType,
  setDrivable,
  setDrivers,
  setMyLocation,
} from "../../slice/driversearch/driverSearchSlice";
import {
  createDeliveryPropose,
  createDeliveryRequest, // 결제 플로우: 기사 지명 시 바로 생성
  createDriverSpecificRequest, // 기사 지명 요청 전용 API
} from "../../api/estimate/estimateApi";
import { searchDrivers } from "../../api/driversearch/driverSearchApi";
import "./DriverSearchForm.css";
import { CommonSubTitle, CommonTitle } from "../common/CommonText";
import { Box, Grid, MenuItem, OutlinedInput, Select, useTheme } from "@mui/material";
import CommonList from "../common/CommonList";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { theme, applyThemeToCssVars } from "../common/CommonTheme";
import { ButtonContainer, OneButtonAtCenter, OneButtonAtLeft, OneButtonAtRight } from "../common/CommonButton";
import LoadingComponent from '../common/LoadingComponent';
import CommonSelect from "../common/CommonSelect";
import { format } from "date-fns";

const STORAGE_KEY = "deliveryFlow";

// 주소 → 좌표 변환
const convertAddressToCoords = (address, callback) => {
  const geocoder = new window.kakao.maps.services.Geocoder();
  geocoder.addressSearch(address, function (result, status) {
    if (status === window.kakao.maps.services.Status.OK) {
      const { y: lat, x: lng } = result[0];
      callback({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
  });
};

const DriverSearchForm = () => {
  const thisTheme = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--primary-main", thisTheme.palette.primary.main);
    root.style.setProperty("--primary-dark", thisTheme.palette.primary.dark);
    root.style.setProperty("--secondary-main", thisTheme.palette.secondary.main);
    root.style.setProperty("--background-default", thisTheme.palette.background.default);
    root.style.setProperty("--background-paper", thisTheme.palette.background.paper);
    root.style.setProperty("--text-primary", thisTheme.palette.text.primary);
    root.style.setProperty("--text-secondary", thisTheme.palette.text.secondary);

  })

  const [cargos, setCargos] = useState();
  const [driverLength, setDriverLength] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // 검색 상태 관리 (백엔드 DriverSearchRequestDTO와 동일한 구조)
  const [searchParams, setSearchParams] = useState({
    keyword: "",                    // String: 검색어
    drivable: false,                // Boolean: 즉시 배차 가능 여부
    maxWeight: null,                // Integer: 최대 적재량 (kg)
    vehicleTypeId: null,            // Long: 차량 종류 ID
    sortOption: "",                 // String: 정렬 기준
    // asRate: false,                  // Boolean: 별점 높은 순 정렬 여부
    latitude: null,                 // Double: 현재 위치 위도
    longitude: null,                // Double: 현재 위치 경도
    region: "",                     // String: 선호 지역
    page: 0,                        // Integer: 페이지 번호 (0부터 시작)
    size: 10                        // Integer: 페이지 크기
  });

  const normalizeFlow = (raw) => {
    if (!raw) return null;
    // 이미 정상 형태면 그대로
    if (raw.requestDto || raw.paymentDto) return raw;
    // 혹시 (request, payment)로 온 구버전이면 보정
    if (raw.request || raw.payment) {
      return { requestDto: raw.request, paymentDto: raw.payment };
    }
    return null;
  };

  // 검색 결과 상태 (백엔드 DriverSearchPageResponseDTO와 동일한 구조)
  const [searchResult, setSearchResult] = useState({
    drivers: [],                    // List<DriverSearchResponseDTO>: 기사 목록
    currentPage: 0,                 // int: 현재 페이지
    totalPages: 0,                  // int: 전체 페이지 수
    totalElements: 0,               // long: 전체 기사 수
    pageSize: 10,                   // int: 페이지 크기
    hasNext: false,                 // boolean: 다음 페이지 존재 여부
    hasPrevious: false              // boolean: 이전 페이지 존재 여부
  });

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 차량 종류 목록 (하드코딩, 백엔드 VehicleType 엔티티와 매칭)
  // 각 차량의 최대 적재량을 kg 단위로 저장 (백엔드와 일치)
  const vehicleTypes = [
    { id: 1, name: "1톤 트럭", maxWeight: 1000 },
    { id: 2, name: "2.5톤 트럭", maxWeight: 2500 },
    { id: 3, name: "5톤 트럭", maxWeight: 5000 },
    { id: 4, name: "8톤 트럭", maxWeight: 8000 },
    { id: 5, name: "10톤 트럭", maxWeight: 10000 },
    { id: 6, name: "15톤 트럭", maxWeight: 15000 },
    { id: 7, name: "25톤 트럭", maxWeight: 25000 }
  ];

  // Company 정보 조회 및 초기 검색
  useEffect(() => {
    // 페이지 로드 시 바로 검색 실행
    // console.log("페이지 로드 - 기본 검색 실행");
    handleSearch();
  }, []);

  const [flow, setFlow] = useState(() => {
    const fromState = location?.state?.flow;
    if (fromState) return normalizeFlow(fromState);
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return normalizeFlow(saved ? JSON.parse(saved) : null);
    } catch {
      return null;
    }
  });

  //김도경 추가. sessionStorage에서 cargos 정보 가져오기
  useEffect(() => {
    if (!flow) return;
    const cargoContent = flow.requestDto.waypoints.map((waypoint) => {
      if (waypoint.cargo) return waypoint.cargo.description;
    })
    setCargos(cargoContent.filter(Boolean).join(", "));
  }, [flow])

  useEffect(() => {
    handleSearch();
  }, [searchParams.sortOption]);

  // Redux 상태 동기화
  const reduxState = useSelector((state) => state.driverSearch);

  // 검색 실행 (검색 버튼 클릭 시 모든 필터 적용)
  const handleSearch = async (page = 0) => {
    setIsLoading(true);
    try {
      const params = {
        ...searchParams,
        page: page
      };

      // console.log("=== 검색 파라미터 상세 ===");
      // console.log("전체 파라미터:", params);
      // console.log("최대 적재량 (kg):", params.maxWeight);
      // console.log("차량 종류 ID:", params.vehicleTypeId);
      // console.log("즉시 배차:", params.drivable);
      // console.log("정렬 옵션:", params.sortOption);
      // console.log("========================");

      const result = await searchDrivers(params);


      //김도경 수정: 요청 차량과 일치하는 기사만 출력
      let newDrivers;
      const storedData = JSON.parse(sessionStorage.getItem("deliveryFlow"));
      const maxWeight = storedData.requestDto.vehicleMaxWeight
      const vehicleName = storedData.requestDto.vehicleTypeName;
      if (vehicleName === "차량 선택 안함") {
        newDrivers = result.drivers.filter((driver) => {
          return driver.maxWeight >= maxWeight;
        })
      } else {
        newDrivers = result.drivers.filter((driver) => {
          return driver.combinedVehicleInfo.includes(vehicleName);
        })
      }
      setSearchResult(result);
      setSearchResult({
        ...searchResult,
        drivers: newDrivers,
      })
      setDriverLength(newDrivers.length);

      // Redux 상태 업데이트
      dispatch(setDrivers(result.drivers));
      dispatch(setKeyword(params.keyword));
      dispatch(setRegion(params.region));
      dispatch(setSortOption(params.sortOption));
      dispatch(setMaxWeight(params.maxWeight));
      dispatch(setVehicleType(params.vehicleTypeId));
      dispatch(setDrivable(params.drivable));

      if (params.latitude && params.longitude) {
        dispatch(setMyLocation({ lat: params.latitude, lng: params.longitude }));
      }

    } catch (error) {
      // console.error("기사 검색 실패:", error);
      // console.error("에러 상세:", error.response?.data || error.message);
      alert("기사 검색에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 필터 변경 시 파라미터만 업데이트 (자동 검색 비활성화)
  const handleFilterChange = (key, value) => {
    const newParams = { ...searchParams, [key]: value, page: 0 };
    setSearchParams(newParams);
    // 자동 검색 제거 - 사용자가 화살표 버튼을 눌러야 검색 실행
  };

  const handleAsRateToggle = () => {
    const newAsRate = !searchParams.asRate;
    if (newAsRate) {
      handleFilterChange('sortOption', newAsRate);
    }

  }
  // 즉시 배차 토글
  const handleDrivableToggle = () => {
    const newDrivable = !searchParams.drivable;
    handleFilterChange('drivable', newDrivable);
  };

  // 최대 적재량 변경 (Integer 타입으로 변환, kg 단위)
  const handleMaxWeightChange = (weight) => {
    const weightValue = weight ? parseInt(weight) : null;
    // console.log("최대 적재량 필터 변경:", weightValue, "kg");
    handleFilterChange('maxWeight', weightValue);
  };

  // 차량 종류 변경 (Long 타입으로 변환)
  const handleVehicleTypeChange = (vehicleTypeId) => {
    const typeId = vehicleTypeId ? parseInt(vehicleTypeId) : null;
    handleFilterChange('vehicleTypeId', typeId);
  };

  // 정렬 옵션 변경
  const handleSortChange = (sortOption) => {
    handleFilterChange('sortOption', sortOption);
  };



  // 주소 검색 (거리순 정렬용)
  const openAddressPopup = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const address = data.address;
        setSearchParams(prev => ({ ...prev, region: address }));

        // 주소를 좌표로 변환
        convertAddressToCoords(address, (coords) => {
          const newParams = {
            ...searchParams,
            region: address,
            latitude: coords.lat,      // Double 타입
            longitude: coords.lng,     // Double 타입
            page: 0
          };
          setSearchParams(newParams);
          handleSearch(0);
        });
      },
    }).open();
  };

  // 페이징 처리
  const handlePageChange = (page) => {
    handleSearch(page);
  };

  // 기사 지명 요청
  const handleDriverRequest = async (driverId) => {
    if (!flow) {
      alert("배송 정보가 없습니다. 예상금액 페이지에서 다시 시도해주세요.");
      return;
    }

    const ok = window.confirm("이 기사님에게 지명 요청을 보내시겠습니까?");
    if (!ok) return;

    try {
      const paymentDto = {
        paid: null,
        payAmount: flow.estimatedFee ?? 0,
        payMethod: null,
        payStatus: "PENDING",
        prepaidId: null,
        refundDate: null,
        settlement: false,
        settlementFee: 0,
      };

      // console.log("전송 데이터:", {
      //   payment: paymentDto,
      //   request: flow.requestDto
      // });

      // console.log("driverId: " + driverId);

      const { requestId, paymentId } = await createDeliveryPropose(
        flow.requestDto,
        paymentDto,
        driverId
      );

      // 결제 페이지로 이동 (requestId 포함)
      navigate(
        {
          pathname: "/company/payment",
          search: createSearchParams({
            paymentId: String(paymentId),
          }).toString(),
        },
        {
          state: {
            flow: { ...flow, requestId, paymentId, paymentDto },
            requestId,
            paymentId,
            paymentAmount: paymentDto.payAmount,
            isDriverRequest: true,
          },
        }
      );
    } catch (e) {
      const data = e?.response?.data;
      // console.error("createDriverSpecificRequest error:", data || e);
      alert(`지명 요청에 실패했습니다.\n${data?.message || data?.error || ""}`);
    }
  };

  return (
    <Grid container marginBottom={5}>
      <Grid size={3} />
      <Grid size={6}>
        <CommonTitle>기사 검색</CommonTitle>

        <CommonList padding={5}>
          {/* 예상금액 데이터 표시 */}
          {flow && (
            <div className="estimate-summary">
              <Box display={"flex"} alignItems={"center"} marginBottom={2}>
                <LocalShippingOutlinedIcon />
                <CommonSubTitle>&nbsp; 배송 요청 정보</CommonSubTitle>
              </Box>

              <div className="data-grid">
                <div className="data-item">
                  <strong>출발지:</strong> {flow.requestDto?.startAddress || "미입력"}
                </div>
                <div className="data-item">
                  <strong>도착지:</strong> {flow.requestDto?.endAddress || "미입력"}
                </div>
                <div className="data-item">
                  <strong>경유지:</strong> {flow.requestDto?.waypoints?.length > 0 ? `${flow.requestDto.waypoints.length - 2}개` : "없음"}
                </div>
                <div className="data-item">
                  <strong>화물 무게:</strong> {flow.requestDto?.totalCargoWeight ? `${Math.round(flow.requestDto.totalCargoWeight / 1000)}톤` : "미입력"}
                </div>
                <div className="data-item">
                  <strong>화물 종류:</strong> {flow.requestDto?.waypoints?.length > 0 ? cargos : "미입력"}
                </div>
                <div className="data-item">
                  <strong>요청 차량:</strong> {flow.requestDto?.vehicleTypeName || "미입력"}
                </div>
                <div className="data-item">
                  <strong>희망 출발일:</strong> {flow.requestDto?.wantToStart ? format(new Date(flow.requestDto.wantToStart), "yyyy-MM-dd hh:mm") : "미입력"}
                </div>
                <div className="data-item">
                  <strong>예상 금액:</strong> <span className="price-highlight">{flow.requestDto?.estimatedFee?.toLocaleString()}원</span>
                </div>
              </div>
              {flow.requestDto?.memoToDriver && (
                <div className="memo-section">
                  <strong>배송 메모:</strong> {flow.requestDto.memoToDriver}
                </div>
              )}
            </div>
          )}

          {/* 검색 필터 */}
          <div className="search-bar">
            {/* 주소 API 버튼 - 검색란 왼쪽 */}
            {/* 키워드 검색 */}
            <input
              type="text"
              className="keyword-input"
              placeholder="기사명, 차량 종류로 검색"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
              // onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // 엔터 입력 시 폼 submit 방지
                  handleSearch();
                }
              }}
            />
                {/* 검색 실행 버튼 */ }
            <OneButtonAtRight clickEvent={() => handleSearch()}>검색</OneButtonAtRight>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={searchParams.sortOption === "rating"}
                onChange={() => {
                  handleFilterChange(
                    'sortOption',
                    searchParams.sortOption === "rating" ? "" : "rating"
                  )
                }}
              />
              별점 높은 순
            </label>
          </div>

          {/* 필터 옵션들 */}
          {/* <div className="filter-bar"> */}
          {/* 즉시 배차 */}
          {/* <label className="checkbox-label">
              <input
                type="checkbox"
                checked={searchParams.drivable}
                onChange={handleDrivableToggle}

              />
              즉시 배차 가능
            </label> */}
          {/* 별점 높은 순 */}
          {/* <label className="checkbox-label">
              <input
                type="checkbox"
                checked={searchParams.sortOption === "rating"}
                onChange={() => handleFilterChange(
                  'sortOption',
                  searchParams.sortOption === "rating" ? "" : "rating"
                )}
              />
              별점 높은 순
            </label> */}

          {/* 최대 적재량 */}
          {/* <CommonSelect
              value={searchParams.maxWeight || ""}
              changeEvent={(e) => handleMaxWeightChange(e.target.value)}
            >
              <MenuItem value="">최대 적재량</MenuItem>
              <MenuItem value="1000">1톤 이상</MenuItem>
              <MenuItem value="2500">2.5톤 이상</MenuItem>
              <MenuItem value="5000">5톤 이상</MenuItem>
              <MenuItem value="8000">8톤 이상</MenuItem>
              <MenuItem value="10000">10톤 이상</MenuItem>
              <MenuItem value="15000">15톤 이상</MenuItem>
              <MenuItem value="25000">25톤 이상</MenuItem>
            </CommonSelect> */}

          {/* 차량 종류 */}
          {/* <CommonSelect
              value={searchParams.vehicleTypeId || ""}
              changeEvent={(e) => handleVehicleTypeChange(e.target.value)}
            >
              <MenuItem value="">차량 종류</MenuItem>
              {vehicleTypes.map(type => (
                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
              ))}
            </CommonSelect> */}
          {/* </div> */}

          {/* 검색 결과 */}
          <div className="driver-list">
            <LoadingComponent open={isLoading} text="운전 가능한 기사님을 검색 중..."></LoadingComponent>
            {isLoading ? (
              <div className="no-result">검색 중...</div>
            ) : (
              <>
                <div className="search-info">
                  총 {driverLength}명의 기사님이 대기 중입니다.
                </div>

                {/* 기사 목록 */}
                {driverLength > 0 ? (
                  searchResult.drivers.map((driver) => (
                    <DriverCard
                      key={driver.driverId}
                      driver={driver}
                      onRequest={() => handleDriverRequest(driver.driverId)}
                    />
                  ))
                ) : (
                  <div className="no-result">검색 결과가 없습니다.</div>
                )}
              </>
            )}
          </div>

          {/* 페이징 */}
          {searchResult.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => handlePageChange(searchResult.currentPage - 1)}
                disabled={!searchResult.hasPrevious}
              >
                이전
              </button>

              {Array.from({ length: searchResult.totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-btn ${i === searchResult.currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(i)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={() => handlePageChange(searchResult.currentPage + 1)}
                disabled={!searchResult.hasNext}
              >
                다음
              </button>
            </div>
          )}

          {/* 돌아가기 버튼 - 맨 하단 */}
          <ButtonContainer marginTop={5}>
            <OneButtonAtCenter clickEvent={() => navigate(-1)}>
              예상금액 페이지로 돌아가기
            </OneButtonAtCenter>
          </ButtonContainer>


        </CommonList>

      </Grid>
      <Grid size={3} />
    </Grid >

  );
};

export default DriverSearchForm;
