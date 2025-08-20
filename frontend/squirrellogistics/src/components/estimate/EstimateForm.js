import React, { useEffect, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import {
  calculateDistance,
  createDeliveryRequest, // (requestDto, paymentDto) -> returns requestId
  fetchVehicleTypes,
  fetchSavedAddresses,
  saveSavedAddressesBulk,
  deleteSavedAddress,
} from "../../api/estimate/estimateApi";
import { useSelector, useDispatch } from "react-redux";
import { setDistance, setMinWeight, setMaxWeight } from "../../slice/estimate/estimateSlice";
import "./EstimateForm.css";

// ===== 화물(취급유형) 옵션 =====
const cargoOptions = [
  "가전제품",
  "가구",
  "위험물 (취급주의 +5000)",
  "귀중품 (취급주의 +5000)",
  "냉장식품",
  "기타",
];

// 라벨 <-> 서버 enum
const LABEL_TO_TYPE = { 출발지: "START", 도착지: "END", 경유지: "WAYPOINT" };
const TYPE_TO_LABEL = { START: "출발지", END: "도착지", WAYPOINT: "경유지" };

// 추가요금 규칙
const WAYPOINT_FEE_PER_ITEM = 50000;
const MOUNTAIN_FEE = 50000;
const includesGangwon = (addr) => (addr || "").includes("강원");

// 시간 포맷
const toYmdHms = (d) => {
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const MM = pad(d.getMinutes());
  const SS = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
};

// 결제 DTO - 백엔드 PaymentDTO와 정확히 일치
const buildPaymentDTO = (amount) => ({
  paymentId: null,
  prepaidId: null,
  payAmount: Math.round(Number(amount) || 0),
  payMethod: null,
  settlementFee: 0,
  settlement: false,
  paid: null,
  refundDate: null,
  payStatus: "PENDING",
  failureReason: null,
});

const STORAGE_KEY = "deliveryFlow";
const DRAFT_KEY = "estimateDraft";

// 세션 draft 읽기
function readDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

const EstimateForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const estimateState = useSelector((state) => state.estimate);
  const auth = useSelector((s) => s.auth || s.user || {});
  const companyStateCompanyId = useSelector((s) => s.company?.companyId);
  const companyStateUserInfoCompanyId = useSelector((s) => s.company?.userInfo?.companyId);
  const { distance } = estimateState;

  // 유저
  const userFromStorage = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  }, []);
  const mergedUser = auth?.user || userFromStorage || {};
  const companyId =
    companyStateCompanyId ??
    companyStateUserInfoCompanyId ??
    auth?.user?.companyId ??
    mergedUser?.companyId ??
    null;

  // ✅ draft로 초기화 (첫 렌더부터 값 유지)
  const draft = readDraft();

  // ===== 로컬 상태 =====
  const [price, setPrice] = useState(() => (typeof draft.price === "number" ? draft.price : 0));
  const [distanceOnlyPrice, setDistanceOnlyPrice] = useState(0);

  const [departure, setDeparture] = useState(() => draft.departure || "");
  const [arrival, setArrival] = useState(() => draft.arrival || "");
  const [waypoints, setWaypoints] = useState(() => Array.isArray(draft.waypoints) ? draft.waypoints : []);

  const [savedAddresses, setSavedAddresses] = useState([]);

  const [cargoTypes, setCargoTypes] = useState(() => Array.isArray(draft.cargoTypes) ? draft.cargoTypes : []);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [cargoTypeOptions, setCargoTypeOptions] = useState([]); // 백엔드에서 가져온 화물 종류
  const [vehicleTypeId, setVehicleTypeId] = useState(() =>
    draft.vehicleTypeId !== undefined && draft.vehicleTypeId !== null ? draft.vehicleTypeId : ""
  );

  const [title, setTitle] = useState(() => (typeof draft.title === "string" ? draft.title : ""));
  const [weight, setWeight] = useState(() => (typeof draft.weight === "number" ? draft.weight : 13));
  const [startDate, setStartDate] = useState(() => (draft.startDate ? new Date(draft.startDate) : null));
  const [endDate, setEndDate] = useState(() => (draft.endDate ? new Date(draft.endDate) : null));

  // ✅ Redux distance 즉시 복원
  useEffect(() => {
    if (typeof draft.distance === "number" && !Number.isNaN(draft.distance)) {
      dispatch(setDistance(draft.distance));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 차량 목록
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchVehicleTypes();
        const normalized = (list || []).map((v) => ({
          id: v.vehicleTypeId ?? v.vehicle_type_id ?? v.id ?? null,
          name: v.name,
        }));
        setVehicleTypes(normalized);
      } catch (e) {
        console.error("차량 목록 로드 실패:", e);
      }
    })();
  }, []);

  // 화물 종류 목록 - 백엔드에서 가져오기
  useEffect(() => {
    // 하드코딩된 화물 종류를 사용
    setCargoTypeOptions(cargoOptions.map((name, index) => ({
      id: index + 1, // 실제 백엔드에서 사용할 ID는 여기서 결정
      name: name,
      extraFee: name.includes("취급주의") ? 5000 : 0, // 추가 요금 설정
    })));
  }, []);

  // 저장된 기본 주소
  useEffect(() => {
    (async () => {
      if (!companyId) return;
      try {
        const list = await fetchSavedAddresses(companyId);
        setSavedAddresses(list);
      } catch (e) {
        console.error("기본 주소 로드 실패:", e);
      }
    })();
  }, [companyId]);

  // 산간지역 여부
  const nonEmptyWaypoints = useMemo(
    () => (waypoints || []).filter((w) => !!w && w.trim() !== ""),
    [waypoints]
  );
  const hasMountainRegion = useMemo(() => {
    if (includesGangwon(departure)) return true;
    if (includesGangwon(arrival)) return true;
    for (const w of nonEmptyWaypoints) if (includesGangwon(w)) return true;
    return false;
  }, [departure, arrival, nonEmptyWaypoints]);

  // 선택된 차량 정보 (UI 표시용만)
  const selectedVehicle = useMemo(() => 
    vehicleTypes.find(v => v.id === vehicleTypeId), 
    [vehicleTypes, vehicleTypeId]
  );
  
  // 무게 검증 제거 - 항상 false 반환
  const isWeightExceeded = false;

  // 금액 계산 - 하드코딩된 화물 종류 extraFee 반영
  useEffect(() => {
    const km = distance && !isNaN(distance) ? distance : 0;
    const baseByDistance = 100000 + Math.ceil(km) * 3000;
    setDistanceOnlyPrice(baseByDistance);

    let sum = baseByDistance + weight * 30000; // 톤 단위 그대로 사용
    
    // 선택된 화물 종류의 추가 요금 계산
    cargoTypes.forEach(ct => {
      if (ct.includes("취급주의")) {
        sum += 5000; // 취급주의 화물은 +5000원
      }
    });
    
    sum += nonEmptyWaypoints.length * WAYPOINT_FEE_PER_ITEM;
    if (hasMountainRegion) sum += MOUNTAIN_FEE;

    setPrice(Math.floor(sum));
  }, [distance, weight, cargoTypes, nonEmptyWaypoints.length, hasMountainRegion]);

  // 주소 검색
  const openAddressPopup = (setter) => {
    new window.daum.Postcode({
      oncomplete: function (data) { setter(data.address); },
    }).open();
  };
  const openWaypointPopup = (index) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setWaypoints((prev) => {
          const updated = [...prev];
          updated[index] = data.address;
          return updated;
        });
      },
    }).open();
  };
  const handleRemoveWaypoint = (index) => setWaypoints((prev) => prev.filter((_, i) => i !== index));

  // 거리 계산
  const handleCalculateDistance = async () => {
    if (!departure || !arrival) {
      alert("출발지와 도착지를 입력해주세요.");
      return;
    }
    const addresses = [departure, ...nonEmptyWaypoints, arrival];
    const result = await calculateDistance(addresses);
    if (!result || isNaN(result)) {
      dispatch(setDistance(0));
      return;
    }
    dispatch(setDistance(result));
    dispatch(setMinWeight(weight));
    dispatch(setMaxWeight(weight));
  };

  const resetAddresses = () => {
    setDeparture("");
    setArrival("");
    setWaypoints([]);
    dispatch(setDistance(0));
  };

  // 기본 주소 저장/삭제/적용
  const saveDefaultAddress = async () => {
    if (!companyId) {
      alert("로그인/회사 식별 정보가 없어 기본 주소를 저장할 수 없습니다.");
      return;
    }
    const items = [];
    if (departure) items.push({ type: LABEL_TO_TYPE["출발지"], value: departure });
    if (arrival) items.push({ type: LABEL_TO_TYPE["도착지"], value: arrival });
    nonEmptyWaypoints.forEach((w) => items.push({ type: LABEL_TO_TYPE["경유지"], value: w }));
    if (items.length === 0) {
      alert("저장할 주소가 없습니다.");
      return;
    }
    try {
      const saved = await saveSavedAddressesBulk(companyId, items);
      setSavedAddresses(saved);
      alert("기본 주소가 저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("기본 주소 저장에 실패했습니다.");
    }
  };
  const removeDefaultAddress = async (addr) => {
    try {
      await deleteSavedAddress(addr.id);
      setSavedAddresses((prev) => prev.filter((a) => a.id !== addr.id));
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };
  const applySavedAddress = (addr) => {
    const label = TYPE_TO_LABEL[addr.type] || "기타";
    if (label === "출발지") setDeparture(addr.value);
    else if (label === "도착지") setArrival(addr.value);
    else if (label === "경유지") {
      setWaypoints((prev) => {
        const updated = [...prev];
        const emptyIndex = updated.findIndex((v) => !v);
        if (emptyIndex !== -1) updated[emptyIndex] = addr.value;
        else if (updated.length < 3) updated.push(addr.value);
        return updated;
      });
    }
  };

  // 화물 선택 - 하드코딩 방식
  const handleCargoSelect = (value) => {
    if (value && !cargoTypes.includes(value)) {
      setCargoTypes([...cargoTypes, value]);
    }
  };
  const handleCargoRemove = (value) => setCargoTypes(cargoTypes.filter((v) => v !== value));

  // ✅ flow 구성 (서버 DTO와 완벽 호환)
  const buildFlow = () => {
    // 각 경유지에 최소 cargo 구조 포함 - 백엔드 DeliveryWaypointRequestDTO.cargo와 정확히 일치
    const waypointDtos = (nonEmptyWaypoints || []).map((addr, idx) => ({
      waypointId: null,
      address: addr,
      dropOrder: idx + 1,
      arriveAt: null,
      droppedAt: null,
      status: "PENDING",
      requestId: null,
      // DeliveryWaypointRequestDTO.cargo (필드 전체 포함)
      cargo: {
        cargoId: null,
        description: title || "배송 화물",
        droppedAt: null,
        handlingId: cargoTypes.length > 0 ? 1 : null, // 기본값 1 (일반화물)
        waypointId: null,
      },
    }));

    const requestDto = {
      // DeliveryRequestRequestDTO 주요 필드 - 백엔드와 정확히 일치
      requestId: null,
      startAddress: departure,
      endAddress: arrival,
      memoToDriver: title,
      totalCargoCount: waypointDtos.length + 1,
      totalCargoWeight: Math.round(Number(weight) * 1000), // 톤 → kg 단위로 변환
      estimatedFee: Math.round(Number(price)),
      distance: Math.round(Number(distance)),
      createAt: null,
      wantToStart: toYmdHms(startDate),
      wantToEnd: toYmdHms(endDate),
      expectedPolyline: null, // TODO: 실제 폴리라인 데이터
      expectedRoute: null, // TODO: 실제 경로 데이터
      status: "REGISTERED",
      paymentId: null,
      companyId: companyId != null ? Number(companyId) : null,
      vehicleTypeId: Number(vehicleTypeId),
      waypoints: waypointDtos,
      
      // 요청 단위 취급유형 태그(문자열 리스트). 서버에서 필요 시 handlingId로 매핑 가능.
      cargoTypes: cargoTypes,
    };

    const paymentDto = buildPaymentDTO(price);

    return {
      requestDto,
      paymentDto,
      ui: { distanceOnlyPrice, hasMountainRegion, nonEmptyWaypointsCount: nonEmptyWaypoints.length },
      summary: {
        departure,
        arrival,
        waypoints: nonEmptyWaypoints,
        weight,
        vehicleTypeId,
        cargoTypes,
        title,
        startDate: toYmdHms(startDate),
        endDate: toYmdHms(endDate),
        distance: Math.round(Number(distance)) || 0,
        totalPrice: Math.round(Number(price)) || 0,
      },
    };
  };

  // ✅ 값 변경 시 draft 자동 저장
  useEffect(() => {
    const d = {
      departure,
      arrival,
      waypoints,
      cargoTypes,
      vehicleTypeId,
      title,
      weight,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      distance,
      price,
    };
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
  }, [departure, arrival, waypoints, cargoTypes, vehicleTypeId, title, weight, startDate, endDate, distance, price]);

  // 이동
  const goDriverSearch = () => {
    if (!departure || !arrival || !title || !startDate || !endDate || !distance || !price || !vehicleTypeId || cargoTypes.length === 0) {
      alert("필수 항목(차량/화물/날짜/주소/금액 등)을 모두 입력하고 계산을 완료해주세요.");
      return;
    }
    
    const flow = buildFlow();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
    navigate("/search-drivers", { state: { flow } });
  };

  // 그냥 요청하기 → 서버 저장 후 결제(or driver측)
  const handleRequest = async () => {
    if (!departure || !arrival || !title || !startDate || !endDate || !distance || !price || !vehicleTypeId || cargoTypes.length === 0) {
      alert("필수 항목(차량/화물/날짜/주소/금액 등)을 모두 입력하고 계산을 완료해주세요.");
      return;
    }
    
    const ok = window.confirm("이 내용으로 요청하시겠습니까?");
    if (!ok) return;

    const flow = buildFlow();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flow));

    try {
      const requestId = await createDeliveryRequest(flow.requestDto, flow.paymentDto);
      navigate("/company/payment", { state: { flow: { ...flow, requestId } } });
    } catch (e) {
      const data = e?.response?.data;
      console.error("createDeliveryRequest error:", data || e);
      alert(`저장에 실패했습니다.\n${data?.message || data?.error || ""}`);
    }
  };

  return (
    <div className="estimate-container">
      <h2> 예상 금액 계산</h2>

      {/* 주소 입력/검색 */}
      <div className="address-row">
        <button className="address-button" onClick={() => openAddressPopup(setDeparture)}>출발지 검색</button>
        <button className="address-button" onClick={() => openAddressPopup(setArrival)}>도착지 검색</button>
        <button
          className="address-button"
          onClick={() => {
            if (waypoints.length < 3) setWaypoints([...waypoints, ""]);
            else alert("경유지는 최대 3개까지 추가할 수 있습니다.");
          }}
        >
          경유지 추가
        </button>
      </div>

      <div className="form-row"><div>출발지: {departure || "(미입력)"}</div></div>
      <div className="form-row"><div>도착지: {arrival || "(미입력)"}</div></div>

      {waypoints.map((w, i) => (
        <div className="form-row waypoint-row" key={i}>
          <span>경유지 {i + 1}:</span>
          <button className="address-button small waypoint-search" onClick={() => openWaypointPopup(i)}>검색</button>
          <span>{w || "(미입력)"}</span>
          <button className="delete-waypoint-btn small" onClick={() => handleRemoveWaypoint(i)} aria-label={`경유지 ${i + 1} 삭제`} title="삭제">삭제</button>
        </div>
      ))}

      <div className="button-row">
        <button className="action-button small" onClick={resetAddresses}>거리 다시 계산</button>
        <button className="action-button small" onClick={handleCalculateDistance}>거리 및 금액 계산</button>
        <button className="action-button small" onClick={saveDefaultAddress}>기본주소로 설정</button>
      </div>

      {savedAddresses.length > 0 && (
        <div className="info-section">
          <p>📌 저장된 기본 주소:</p>
          {savedAddresses.map((addr) => (
            <div key={addr.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{TYPE_TO_LABEL[addr.type] || addr.type}: {addr.value}</span>
              <div>
                <button onClick={() => applySavedAddress(addr)} style={{ marginRight: "8px" }}>선택</button>
                <button onClick={() => removeDefaultAddress(addr)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 요약 */}
      <div className="info-section">
        <p>예상 거리 : {distance ? Math.floor(distance) + " km" : "0 km"}</p>
        <p>거리 예상 금액 : {distanceOnlyPrice.toLocaleString()} 원</p>
      </div>

      {/* 차량 + 화물 */}
      <div className="form-row">
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            차량 종류 선택 (필수) *
          </label>
          <select value={vehicleTypeId} onChange={(e) => setVehicleTypeId(Number(e.target.value) || "")}>
            <option value="">차량 종류를 선택해주세요</option>
            {vehicleTypes.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            화물 종류 추가 (다중 선택 가능)
          </label>
          <select onChange={(e) => handleCargoSelect(e.target.value)}>
            <option value="">화물 종류를 선택해주세요</option>
            {cargoTypeOptions.map((opt) => (
              <option key={opt.id} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 선택된 화물 태그 */}
      <div className="form-row tag-list">
        <div style={{ marginBottom: "8px", fontSize: "12px", color: "#666" }}>
          선택된 화물 종류:
        </div>
                 {cargoTypes.map((cargoType) => (
           <span key={cargoType}>
             {cargoType}
             <button onClick={() => handleCargoRemove(cargoType)}>x</button>
           </span>
         ))}
      </div>

      {/* 제목 */}
      <div className="form-row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="배송 메모 (필수)" />
      </div>

      {/* 무게 */}
      <div className="weight-slider">
        <label> 무게 선택 (1톤 ~ 26톤)</label>
        <input type="range" min="1" max="26" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
        <div className="weight-labels">
          <span>1톤</span><span>{weight}톤</span><span>26톤</span>
        </div>
      </div>

      {/* 상세 요금 내역 */}
      <div className="info-section">
        <p>상세 요금 내역</p>
        <ul style={{ marginTop: 6, lineHeight: 1.6 }}>
          <li>거리 요금: {distanceOnlyPrice.toLocaleString()}원</li>
          <li>무게 요금(톤당 30,000): {(weight * 30000).toLocaleString()}원</li>
                     {cargoTypes.map(ct => ct.includes("취급주의") && (
             <li key={ct}>{ct} 추가요금: +{(5000).toLocaleString()}원</li>
           ))}
          {nonEmptyWaypoints.length > 0 && <li>경유지 추가요금 ({nonEmptyWaypoints.length}개 × 50,000): {(nonEmptyWaypoints.length * 50000).toLocaleString()}원</li>}
          {hasMountainRegion && <li>산간지역(강원도) 추가요금: +50,000원</li>}
        </ul>
        <p style={{ marginTop: 8, fontWeight: 600 }}>총 예상 금액: {price.toLocaleString()}원</p>
      </div>

      {/* 날짜 */}
      <p className="delivery-label">배송 희망 날짜 :</p>
      <div className="datepicker-row">
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="출발 날짜" showTimeSelect dateFormat="yyyy-MM-dd HH:mm" />
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="도착 날짜" showTimeSelect dateFormat="yyyy-MM-dd HH:mm" />
      </div>

      {/* 액션 */}
      <div className="form-row">
        <button className="driver-button" onClick={goDriverSearch}>기사님 검색</button>
        <button className="submit-button" onClick={handleRequest}>요청하기</button>
      </div>

      <p className="inquiry" onClick={() => navigate("/company/report")}>문의하기</p>
    </div>
  );
};

export default EstimateForm;
