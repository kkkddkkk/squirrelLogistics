import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DriverCard from "./DriverCard";
import { useNavigate, useLocation } from "react-router-dom";
import {
  setKeyword,
  setRegion,
  setSortOption,
  setMaxWeight,
  setVehicleType,
  setIsImmediate,
  setDrivers,
  setMyLocation,
} from "../../slice/driversearch/driverSearchSlice";
import {
  createDeliveryRequest, // 결제 플로우: 기사 지명 시 바로 생성
} from "../../api/estimate/estimateApi";
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
    isImmediate,
    maxWeight,
    vehicleType,
    sortOption,
    drivers,
  } = useSelector((state) => state.driverSearch);

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

  // 임시 mock 검색
  const handleSearchClick = () => {
    const mockDrivers = [
      { id: 1, name: "김기사", rating: 4.8, maxWeight: "3톤", vehicleType: "윙바디", region: "서울, 경기", insurance: true, profileUrl: null, lat: 37.5665, lng: 126.978 },
      { id: 2, name: "이기사", rating: 5.0, maxWeight: "5톤", vehicleType: "탑차", region: "부산, 대구", insurance: false, profileUrl: null, lat: 35.1796, lng: 129.0756 },
    ];
    dispatch(setDrivers(mockDrivers));
  };

  // ✅ 기사 지명 → 서버에 요청/결제 레코드 생성 → 결제 페이지로 이동 (모든 DTO 포함)
  const handlePickDriverById = async (id) => {
    if (!flow) {
      alert("이전 페이지 정보가 없습니다. 예상 금액 페이지에서 다시 시도해주세요.");
      return;
    }
    const picked = (drivers || []).find((d) => String(d.id) === String(id)) || null;

    const nextFlow = {
      ...flow,
      selectedDriver: picked
        ? { id: picked.id, name: picked.name, rating: picked.rating, maxWeight: picked.maxWeight, vehicleType: picked.vehicleType }
        : null,
    };

    // 세션에 저장
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextFlow));
    setFlow(nextFlow);

    try {
      // 🔐 서버에 미리 생성(요청 + 결제) — 결제 페이지에서 승인만
      const requestId = await createDeliveryRequest(nextFlow.requestDto, nextFlow.paymentDto);
      navigate("/company/payment", { state: { flow: { ...nextFlow, requestId } } });
    } catch (e) {
      const data = e?.response?.data;
      console.error("createDeliveryRequest (pick driver) error:", data || e);
      alert(`요청 생성에 실패했습니다.\n${data?.message || data?.error || ""}`);
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

      {/* 필터 */}
      <div className="filter-bar">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isImmediate}
            onChange={(e) => dispatch(setIsImmediate(e.target.checked))}
          />
          즉시 배차
        </label>

        <div className="select-wrapper">
          <select value={maxWeight} onChange={(e) => dispatch(setMaxWeight(e.target.value))}>
            <option value="">최대 적재량</option>
            <option value="1">1톤</option>
            <option value="3">1~3톤</option>
            <option value="5">3~5톤</option>
            <option value="10">5~10톤</option>
            <option value="15">10~15톤</option>
            <option value="20">15~20톤</option>
            <option value="21">20톤 이상</option>
          </select>
        </div>

        <div className="select-wrapper">
          <select value={vehicleType} onChange={(e) => dispatch(setVehicleType(e.target.value))}>
            <option value="">차량 종류</option>
            <option value="일반 카고">일반 카고</option>
            <option value="윙바디">윙바디</option>
            <option value="냉장/냉동">냉장/냉동</option>
            <option value="탑차">탑차</option>
            <option value="리프트">리프트</option>
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
              key={driver.id}
              driver={driver}
              onRequest={(id) => handlePickDriverById(id)}
            />
          ))
        )}
      </div>

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
