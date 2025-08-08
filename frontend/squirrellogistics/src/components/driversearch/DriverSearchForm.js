import React from "react";
import { useDispatch, useSelector } from "react-redux";
import DriverCard from "./DriverCard";
import { useNavigate } from "react-router-dom";
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
import "./DriverSearchForm.css";

// 📍 주소 → 좌표 변환 함수
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
  const {
    keyword,
    region,
    isImmediate,
    maxWeight,
    vehicleType,
    sortOption,
    drivers,
  } = useSelector((state) => state.driverSearch);

  // 📍 주소 검색 + 위도/경도 설정
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

  // 🧪 임시 mock 검색 (API 연동 전용)
  const handleSearchClick = () => {
    const mockDrivers = [
      {
        id: 1,
        name: "김기사",
        rating: 4.8,
        maxWeight: "3톤",
        vehicleType: "윙바디",
        region: "서울, 경기",
        insurance: true,
        profileUrl: null,
        lat: 37.5665,
        lng: 126.9780,
      },
      {
        id: 2,
        name: "이기사",
        rating: 5.0,
        maxWeight: "5톤",
        vehicleType: "탑차",
        region: "부산, 대구",
        insurance: false,
        profileUrl: null,
        lat: 35.1796,
        lng: 129.0756,
      },
    ];
    dispatch(setDrivers(mockDrivers));
  };

  return (
    <div className="driversearch-form">
      {/* 🔍 검색창 */}
      <div className="search-bar">
        <button className="region-btn" onClick={handleAddressSearch}>
          지역
        </button>
        <input
          type="text"
          className="keyword-input"
          value={keyword}
          placeholder="검색어 입력"
          onChange={(e) => dispatch(setKeyword(e.target.value))}
        />
        <button className="search-btn" onClick={handleSearchClick}>
          →
        </button>
      </div>

      {/* 🎛️ 필터 */}
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
          <select
            value={maxWeight}
            onChange={(e) => dispatch(setMaxWeight(e.target.value))}
          >
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
          <select
            value={vehicleType}
            onChange={(e) => dispatch(setVehicleType(e.target.value))}
          >
            <option value="">차량 종류</option>
            <option value="일반 카고">일반 카고</option>
            <option value="윙바디">윙바디</option>
            <option value="냉장/냉동">냉장/냉동</option>
            <option value="탑차">탑차</option>
            <option value="리프트">리프트</option>
          </select>
        </div>

        <div className="select-wrapper">
          <select
            value={sortOption}
            onChange={(e) => dispatch(setSortOption(e.target.value))}
          >
            <option value="">정렬 기준</option>
            <option value="distance">거리순</option>
            <option value="rating">별점 높은순</option>
          </select>
        </div>
      </div>

      {/* 👤 기사 리스트 */}
      <div className="driver-list">
        {drivers.length === 0 ? (
          <p className="no-result">검색 결과가 없습니다.</p>
        ) : (
          drivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onRequest={(id) => console.log("요청 전송:", id)}
            />
          ))
        )}
      </div>

      {/* 🔙 돌아가기 버튼 */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button className="back-button" onClick={() => navigate("/estimate")}>
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default DriverSearchForm;
