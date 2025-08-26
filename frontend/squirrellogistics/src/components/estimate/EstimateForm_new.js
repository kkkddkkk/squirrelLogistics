import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import {
  calculateDistance,
  createDeliveryRequest,
  fetchVehicleTypes,
} from "../../api/estimate/estimateApi";
import { useSelector, useDispatch } from "react-redux";
import { setDistance } from "../../slice/estimate/estimateSlice";
import CargoDialog from "./CargoDialog";
import PaymentDialog from "./PaymentDialog";

import http from "../../api/user/api"; // 기본주소용 http 인스턴스
import "./EstimateForm.css";

const STORAGE_KEY = "deliveryFlow";
const WAYPOINT_FEE_PER_ITEM = 50000;
const MOUNTAIN_FEE = 50000;
const includesGangwon = (addr) => (addr || "").includes("강원");

const EstimateForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // redux
  const { distance } = useSelector((s) => s.estimate);
  const userId = useSelector((s) => s.auth?.user?.id);

  // 주소/화물 상태
  const [hubAddress, setHubAddress] = useState("");
  const [finalAddress, setFinalAddress] = useState("");
  const [memoToDriver, setMemoToDriver] = useState("");
  const [finalCargo, setFinalCargo] = useState(null);
  const [waypoints, setWaypoints] = useState([]); // [{ address, cargo }]
  const [totalCargoCount, setTotalCargoCount] = useState(0);
  const [totalCargoWeight, setTotalCargoWeight] = useState(0);
  const [companyId, setCompanyId] = useState(null);

  // 차량/요청 상태
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [price, setPrice] = useState(0);
  const [distanceOnlyPrice, setDistanceOnlyPrice] = useState(0);
  const [weight, setWeight] = useState(13); // 전체 톤(요금 산정용, CargoDialog와 별개)
  const [cargoTypes, setCargoTypes] = useState([]); // ["위험물 (취급주의 +5000)", ...]

  // 날짜
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 저장된 기본 주소
  const [savedAddresses, setSavedAddresses] = useState([]);

  // 다이얼로그 상태
  // number(경유지 인덱스) | "final"(최종 목적지) | null
  const [cargoDialogIdx, setCargoDialogIdx] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const allCargos = useMemo(() => {
    const list = [];
    waypoints.forEach((w) => { if (w?.cargo) list.push(w.cargo); });
    if (finalCargo) list.push(finalCargo);
    return list;
  }, [waypoints, finalCargo]);

  const hasCarefulHandling = useMemo(
    () => allCargos.some(c => Number(c.handlingId) === 2 || /취급주의|위험/.test(c?.description || "")),
    [allCargos]
  );

  const hasColdChain = useMemo(
    () => allCargos.some(c => Number(c.handlingId) === 3 || /냉장|냉동/.test(c?.description || "")),
    [allCargos]
  );

  // (선택) UI/페이로드 태그로도 쓰려면 cargoTypes를 동기화
  useEffect(() => {
    const tags = [];
    if (hasCarefulHandling) tags.push("취급주의");
    if (hasColdChain) tags.push("냉장식품");
    setCargoTypes(tags);
  }, [hasCarefulHandling, hasColdChain]);

  // nonEmptyWaypoints: 주소값이 있는 경유지
  const nonEmptyWaypoints = useMemo(
    () =>
      (waypoints || [])
        .map((w) => (typeof w === "string" ? w : w?.address || ""))
        .filter((a) => a.trim() !== ""),
    [waypoints]
  );

  // 산간지역 여부 (집하지/경유/최종 목적지 중 강원도 포함 판정)
  const hasMountainRegion = useMemo(
    () => [hubAddress, ...nonEmptyWaypoints, finalAddress].some(includesGangwon),
    [hubAddress, nonEmptyWaypoints, finalAddress]
  );

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const storedCompanyId = localStorage.getItem("companyId");
      console.log("=== Company 정보 조회 시작 ===");
      console.log("localStorage companyId:", storedCompanyId);

      if (storedCompanyId) {
        setCompanyId(parseInt(storedCompanyId));
        console.log("저장된 companyId 사용:", parseInt(storedCompanyId));
        return;
      }

      // localStorage에 companyId가 없으면 토큰 기반 API로 조회
      try {
        console.log("토큰 기반 API로 companyId 조회 시도...");

        // 먼저 테스트 API 호출
        try {
          const testResponse = await http.get(`/api/company/test`);
          console.log("테스트 API 성공:", testResponse.data);
        } catch (testError) {
          console.error("테스트 API 실패:", testError);
        }

        // 새로운 토큰 기반 API 사용
        // /api/company/current-user - Authorization 헤더 자동 포함
        const response = await http.get(`/api/company/current-user`);
        console.log("토큰 기반 API 조회 성공:", response.data);

        // 응답 데이터 안전성 검증
        if (response.data && response.data.companyId !== null && response.data.companyId !== undefined) {
          const companyId = response.data.companyId;
          console.log("companyId 확인:", companyId);

          // localStorage에 저장
          localStorage.setItem("companyId", companyId.toString());
          setCompanyId(companyId);

          // 기본 주소가 있으면 로드
          if (response.data.mainLoca && response.data.mainLoca.trim() !== "") {
            console.log("기본 주소 발견:", response.data.mainLoca);
            // TODO: 기본 주소를 UI에 표시
          }
        } else {
          console.warn("companyId가 응답에 없거나 null/undefined:", response.data);
          setCompanyId(null);
        }
      } catch (error) {
        console.error("토큰 기반 API 호출 실패:", error);
        console.error("오류 상세:", error.response?.data || error.message);

        // 에러 응답에서 더 자세한 정보 추출
        if (error.response?.data?.error) {
          console.error("서버 에러 메시지:", error.response.data.error);
        }

        setCompanyId(null);
      }
    };

    fetchCompanyInfo();
  }, []);
  console.log("companyId:", companyId);

  // 차량 목록 로딩
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchVehicleTypes();
        setVehicleTypes(list || []);
        console.log("[fetchVehicleTypes] =>", list);
      } catch (e) {
        console.error("차량 목록 로드 실패:", e);
      }
    })();
  }, []);

  // 기본 주소 로드
  useEffect(() => {
    loadSavedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const loadSavedAddresses = async () => {
    if (!companyId) return;
    try {
      console.log("[loadSavedAddresses] companyId:", companyId);
      const res = await http.get(`/api/company/get-address/${companyId}`);
      console.log("[loadSavedAddresses] response:", res?.data);
      if (res?.data?.mainLoca) {
        setSavedAddresses([{ id: 1, type: "START", value: res.data.mainLoca }]);
      } else {
        setSavedAddresses([]);
      }
    } catch (e) {
      console.error("주소 로드 실패:", e);
      setSavedAddresses([]);
    }
  };

  const saveDefaultAddress = async () => {
    if (!companyId || !hubAddress) {
      alert("회사ID나 출발지가 없습니다.");
      return;
    }
    try {
      console.log("[saveDefaultAddress] companyId:", companyId, "address:", hubAddress);
      await http.post(`/api/company/save-address`, {
        companyId,
        address: hubAddress,
        type: "START",
      });
      alert("기본 주소 저장 성공");
      loadSavedAddresses();
    } catch (e) {
      console.error("기본 주소 저장 실패:", e);
      alert("저장 실패");
    }
  };

  const removeDefaultAddress = async () => {
    try {
      console.log("[removeDefaultAddress] companyId:", companyId);
      await http.post(`/api/company/save-address`, {
        companyId,
        address: "",
        type: "CLEAR",
      });
      setSavedAddresses([]);
      alert("기본 주소 삭제됨");
    } catch (e) {
      console.error("삭제 실패:", e);
      alert("삭제 실패");
    }
  };

  const applySavedAddress = (addr) => {
    console.log("[applySavedAddress] applying:", addr);
    setHubAddress(addr);
    alert(`출발지로 적용: ${addr}`);
  };

  // 거리/요금 + 화물 합계 계산
  const handleCalculateDistance = async () => {
    if (!hubAddress || !finalAddress) {
      alert("집하지와 최종 목적지를 입력해주세요.");
      return;
    }
    const addresses = [hubAddress, ...waypoints.map((w) => w.address).filter(Boolean), finalAddress];
    console.log("[handleCalculateDistance] addresses:", addresses);
    const result = await calculateDistance(addresses);
    const km = Number(result) || 0;

    console.log("[handleCalculateDistance] km:", km);
    dispatch(setDistance(km));
    setPrice(100000 + Math.ceil(km) * 3000);

    // 화물 합계
    const waypointWeightSum = waypoints.reduce((s, w) => s + (w.cargo?.weightKg || 0), 0);
    const totalWeight = waypointWeightSum + (finalCargo?.weightKg || 0);
    const waypointCargoCount = waypoints.filter((w) => !!w.cargo).length;
    const totalCount = waypointCargoCount + (finalCargo ? 1 : 0);

    console.log("[handleCalculateDistance] totalCount:", totalCount, "totalWeight:", totalWeight);
    setTotalCargoWeight(totalWeight);
    setTotalCargoCount(totalCount);

    const priceWeightTon = Math.max(1, Math.ceil(totalWeight / 1000));
    setWeight(priceWeightTon);
  };

  // 경유지 추가/삭제
  const addWaypoint = () => {
    if (waypoints.length >= 3) {
      alert("경유지는 최대 3개까지 가능합니다.");
      return;
    }
    setWaypoints((prev) => [...prev, { address: "", cargo: null }]);
    console.log("[addWaypoint] after add:", waypoints);
  };
  const handleRemoveWaypoint = (index) =>
    setWaypoints((prev) => {
      const next = prev.filter((_, i) => i !== index);
      console.log("[handleRemoveWaypoint] removed index:", index, "=>", next);
      return next;
    });

  // 주소 검색
  const openAddressPopup = (setter) => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        console.log("[AddressPopup selected]", data?.address);
        setter(data.address);
      },
    }).open();
  };
  const openWaypointAddress = (idx) => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        console.log("[WaypointPopup selected]", idx, data?.address);
        setWaypoints((prev) => {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], address: data.address };
          return copy;
        });
      },
    }).open();
  };

  // 화물 저장 (경유지 / 최종 목적지)
  const handleSaveCargo = (cargo) => {
    console.log("[handleSaveCargo] cargoDialogIdx:", cargoDialogIdx, "cargo:", cargo);
    if (cargoDialogIdx === "final") {
      setFinalCargo(cargo);
    } else if (typeof cargoDialogIdx === "number") {
      setWaypoints((prev) => {
        const copy = [...prev];
        copy[cargoDialogIdx] = { ...copy[cargoDialogIdx], cargo };
        return copy;
      });
    }
    setCargoDialogIdx(null);
  };

  // payload 빌드
  const buildPayload = (payment) => {
    let order = 1;
    const wp = [];
    wp.push({ address: hubAddress, dropOrder: order++, status: "PENDING" });
    waypoints.forEach((w) =>
      wp.push({
        address: w.address,
        dropOrder: order++,
        status: "PENDING",
        ...(w.cargo
          ? {
            cargo: {
              description: w.cargo.description,
              handlingId: w.cargo.handlingId
            },
          }
          : {}),
      })
    );
    wp.push({
      address: finalAddress,
      dropOrder: order++,
      status: "PENDING",
      ...(finalCargo ? {
        cargo: {
          description: finalCargo.description,
          handlingId: finalCargo.handlingId
        }
      } : {}),
    });

    const payload = {
      payment,
      request: {
        startAddress: hubAddress,
        endAddress: finalAddress,
        memoToDriver,
        totalCargoCount,
        totalCargoWeight,
        estimatedFee: price,
        distance: Math.round(Number(distance) || 0),
        wantToStart: startDate ? startDate.toISOString().slice(0, 19).replace("T", " ") : null,
        wantToEnd: endDate ? endDate.toISOString().slice(0, 19).replace("T", " ") : null,
        companyId,
        vehicleTypeId: vehicleTypeId ? Number(vehicleTypeId) : null,
        waypoints: wp
      },
    };

    console.log("[buildPayload] =>", payload);
    return payload;
  };

  // 기사님 검색 이동
  const goDriverSearch = () => {
    const flow = buildPayload(null);
    console.log("[goDriverSearch] flow saved to sessionStorage:", flow);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
    navigate("/driverSearch", { state: { flow } });
  };

  // 요청 확정 후 결제 페이지 이동
  const handleConfirmPayment = async (payment) => {
    const payload = buildPayload(payment);
    try {
      console.log("[handleConfirmPayment] sending:", payload);

      // API가 (payload) 또는 (request, payment) 형태 중 어느 걸 받는지 환경에 따라 다르면 두 방식 모두 시도
      let requestId;
      try {
        requestId = await createDeliveryRequest(payload.request, payload.payment);
      } catch (e1) {
        console.warn("[createDeliveryRequest(payload)] 실패, (request,payment) 시도:", e1?.response?.data || e1);
        requestId = await createDeliveryRequest(payload.request, payload.payment);
      }

      console.log("[createDeliveryRequest] success, requestId:", requestId);
      alert("요청이 저장되었습니다.");

      navigate("/company/payment", {
        state: {
          flow: { ...payload, requestId },
          requestId,
          paymentAmount: payment?.payAmount || price,
        },
      });
    } catch (e) {
      console.error("[handleConfirmPayment] error:", e?.response?.data || e);
      alert("저장 실패");
    }
  };

  // 요금 계산(useEffect)
  useEffect(() => {
    // 1) 거리 요금: 기본 100,000 + (표시 km * 3,000)
    const km = Number(distance) || 0;
    const kmForPricing = Math.floor(km); // 표시와 동일하게
    const baseByDistance = 100000 + kmForPricing * 3000;
    setDistanceOnlyPrice(baseByDistance);

    // 2) 무게(톤) 요금: 슬라이더(=앞 단계에서 총무게 기반으로 세팅됨)
    let sum = baseByDistance + (Number(weight) || 0) * 30000;

    // 3) 취급 카테고리(있으면 각각 1회만) + 50,000
    if (hasCarefulHandling) sum += 50000;
    if (hasColdChain) sum += 50000;

    // 4) 경유지 추가요금: 경유지 수 * 50,000
    sum += nonEmptyWaypoints.length * WAYPOINT_FEE_PER_ITEM;

    // 5) 산간지역(강원) + 50,000
    if (hasMountainRegion) sum += MOUNTAIN_FEE;

    setPrice(Math.floor(sum));
  }, [distance, weight, nonEmptyWaypoints.length, hasMountainRegion, hasCarefulHandling, hasColdChain]);

  return (
    <div className="estimate-container">
      <h2>🚚 예상 금액 계산</h2>

      {/* 주소 입력 */}
      <div className="address-row">
        <button className="address-button" onClick={() => openAddressPopup(setHubAddress)}>
          집하지 검색
        </button>
        <button className="address-button" onClick={() => openAddressPopup(setFinalAddress)}>
          최종 목적지 검색
        </button>
        <button className="address-button" onClick={addWaypoint}>
          경유지 추가
        </button>
      </div>

      <div className="form-row">집하지: {hubAddress || "(미입력)"}</div>

      {waypoints.map((w, i) => (
        <div key={i} className="form-row">
          {i + 1}번 경유지: {w.address || "주소 없음"} /{" "}
          {w.cargo ? `${w.cargo.description}, ${w.cargo.weightKg}kg` : "화물 없음"}
          <button
            className="address-button small waypoint-search"
            onClick={() => openWaypointAddress(i)}
          >
            주소 검색
          </button>
          <button
            className="address-button small waypoint-search"
            onClick={() => setCargoDialogIdx(i)}
          >
            화물 입력
          </button>
          <button
            className="address-button small waypoint-search"
            onClick={() => handleRemoveWaypoint(i)}
            aria-label={`경유지 ${i + 1} 삭제`}
            title="삭제"
          >
            경유지 삭제
          </button>
        </div>
      ))}

      <div className="form-row">
        최종 목적지: {finalAddress || "(미입력)"}{" "}
        {finalCargo ? `/ 화물: ${finalCargo.description}, ${finalCargo.weightKg}kg` : ""}
        <button
          className="address-button small waypoint-search"
          onClick={() => setCargoDialogIdx("final")}
          style={{ marginLeft: 8 }}
        >
          최종 목적지 화물 입력
        </button>
      </div>

      {/* 거리/요금 & 기본 주소 */}
      <div className="button-row">
        <button className="action-button small" onClick={handleCalculateDistance}>
          거리 및 금액 계산
        </button>
        <button className="action-button small" onClick={saveDefaultAddress}>
          기본주소로 설정
        </button>
      </div>

      {savedAddresses.length > 0 && (
        <div className="info-section">
          <p>📌 저장된 기본 주소</p>
          {savedAddresses.map((addr) => (
            <div key={addr.id}>
              {addr.type}: {addr.value}
              <button onClick={() => applySavedAddress(addr.value)} style={{ marginLeft: 8 }}>
                적용
              </button>
              <button onClick={removeDefaultAddress} style={{ marginLeft: 8 }}>
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 상세 운송/요금 내역 */}
      <div className="info-section">
        <p>상세 운송 내역</p>
        <ul style={{ marginTop: 6, lineHeight: 1.6 }}>
          <li>예상 거리: {Number(Math.floor(distance) || 0)} km</li>
          <li>총 화물 개수: {totalCargoCount} 개</li>
          <li>총 화물 무게: {totalCargoWeight} kg</li>
        </ul>

        <p>상세 요금 내역</p>
        <ul style={{ marginTop: 6, lineHeight: 1.6 }}>
          <li>거리 요금: {Number(distanceOnlyPrice || 0).toLocaleString()}원</li>
          <li>무게 요금 (톤당 30,000): {(Number(weight) * 30000).toLocaleString()}원</li>

          {hasCarefulHandling && <li>취급주의 추가요금: +{(50000).toLocaleString()}원</li>}
          {hasColdChain && <li>냉장식품 추가요금: +{(50000).toLocaleString()}원</li>}

          {nonEmptyWaypoints.length > 0 && (
            <li>
              경유지 추가요금 ({nonEmptyWaypoints.length}개 × 50,000):{" "}
              {(nonEmptyWaypoints.length * 50000).toLocaleString()}원
            </li>
          )}
          {hasMountainRegion && <li>산간지역(강원도) 추가요금: +{(50000).toLocaleString()}원</li>}
        </ul>

        <p style={{ marginTop: 8, fontWeight: 600 }}>
          총 예상 금액: {Number(price || 0).toLocaleString()}원
        </p>
      </div>

      {/* 차량 선택 */}
      <div className="form-row">
        <select value={vehicleTypeId} onChange={(e) => setVehicleTypeId(e.target.value)}>
          <option value="">차량 선택</option>
          {vehicleTypes.map((v) => (
            <option key={v.id ?? v.vehicleTypeId ?? v.vehicle_type_id} value={v.id ?? v.vehicleTypeId ?? v.vehicle_type_id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* 날짜 */}
      <p className="delivery-label">배송 희망 날짜 :</p>
      <div className="datepicker-row">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="출발 날짜"
          showTimeSelect
          dateFormat="yyyy-MM-dd HH:mm"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="도착 날짜"
          showTimeSelect
          dateFormat="yyyy-MM-dd HH:mm"
        />
      </div>

      {/* 액션 */}
      <div className="form-row">
        <button
          className="driver-button"
          onClick={() => {
            console.log("[Click] 기사님 검색");
            goDriverSearch();
          }}
        >
          기사님 검색
        </button>
        <button
          className="submit-button"
          onClick={() => {
            console.log("[Click] 요청하기 (결제 다이얼로그 오픈)");
            setPaymentOpen(true);
          }}
        >
          요청하기
        </button>
      </div>

      {/* 다이얼로그 */}
      {cargoDialogIdx != null && (
        <CargoDialog
          open={cargoDialogIdx != null}
          onClose={() => setCargoDialogIdx(null)}
          onSave={handleSaveCargo}
        />
      )}

      <PaymentDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onConfirm={handleConfirmPayment}
        amount={price}
      />
    </div>
  );
};

export default EstimateForm;