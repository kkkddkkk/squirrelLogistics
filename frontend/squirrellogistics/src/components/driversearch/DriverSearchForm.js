import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DriverCard from "./DriverCard";
import { useNavigate, useLocation } from "react-router-dom";
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
  createDeliveryRequest, // 결제 플로우: 기사 지명 시 바로 생성
} from "../../api/estimate/estimateApi";
import { searchDrivers } from "../../api/driversearch/driverSearchApi";
import { getCompanyByUserId } from "../../api/company/companyApi";
import "./DriverSearchForm.css";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // localStorage에서 companyId 가져오기
  const [companyId, setCompanyId] = useState(null);
  
  // 즉시 배차 상태를 로컬 상태로 관리
  const [localDrivable, setLocalDrivable] = useState(false);

  // Company 정보 조회 및 초기 검색
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const storedCompanyId = localStorage.getItem("companyId");
      console.log("=== Company 정보 조회 시작 ===");
      console.log("localStorage companyId:", storedCompanyId);
      
      if (storedCompanyId) {
        const parsedCompanyId = parseInt(storedCompanyId);
        if (!isNaN(parsedCompanyId)) {
          setCompanyId(parsedCompanyId);
          console.log("저장된 companyId 사용:", parsedCompanyId);
          return;
        } else {
          console.warn("localStorage companyId가 숫자가 아님:", storedCompanyId);
        }
      }
      
      // userId로 company 정보 조회 시도
      const userId = localStorage.getItem("userId");
      console.log("localStorage userId:", userId);
      
      if (userId) {
        try {
          const companyInfo = await getCompanyByUserId(userId);
          console.log("API 응답 companyInfo:", companyInfo);
          
          if (companyInfo && companyInfo.companyId) {
            const newCompanyId = parseInt(companyInfo.companyId);
            localStorage.setItem("companyId", newCompanyId.toString());
            setCompanyId(newCompanyId);
            console.log("새로 설정된 companyId:", newCompanyId);
          } else {
            console.warn("companyInfo 또는 companyId가 없음:", companyInfo);
            setCompanyId(null);
          }
        } catch (error) {
          console.error("Company 정보 조회 실패:", error);
          setCompanyId(null);
        }
      } else {
        console.warn("userId가 localStorage에 없음");
        setCompanyId(null);
      }
    };

    fetchCompanyInfo();
    
    // 즉시 배차 상태를 명시적으로 false로 설정
    setLocalDrivable(false);
    dispatch(setDrivable(false));
    console.log("페이지 로드 시 즉시 배차 상태 초기화:", false);
    
    // Redux 상태가 업데이트될 때까지 잠시 대기
    setTimeout(() => {
      console.log("Redux 상태 업데이트 후 즉시 배차 상태 확인:", false);
      handleSearchClick(0);
    }, 200);
  }, [dispatch]);



  // 예상금액 페이지에서 온 flow (state 우선, 없으면 sessionStorage)
  const [flow, setFlow] = useState(() => {
    const fromState = location?.state?.flow;
    if (fromState) return fromState;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const {
    keyword,
    region,
    drivable,
    maxWeight,
    vehicleType,
    sortOption,
    latitude,
    longitude,
    page: reduxPage,
    size: reduxSize,
    drivers,
  } = useSelector((state) => state.driverSearch);

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        dispatch(setRegion(data.address));
        convertAddressToCoords(data.address, (coords) => {
          dispatch(setMyLocation(coords));
        });
      },
    }).open();
  };

  // 실제 백엔드 API 호출로 검색
  const handleSearchClick = async (page = 0) => {
    try {
      // 순환 참조 방지를 위해 순수한 데이터만 포함하고 JSON 변환 테스트
      const searchParams = {
        keyword: keyword || "",
        drivable: localDrivable, // 로컬 상태 사용
        maxWeight: maxWeight ? parseInt(maxWeight) : null,
        vehicleTypeId: vehicleType ? parseInt(vehicleType) : null,
        sortOption: sortOption || "",
        latitude: latitude || null,
        longitude: longitude || null,
        region: region || "",
        page: typeof page === 'number' ? page : 0, // page가 숫자인지 확인
        size: pageSize,
      };

      // 순환 참조 확인 및 정리
      let cleanSearchParams;
      try {
        // JSON 변환 테스트
        JSON.stringify(searchParams);
        cleanSearchParams = searchParams;
        console.log("순환 참조 없음 - searchParams:", searchParams);
      } catch (e) {
        console.error("순환 참조 발견, 정리 중...", e);
                 // 순환 참조가 있는 경우 기본값만 사용
         cleanSearchParams = {
           keyword: keyword || "",
           drivable: localDrivable,
           maxWeight: maxWeight ? parseInt(maxWeight) : null,
           vehicleTypeId: vehicleType ? parseInt(vehicleType) : null,
           sortOption: sortOption || "",
           latitude: latitude || null,
           longitude: longitude || null,
           region: region || "",
           page: typeof page === 'number' ? page : 0, // page가 숫자인지 확인
           size: pageSize,
         };
        console.log("정리된 searchParams:", cleanSearchParams);
      }

      // 각 필드별로 순환 참조 확인
      console.log("=== 각 필드별 순환 참조 확인 ===");
      console.log("keyword:", typeof keyword, keyword);
      console.log("drivable:", typeof localDrivable, localDrivable);
      console.log("maxWeight:", typeof maxWeight, maxWeight);
      console.log("vehicleType:", typeof vehicleType, vehicleType);
      console.log("sortOption:", typeof sortOption, sortOption);
      console.log("latitude:", typeof latitude, latitude);
      console.log("longitude:", typeof longitude, longitude);
      console.log("region:", typeof region, region);
      console.log("page:", typeof page, page);
      console.log("pageSize:", typeof pageSize, pageSize);

      // 필터링 값 상세 확인
      console.log("=== 필터링 값 상세 확인 ===");
      console.log("즉시 배차 필터:", localDrivable, "(drivable 필드로 필터링)");
      console.log("최대 적재량 필터:", maxWeight, "kg (VehicleType.maxWeight >= 이 값)");
      console.log("차량 종류 필터:", vehicleType, "(VehicleType.vehicleTypeId와 매칭)");
      console.log("검색어:", keyword);
      console.log("정렬 옵션:", sortOption);
      
      // API 전송 파라미터 확인
      console.log("=== API 전송 파라미터 ===");
      console.log("searchParams:", searchParams);

              const results = await searchDrivers(cleanSearchParams);
      
      // 페이징 정보 업데이트
      setCurrentPage(results.currentPage);
      setTotalPages(results.totalPages);
      setTotalElements(results.totalElements);
      setHasNext(results.hasNext);
      setHasPrevious(results.hasPrevious);
      
      // 기사 목록 업데이트
      dispatch(setDrivers(results.drivers));
    } catch (error) {
      console.error("기사 검색 실패:", error);
      alert("기사 검색에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 차량 종류와 최대 적재량 옵션을 동적으로 생성
  const vehicleTypeOptions = [
    { id: 1, name: "1톤 트럭", maxWeight: 1000 },
    { id: 2, name: "2.5톤 트럭", maxWeight: 2500 },
    { id: 3, name: "5톤 트럭", maxWeight: 5000 },
    { id: 4, name: "8톤 트럭", maxWeight: 8000 },
    { id: 5, name: "11톤 트럭", maxWeight: 11000 },
    { id: 6, name: "15톤 트럭", maxWeight: 15000 },
    { id: 7, name: "25톤 트럭", maxWeight: 25000 },
  ];

  const maxWeightOptions = [
    { value: 1000, label: "1톤" },
    { value: 2500, label: "2.5톤" },
    { value: 5000, label: "5톤" },
    { value: 8000, label: "8톤" },
    { value: 11000, label: "11톤" },
    { value: 15000, label: "15톤" },
    { value: 25000, label: "25톤" },
  ];

  // ✅ 기사 지명 → 서버에 요청/결제 레코드 생성 → 결제 페이지로 이동 (모든 DTO 포함)
  const handlePickDriverById = async (id) => {
    if (!flow) {
      alert("이전 페이지 정보가 없습니다. 예상 금액 페이지에서 다시 시도해주세요.");
      return;
    }
    const picked = (drivers || []).find((d) => String(d.driverId) === String(id)) || null;

    const nextFlow = {
      ...flow,
              selectedDriver: picked
          ? { 
              id: picked.driverId, 
              name: `기사 #${picked.driverId}`, 
              rating: picked.averageRating, 
              maxWeight: picked.maxWeight, 
              vehicleType: picked.vehicleTypeName 
            }
          : null,
    };

    // 세션에 저장
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextFlow));
    setFlow(nextFlow);

    try {
      // 🔐 기사 지명 요청: DeliveryAssignmentService.propose 호출
      // 먼저 일반 요청 생성
      const requestId = await createDeliveryRequest(nextFlow.requestDto, nextFlow.paymentDto);
      
      // 생성된 요청에 대해 기사 지명 제안
      const proposeResponse = await fetch(`/api/delivery/requests/${requestId}/propose?driverId=${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (!proposeResponse.ok) {
        throw new Error('기사 지명 제안에 실패했습니다.');
      }
      
      const proposeResult = await proposeResponse.json();
      if (proposeResult.FAILED) {
        throw new Error(proposeResult.FAILED);
      }
      
      // 성공 시 결제 페이지로 이동
      navigate("/company/payment", { state: { flow: { ...nextFlow, requestId } } });
    } catch (e) {
      const data = e?.response?.data;
      console.error("기사 지명 요청 실패:", data || e);
      alert(`기사 지명 요청에 실패했습니다.\n${data?.message || data?.error || e.message || ""}`);
    }
  };

  return (
    <div className="driversearch-form">
      {/* 예상금액 데이터 표시 */}
      {flow && (
        <div className="estimate-summary">
          <h3>📋 배송 요청 정보</h3>
          <div className="data-grid">
            <div className="data-item">
              <strong>출발지:</strong> {flow.requestDto?.startAddress || "미입력"}
            </div>
            <div className="data-item">
              <strong>도착지:</strong> {flow.requestDto?.endAddress || "미입력"}
            </div>
            <div className="data-item">
              <strong>경유지:</strong> {flow.requestDto?.waypoints?.length > 0 ? `${flow.requestDto.waypoints.length}개` : "없음"}
            </div>
            <div className="data-item">
              <strong>화물 무게:</strong> {flow.requestDto?.totalCargoWeight ? `${Math.round(flow.requestDto.totalCargoWeight / 1000)}톤` : "미입력"}
            </div>
            <div className="data-item">
              <strong>화물 종류:</strong> {flow.requestDto?.cargoTypes?.length > 0 ? flow.requestDto.cargoTypes.join(", ") : "미입력"}
            </div>
            <div className="data-item">
              <strong>예상 금액:</strong> <span className="price-highlight">{flow.requestDto?.estimatedFee?.toLocaleString()}원</span>
            </div>
            <div className="data-item">
              <strong>희망 출발일:</strong> {flow.requestDto?.wantToStart ? new Date(flow.requestDto.wantToStart).toLocaleDateString() : "미입력"}
            </div>
            <div className="data-item">
              <strong>희망 도착일:</strong> {flow.requestDto?.wantToEnd ? new Date(flow.requestDto.wantToEnd).toLocaleDateString() : "미입력"}
            </div>
          </div>
          {flow.requestDto?.memoToDriver && (
            <div className="memo-section">
              <strong>배송 메모:</strong> {flow.requestDto.memoToDriver}
            </div>
          )}
        </div>
      )}

             {/* 검색창 */}
       <div className="search-bar">
         <button className="region-btn" onClick={handleAddressSearch}>지역</button>
         <input
           type="text"
           className="keyword-input"
           value={keyword}
           placeholder="검색어 입력"
           onChange={(e) => dispatch(setKeyword(e.target.value))}
         />
         <button className="search-btn" onClick={handleSearchClick}>→</button>
       </div>
       
       {/* 필터링 안내 */}
       

      {/* 필터 */}
      <div className="filter-bar">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={localDrivable}
            onChange={(e) => {
              const newValue = e.target.checked;
              console.log("즉시 배차 체크박스 변경:", newValue);
              setLocalDrivable(newValue);
              dispatch(setDrivable(newValue));
            }}
          />
          즉시 배차
        </label>

        <div className="select-wrapper">
          <select value={maxWeight} onChange={(e) => dispatch(setMaxWeight(e.target.value))}>
            <option value="">최대 적재량</option>
            {maxWeightOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="select-wrapper">
          <select value={vehicleType} onChange={(e) => dispatch(setVehicleType(e.target.value))}>
            <option value="">차량 종류</option>
            {vehicleTypeOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="select-wrapper">
          <select value={sortOption} onChange={(e) => dispatch(setSortOption(e.target.value))}>
            <option value="">정렬 기준</option>
            <option value="distance">거리순</option>
            <option value="rating">별점 높은순</option>
          </select>
        </div>
      </div>

      {/* 기사 리스트 */}
      <div className="driver-list">
        {drivers.length === 0 ? (
          <p className="no-result">검색 결과가 없습니다.</p>
        ) : (
          drivers.map((driver) => (
            <DriverCard
              key={driver.driverId}
              driver={driver}
              onRequest={(id) => handlePickDriverById(id)}
            />
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            onClick={() => handleSearchClick(currentPage - 1)}
            disabled={!hasPrevious}
          >
            이전
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 3) {
              pageNum = i;
            } else if (currentPage > totalPages - 3) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => handleSearchClick(pageNum)}
              >
                {pageNum + 1}
              </button>
            );
          })}
          
          <button 
            className="page-btn" 
            onClick={() => handleSearchClick(currentPage + 1)}
            disabled={!hasNext}
          >
            다음
          </button>
        </div>
      )}

      {/* 검색 결과 정보 */}
      {totalElements > 0 && (
        <div className="search-info">
          총 {totalElements}명의 기사 중 {currentPage * pageSize + 1}~{Math.min((currentPage + 1) * pageSize, totalElements)}번째 기사
        </div>
      )}

      {/* 뒤로가기: 히스토리 back (세션값 유지) */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button className="back-button" onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default DriverSearchForm;
