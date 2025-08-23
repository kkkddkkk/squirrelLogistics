import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchCars, updateCar, deleteCar, createCar } from "../../api/cars";

const helperProps = { sx: { minHeight: "20px" } }; // helperText 높이 고정

const ManageVehicles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 차량 추가 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [isManualAdd, setIsManualAdd] = useState(false); // 수동 추가 여부
  const [additionalForms, setAdditionalForms] = useState([]); // 추가된 폼들
  const [deletedVehicleIds, setDeletedVehicleIds] = useState([]); // 삭제된 차량 ID들
  const [newVehicle, setNewVehicle] = useState({
    vehiclePlateNumber: "",
    vehicleType: "",
    firstRegistrationDate: dayjs().format("YYYY-MM-DD"),
    loadCapacity: "",
    currentDistance: "",
    vehicleStatus: "운행 가능",
    lastInspectionDate: null,
    nextMaintenanceDate: null,
    insuranceStatus: "무",
    insuranceStartDate: null,
    insuranceEndDate: null,
    licenseNum: "",
    licenseDT: null,
    startTime: dayjs().hour(7).minute(0),
    endTime: dayjs().hour(18).minute(0),
    preferredAreas: "",
  });

  // loadCapacity를 vehicleType 이름에 따라 매핑하는 함수
  const getLoadCapacityFromVehicleType = (vehicleTypeName) => {
    if (!vehicleTypeName) return "";

    if (vehicleTypeName.includes("1톤")) return "1~3톤";
    if (vehicleTypeName.includes("1.4톤")) return "1~3톤";
    if (vehicleTypeName.includes("2.5톤")) return "1~3톤";
    if (vehicleTypeName.includes("3.5톤")) return "3~5톤";
    if (vehicleTypeName.includes("5톤")) return "5~10톤";
    if (vehicleTypeName.includes("8톤")) return "5~10톤";
    if (vehicleTypeName.includes("10톤")) return "10~15톤";
    if (vehicleTypeName.includes("25톤")) return "25톤 초과";

    return "1~3톤"; // 기본값
  };

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Profile 페이지와 같은 방식으로 기사 정보 조회
      const driverData = await fetchCars({
        page: 1,
        size: 10,
        keyword: "",
        status: "",
      });
      console.log("가져온 기사 프로필 데이터:", driverData);

      // 기사 프로필에서 차량 정보 추출
      if (driverData && Array.isArray(driverData) && driverData.length > 0) {
        // API에서 차량 정보를 성공적으로 가져온 경우
        const formattedVehicles = driverData.map((car) => {
          console.log("개별 차량 데이터 (ManageVehicles):", car);

          return {
            id: car.carId || car.id,
            vehicleNumber: car.carNum || car.vehicleNumber || "",
            vehiclePlateNumber: car.carNum || car.vehicleNumber || "",
            firstRegistrationDate:
              car.regDate || car.registrationDate
                ? dayjs(car.regDate || car.registrationDate).format(
                    "YYYY-MM-DD"
                  )
                : dayjs().format("YYYY-MM-DD"),
            vehicleType: car.vehicleType?.name || car.vehicleType || "",
            loadCapacity: getLoadCapacityFromVehicleType(car.vehicleType?.name), // 수정된 부분
            vehicleStatus: car.carStatus || car.vehicleStatus || "운행 가능",
            currentDistance:
              car.Mileage || car.currentDistance
                ? `${(car.Mileage || car.currentDistance).toLocaleString()}`
                : "0",
            lastInspectionDate:
              car.inspection || car.lastInspection
                ? dayjs(car.inspection || car.lastInspection)
                : null,
            nextMaintenanceDate:
              car.inspection || car.nextInspection
                ? dayjs(car.inspection || car.nextInspection)
                : null,
            operationStatus: car.carStatus || car.vehicleStatus || "운행중",
            insuranceStatus: car.insurance ? "유" : "무",
            insuranceStartDate: null,
            insuranceEndDate: null,
            licenseNum: car.driver?.licenseNum || car.licenseNum || "",
            licenseDT:
              car.driver?.licenseDT || car.licenseDT
                ? dayjs(car.driver?.licenseDT || car.licenseDT)
                : null,
            startTime:
              car.driver?.preferred_start_time || car.startTime
                ? dayjs(
                    car.driver?.preferred_start_time || car.startTime,
                    "HH:mm:ss"
                  )
                : dayjs().hour(7).minute(0),
            endTime:
              car.driver?.preferred_end_time || car.endTime
                ? dayjs(
                    car.driver?.preferred_end_time || car.endTime,
                    "HH:mm:ss"
                  )
                : dayjs().hour(18).minute(0),
            preferredAreas: car.driver?.mainLoca || car.preferredAreas || "",
          };
        });

        setVehicles(formattedVehicles);

        // API에서 가져온 데이터를 localStorage에 저장 (캐싱용)
        const localStorageVehicles = formattedVehicles.map((vehicle) => ({
          id: vehicle.id,
          registrationDate: vehicle.firstRegistrationDate
            ? dayjs(vehicle.firstRegistrationDate).format("YYYY.M.D")
            : new Date().toLocaleDateString("ko-KR"),
          vehicleNumber: vehicle.vehicleNumber,
          vehicleType: vehicle.vehicleType,
          loadCapacity: vehicle.loadCapacity,
          vehicleStatus: vehicle.vehicleStatus,
          insuranceStatus: vehicle.insuranceStatus,
          currentDistance: vehicle.currentDistance,
          lastInspection: vehicle.lastInspectionDate
            ? dayjs(vehicle.lastInspectionDate).format("YYYY.M.D")
            : "점검일 정보 없음",
          nextInspection: vehicle.nextMaintenanceDate
            ? dayjs(vehicle.nextMaintenanceDate).format("YYYY.M.D")
            : "점검일 정보 없음",
          icon: "🚛",
        }));

        localStorage.setItem(
          "driverVehicles",
          JSON.stringify(localStorageVehicles)
        );
        console.log(
          "API에서 가져온 차량 정보를 localStorage에 저장:",
          localStorageVehicles
        );

        return;
      }

      // API에서 차량 정보가 없는 경우 localStorage 확인
      console.log("API에서 차량 정보 없음 - localStorage 확인");
      const savedVehicles = localStorage.getItem("driverVehicles");
      console.log("localStorage에서 가져온 차량 정보:", savedVehicles);

      if (savedVehicles) {
        const parsedVehicles = JSON.parse(savedVehicles);
        console.log("파싱된 차량 정보:", parsedVehicles);

        // localStorage 데이터를 프론트엔드 형식으로 변환
        const formattedVehicles = parsedVehicles.map((vehicle) => {
          console.log("개별 차량 데이터 (ManageVehicles):", vehicle);

          return {
            id: vehicle.id,
            vehicleNumber: vehicle.vehicleNumber || "",
            vehiclePlateNumber: vehicle.vehicleNumber || "",
            firstRegistrationDate: vehicle.registrationDate
              ? dayjs(vehicle.registrationDate, "YYYY.M.D").format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD"),
            vehicleType: vehicle.vehicleType || "",
            loadCapacity: vehicle.loadCapacity || "1~3톤", // 기본값 설정
            vehicleStatus: vehicle.vehicleStatus || "운행 가능",
            currentDistance: vehicle.currentDistance || "0",
            lastInspectionDate:
              vehicle.lastInspection &&
              vehicle.lastInspection !== "점검일 정보 없음"
                ? dayjs(vehicle.lastInspection, "YYYY.M.D")
                : null,
            nextMaintenanceDate:
              vehicle.nextInspection &&
              vehicle.nextInspection !== "점검일 정보 없음"
                ? dayjs(vehicle.nextInspection, "YYYY.M.D")
                : null,
            operationStatus: vehicle.vehicleStatus || "운행중",
            insuranceStatus: vehicle.insuranceStatus || "무",
            insuranceStartDate: null,
            insuranceEndDate: null,
            licenseNum: "",
            licenseDT: null,
            startTime: dayjs().hour(7).minute(0),
            endTime: dayjs().hour(18).minute(0),
            preferredAreas: "",
          };
        });

        setVehicles(formattedVehicles);
        return;
      }

      // 에러 시 빈 배열로 설정하고 추가 폼 표시 (수동 추가가 아닐 때만)
      setVehicles([]);
      if (!isManualAdd) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error("차량 목록 조회 실패:", error);
      setError("차량 정보를 불러오는데 실패했습니다.");

      // API 호출 실패 시 localStorage 확인
      console.log("API 호출 실패 - localStorage 확인");
      const savedVehicles = localStorage.getItem("driverVehicles");

      if (savedVehicles) {
        try {
          const parsedVehicles = JSON.parse(savedVehicles);
          console.log(
            "localStorage에서 가져온 차량 정보 (API 실패 후):",
            parsedVehicles
          );

          // localStorage 데이터를 프론트엔드 형식으로 변환
          const formattedVehicles = parsedVehicles.map((vehicle) => ({
            id: vehicle.id,
            vehicleNumber: vehicle.vehicleNumber || "",
            vehiclePlateNumber: vehicle.vehicleNumber || "",
            firstRegistrationDate: vehicle.registrationDate
              ? dayjs(vehicle.registrationDate, "YYYY.M.D").format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD"),
            vehicleType: vehicle.vehicleType || "",
            loadCapacity: vehicle.loadCapacity || "1~3톤", // 기본값 설정
            vehicleStatus: vehicle.vehicleStatus || "운행 가능",
            currentDistance: vehicle.currentDistance || "0",
            lastInspectionDate:
              vehicle.lastInspection &&
              vehicle.lastInspection !== "점검일 정보 없음"
                ? dayjs(vehicle.lastInspection, "YYYY.M.D")
                : null,
            nextMaintenanceDate:
              vehicle.nextInspection &&
              vehicle.nextInspection !== "점검일 정보 없음"
                ? dayjs(vehicle.nextInspection, "YYYY.M.D")
                : null,
            operationStatus: vehicle.vehicleStatus || "운행중",
            insuranceStatus: vehicle.insuranceStatus || "무",
            insuranceStartDate: null,
            insuranceEndDate: null,
            licenseNum: "",
            licenseDT: null,
            startTime: dayjs().hour(7).minute(0),
            endTime: dayjs().hour(18).minute(0),
            preferredAreas: "",
          }));

          setVehicles(formattedVehicles);
        } catch (parseError) {
          console.error("localStorage 파싱 실패:", parseError);
          setVehicles([]);
          if (!isManualAdd) {
            setShowAddForm(true);
          }
        }
      } else {
        setVehicles([]);
        if (!isManualAdd) {
          setShowAddForm(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isManualAdd]);

  // Profile에서 돌아온 경우 차량 정보 새로고침
  useEffect(() => {
    if (location.state?.fromProfile) {
      console.log("Profile에서 돌아옴 - 차량 정보 새로고침");
      // 차량 정보 새로고침
      fetchVehicles();
      // state 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location.state, fetchVehicles]);

  // showAddForm 상태 디버깅
  useEffect(() => {
    console.log("showAddForm 상태 변경:", showAddForm);
  }, [showAddForm]);

  // 차량 목록 조회
  useEffect(() => {
    console.log("기사 프로필에서 차량 정보 조회 시도");
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError("");

        // Profile 페이지와 같은 방식으로 기사 정보 조회
        const driverData = await fetchCars({
          page: 1,
          size: 10,
          keyword: "",
          status: "",
        });
        console.log("가져온 기사 프로필 데이터:", driverData);

        // 기사 프로필에서 차량 정보 추출
        if (driverData && Array.isArray(driverData) && driverData.length > 0) {
          // API에서 차량 정보를 성공적으로 가져온 경우
          const formattedVehicles = driverData.map((car) => {
            console.log("개별 차량 데이터 (ManageVehicles):", car);

            return {
              id: car.carId || car.id,
              vehicleNumber: car.carNum || car.vehicleNumber || "",
              vehiclePlateNumber: car.carNum || car.vehicleNumber || "",
              firstRegistrationDate:
                car.regDate || car.registrationDate
                  ? dayjs(car.regDate || car.registrationDate).format(
                      "YYYY-MM-DD"
                    )
                  : dayjs().format("YYYY-MM-DD"),
              vehicleType: car.vehicleType?.name || car.vehicleType || "",
              loadCapacity: getLoadCapacityFromVehicleType(
                car.vehicleType?.name
              ), // 수정된 부분
              vehicleStatus: car.carStatus || car.vehicleStatus || "운행 가능",
              currentDistance:
                car.Mileage || car.currentDistance
                  ? `${(car.Mileage || car.currentDistance).toLocaleString()}`
                  : "0",
              lastInspectionDate:
                car.inspection || car.lastInspection
                  ? dayjs(car.inspection || car.lastInspection)
                  : null,
              nextMaintenanceDate:
                car.inspection || car.nextInspection
                  ? dayjs(car.inspection || car.nextInspection)
                  : null,
              operationStatus: car.carStatus || car.vehicleStatus || "운행중",
              insuranceStatus: car.insurance ? "유" : "무",
              insuranceStartDate: null,
              insuranceEndDate: null,
              licenseNum: car.driver?.licenseNum || car.licenseNum || "",
              licenseDT:
                car.driver?.licenseDT || car.licenseDT
                  ? dayjs(car.driver?.licenseDT || car.licenseDT)
                  : null,
              startTime:
                car.driver?.preferred_start_time || car.startTime
                  ? dayjs(
                      car.driver?.preferred_start_time || car.startTime,
                      "HH:mm:ss"
                    )
                  : dayjs().hour(7).minute(0),
              endTime:
                car.driver?.preferred_end_time || car.endTime
                  ? dayjs(
                      car.driver?.preferred_end_time || car.endTime,
                      "HH:mm:ss"
                    )
                  : dayjs().hour(18).minute(0),
              preferredAreas: car.driver?.mainLoca || car.preferredAreas || "",
            };
          });

          setVehicles(formattedVehicles);

          // API에서 가져온 데이터를 localStorage에 저장 (캐싱용)
          const localStorageVehicles = formattedVehicles.map((vehicle) => ({
            id: vehicle.id,
            registrationDate: vehicle.firstRegistrationDate
              ? dayjs(vehicle.firstRegistrationDate).format("YYYY.M.D")
              : new Date().toLocaleDateString("ko-KR"),
            vehicleNumber: vehicle.vehicleNumber,
            vehicleType: vehicle.vehicleType,
            loadCapacity: vehicle.loadCapacity,
            vehicleStatus: vehicle.vehicleStatus,
            insuranceStatus: vehicle.insuranceStatus,
            currentDistance: vehicle.currentDistance,
            lastInspection: vehicle.lastInspectionDate
              ? dayjs(vehicle.lastInspectionDate).format("YYYY.M.D")
              : "점검일 정보 없음",
            nextInspection: vehicle.nextMaintenanceDate
              ? dayjs(vehicle.nextMaintenanceDate).format("YYYY.M.D")
              : "점검일 정보 없음",
            icon: "🚛",
          }));

          localStorage.setItem(
            "driverVehicles",
            JSON.stringify(localStorageVehicles)
          );
          console.log(
            "API에서 가져온 차량 정보를 localStorage에 저장:",
            localStorageVehicles
          );

          // 차량이 없으면 자동으로 추가 폼 표시 (수동 추가가 아닐 때만)
          if (formattedVehicles.length === 0 && !isManualAdd) {
            setShowAddForm(true);
          }
          return;
        }

        // API에서 차량 정보가 없는 경우 localStorage 확인
        console.log("API에서 차량 정보 없음 - localStorage 확인");
        const savedVehicles = localStorage.getItem("driverVehicles");
        console.log("localStorage에서 가져온 차량 정보:", savedVehicles);

        if (savedVehicles) {
          const parsedVehicles = JSON.parse(savedVehicles);
          console.log("파싱된 차량 정보:", parsedVehicles);

          // localStorage 데이터를 프론트엔드 형식으로 변환
          const formattedVehicles = parsedVehicles.map((vehicle) => {
            console.log("개별 차량 데이터 (ManageVehicles):", vehicle);

            return {
              id: vehicle.id,
              vehicleNumber: vehicle.vehicleNumber || "",
              vehiclePlateNumber: vehicle.vehicleNumber || "",
              firstRegistrationDate: vehicle.registrationDate
                ? dayjs(vehicle.registrationDate, "YYYY.M.D").format(
                    "YYYY-MM-DD"
                  )
                : dayjs().format("YYYY-MM-DD"),
              vehicleType: vehicle.vehicleType || "",
              loadCapacity: vehicle.loadCapacity || "1~3톤", // 기본값 설정
              vehicleStatus: vehicle.vehicleStatus || "운행 가능",
              currentDistance: vehicle.currentDistance || "0",
              lastInspectionDate:
                vehicle.lastInspection &&
                vehicle.lastInspection !== "점검일 정보 없음"
                  ? dayjs(vehicle.lastInspection, "YYYY.M.D")
                  : null,
              nextMaintenanceDate:
                vehicle.nextInspection &&
                vehicle.nextInspection !== "점검일 정보 없음"
                  ? dayjs(vehicle.nextInspection, "YYYY.M.D")
                  : null,
              operationStatus: vehicle.vehicleStatus || "운행중",
              insuranceStatus: vehicle.insuranceStatus || "무",
              insuranceStartDate: null,
              insuranceEndDate: null,
              licenseNum: "",
              licenseDT: null,
              startTime: dayjs().hour(7).minute(0),
              endTime: dayjs().hour(18).minute(0),
              preferredAreas: "",
            };
          });

          setVehicles(formattedVehicles);

          // 차량이 없으면 자동으로 추가 폼 표시 (수동 추가가 아닐 때만)
          if (formattedVehicles.length === 0 && !isManualAdd) {
            setShowAddForm(true);
          }
          return;
        }

        // API와 localStorage 모두에 차량 정보가 없는 경우
        console.log("API와 localStorage 모두에 차량 정보 없음");
        setVehicles([]);
        if (!isManualAdd) {
          setShowAddForm(true);
        }
      } catch (error) {
        console.error("차량 목록 조회 실패:", error);
        setError("차량 정보를 불러오는데 실패했습니다.");

        // API 호출 실패 시 localStorage 확인
        console.log("API 호출 실패 - localStorage 확인");
        const savedVehicles = localStorage.getItem("driverVehicles");

        if (savedVehicles) {
          try {
            const parsedVehicles = JSON.parse(savedVehicles);
            console.log(
              "localStorage에서 가져온 차량 정보 (API 실패 후):",
              parsedVehicles
            );

            // localStorage 데이터를 프론트엔드 형식으로 변환
            const formattedVehicles = parsedVehicles.map((vehicle) => ({
              id: vehicle.id,
              vehicleNumber: vehicle.vehicleNumber || "",
              vehiclePlateNumber: vehicle.vehicleNumber || "",
              firstRegistrationDate: vehicle.registrationDate
                ? dayjs(vehicle.registrationDate, "YYYY.M.D").format(
                    "YYYY-MM-DD"
                  )
                : dayjs().format("YYYY-MM-DD"),
              vehicleType: vehicle.vehicleType || "",
              loadCapacity: vehicle.loadCapacity || "1~3톤", // 기본값 설정
              vehicleStatus: vehicle.vehicleStatus || "운행 가능",
              currentDistance: vehicle.currentDistance || "0",
              lastInspectionDate:
                vehicle.lastInspection &&
                vehicle.lastInspection !== "점검일 정보 없음"
                  ? dayjs(vehicle.lastInspection, "YYYY.M.D")
                  : null,
              nextMaintenanceDate:
                vehicle.nextInspection &&
                vehicle.nextInspection !== "점검일 정보 없음"
                  ? dayjs(vehicle.nextInspection, "YYYY.M.D")
                  : null,
              operationStatus: vehicle.vehicleStatus || "운행중",
              insuranceStatus: vehicle.insuranceStatus || "무",
              insuranceStartDate: null,
              insuranceEndDate: null,
              licenseNum: "",
              licenseDT: null,
              startTime: dayjs().hour(7).minute(0),
              endTime: dayjs().hour(18).minute(0),
              preferredAreas: "",
            }));

            setVehicles(formattedVehicles);
            return;
          } catch (parseError) {
            console.error("localStorage 파싱 실패:", parseError);
          }
        }

        // 에러 시 빈 배열로 설정하고 추가 폼 표시 (수동 추가가 아닐 때만)
        setVehicles([]);
        if (!isManualAdd) {
          setShowAddForm(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // 숫자에 쉼표 추가
  const addCommasToNumber = (value) => {
    const numbersOnly = value.replace(/[^\d]/g, "");
    if (numbersOnly === "") return "";
    return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleChange = (vehicleId, name, value) => {
    let processedValue = value;
    if (name === "currentDistance") {
      processedValue = addCommasToNumber(value);
    }

    setVehicles((prev) => {
      const updatedVehicles = prev.map((v) => {
        if (v.id === vehicleId) {
          const updatedVehicle = { ...v, [name]: processedValue };

          // 보험유무가 "무"로 변경되면 보험 관련 날짜 필드 초기화
          if (name === "insuranceStatus" && processedValue === "무") {
            updatedVehicle.insuranceStartDate = null;
            updatedVehicle.insuranceEndDate = null;
          }

          return updatedVehicle;
        }
        return v;
      });

      // localStorage 업데이트
      const localStorageVehicles = updatedVehicles.map((vehicle) => ({
        id: vehicle.id,
        registrationDate: vehicle.firstRegistrationDate
          ? dayjs(vehicle.firstRegistrationDate).format("YYYY.M.D")
          : new Date().toLocaleDateString("ko-KR"),
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        loadCapacity: vehicle.loadCapacity,
        vehicleStatus: vehicle.vehicleStatus,
        insuranceStatus: vehicle.insuranceStatus,
        currentDistance: vehicle.currentDistance,
        lastInspection: vehicle.lastInspectionDate
          ? dayjs(vehicle.lastInspectionDate).format("YYYY.M.D")
          : "점검일 정보 없음",
        nextInspection: vehicle.nextMaintenanceDate
          ? dayjs(vehicle.nextMaintenanceDate).format("YYYY.M.D")
          : "점검일 정보 없음",
        icon: "🚛",
      }));

      localStorage.setItem(
        "driverVehicles",
        JSON.stringify(localStorageVehicles)
      );
      console.log(
        "localStorage 업데이트 완료 (handleChange):",
        localStorageVehicles
      );

      return updatedVehicles;
    });
  };

  const openAddForm = () => {
    console.log("차량 추가하기 버튼 클릭됨");
    setIsManualAdd(true); // 수동 추가 플래그 설정

    // 새로운 폼 데이터 생성
    const newFormData = {
      id: Date.now(), // 고유 ID 생성
      vehiclePlateNumber: "",
      vehicleType: "",
      firstRegistrationDate: dayjs().format("YYYY-MM-DD"),
      loadCapacity: "",
      currentDistance: "",
      vehicleStatus: "운행 가능",
      lastInspectionDate: null,
      nextMaintenanceDate: null,
      insuranceStatus: "무",
      insuranceStartDate: null,
      insuranceEndDate: null,
      licenseNum: "",
      licenseDT: null,
      startTime: dayjs().hour(7).minute(0),
      endTime: dayjs().hour(18).minute(0),
      preferredAreas: "",
    };

    // 추가 폼 목록에 새 폼 추가
    setAdditionalForms((prev) => [...prev, newFormData]);
    console.log("새 차량 추가 폼이 생성됨");
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setIsManualAdd(false); // 수동 추가 플래그 초기화
  };

  const removeAdditionalForm = (formId) => {
    setAdditionalForms((prev) => prev.filter((form) => form.id !== formId));
  };

  const handleAdditionalFormChange = (formId, field, value) => {
    setAdditionalForms((prev) =>
      prev.map((form) =>
        form.id === formId ? { ...form, [field]: value } : form
      )
    );
  };

  const handleNewVehicleChange = (field, value) => {
    setNewVehicle((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addVehicle = async () => {
    try {
      // 필수 필드 검증
      if (!newVehicle.vehiclePlateNumber.trim()) {
        alert("차량번호를 입력해주세요.");
        return;
      }

      // 로컬 상태에만 추가 (저장하기 버튼에서 API 호출)
      const newVehicleData = {
        id: Date.now(), // 임시 ID 생성
        vehicleNumber: newVehicle.vehiclePlateNumber,
        vehiclePlateNumber: newVehicle.vehiclePlateNumber,
        firstRegistrationDate:
          newVehicle.firstRegistrationDate || dayjs().format("YYYY-MM-DD"),
        vehicleType: newVehicle.vehicleType || "1톤 카고",
        loadCapacity: newVehicle.loadCapacity || "",
        vehicleStatus: newVehicle.vehicleStatus || "운행 가능",
        currentDistance: newVehicle.currentDistance || "0",
        lastInspectionDate: newVehicle.lastInspectionDate,
        nextMaintenanceDate: newVehicle.nextMaintenanceDate,
        operationStatus: newVehicle.vehicleStatus || "운행중",
        insuranceStatus: newVehicle.insuranceStatus || "무",
        insuranceStartDate: newVehicle.insuranceStartDate,
        insuranceEndDate: newVehicle.insuranceEndDate,
        licenseNum: newVehicle.licenseNum || "",
        licenseDT: newVehicle.licenseDT,
        startTime: newVehicle.startTime || dayjs().hour(7).minute(0),
        endTime: newVehicle.endTime || dayjs().hour(18).minute(0),
        preferredAreas: newVehicle.preferredAreas || "",
      };

      // 차량 목록에 추가
      const updatedVehicles = [...vehicles, newVehicleData];
      setVehicles(updatedVehicles);

      console.log("새 차량이 로컬에 추가됨:", newVehicleData);
      alert(
        "차량이 추가되었습니다. 저장하기 버튼을 눌러 변경사항을 저장하세요."
      );

      closeAddForm();
      setIsManualAdd(false);
    } catch (error) {
      console.error("차량 추가 실패:", error);
      alert("차량 추가에 실패했습니다.");
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (vehicles.length > 1) {
      try {
        console.log("삭제할 차량 ID:", vehicleId);

        // 로컬 상태에서만 제거 (저장하기 버튼에서 API 호출)
        const updatedVehicles = vehicles.filter((v) => v.id !== vehicleId);
        setVehicles(updatedVehicles);

        // 삭제된 차량 ID를 추적
        setDeletedVehicleIds((prev) => [...prev, vehicleId]);

        console.log(`차량 ID ${vehicleId} 로컬에서 제거됨`);
        alert(
          "차량이 제거되었습니다. 저장하기 버튼을 눌러 변경사항을 저장하세요."
        );
      } catch (error) {
        console.error("차량 제거 실패:", error);
        alert("차량 제거에 실패했습니다.");
      }
    } else {
      alert("최소 1대의 차량은 유지해야 합니다.");
    }
  };

  // loadCapacity를 숫자로 변환하는 함수 제거 (더 이상 필요하지 않음)

  const handleSave = async () => {
    try {
      console.log("저장할 차량 정보:", vehicles);
      console.log("추가된 폼 정보:", additionalForms);

      // 1. 새로 추가된 차량들 생성
      for (const form of additionalForms) {
        try {
          // 필수 필드 검증
          if (!form.vehiclePlateNumber?.trim()) {
            alert("차량번호를 입력해주세요.");
            return;
          }

          if (!form.vehicleType) {
            alert("차량 종류를 선택해주세요.");
            return;
          }

          // vehicleType을 vehicleTypeId로 매핑
          const getVehicleTypeId = (vehicleType) => {
            switch (vehicleType) {
              case "1톤 카고":
                return 4;
              case "1.4톤 카고":
                return 5;
              case "2.5톤 카고":
                return 6;
              case "3.5톤 카고":
                return 7;
              case "5톤 카고":
                return 8;
              case "5톤 탑차":
                return 9;
              case "8톤 윙바디":
                return 10;
              case "냉동 탑차":
                return 11;
              case "냉동 윙바디":
                return 12;
              case "트레일러":
                return 13;
              default:
                return 4; // 기본값
            }
          };

          const createData = {
            carNum: form.vehiclePlateNumber.trim(),
            Mileage: 0,
            insurance: false,
            inspection: new Date(),
            carStatus: "OPERATIONAL",
            etc: "",
            vehicleTypeId: getVehicleTypeId(form.vehicleType),
            driverId: null, // 백엔드에서 JWT 토큰으로 driverId를 추출하므로 null로 설정
          };

          console.log("새 차량 생성 시도 (최소 데이터):", createData);
          const createdCar = await createCar(createData);
          console.log("새 차량 생성 성공:", createdCar);
        } catch (error) {
          console.error("새 차량 생성 실패:", error);
          let errorMessage = "새 차량 생성에 실패했습니다.";

          if (error.response?.data) {
            if (typeof error.response.data === "string") {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else {
              errorMessage = JSON.stringify(error.response.data);
            }
          }

          alert(errorMessage);
          return;
        }
      }

      // 2. 기존 차량들 업데이트
      for (const vehicle of vehicles) {
        try {
          const updateData = {
            carId: vehicle.id,
            carNum: (
              vehicle.vehicleNumber ||
              vehicle.vehiclePlateNumber ||
              ""
            ).trim(),
            Mileage: vehicle.currentDistance
              ? parseInt(vehicle.currentDistance.replace(/[^\d]/g, ""))
              : 0,
            insurance: vehicle.insuranceStatus === "유",
            inspection: vehicle.lastInspectionDate
              ? dayjs(vehicle.lastInspectionDate).toDate()
              : new Date(), // null 대신 현재 날짜 사용
            carStatus: "OPERATIONAL", // 기본값으로 설정
            etc: "", // 빈 문자열로 설정 (String 타입)
            vehicleTypeId:
              vehicle.vehicleType === "1톤 카고"
                ? 4
                : vehicle.vehicleType === "1.4톤 카고"
                ? 5
                : vehicle.vehicleType === "2.5톤 카고"
                ? 6
                : vehicle.vehicleType === "3.5톤 카고"
                ? 7
                : vehicle.vehicleType === "5톤 카고"
                ? 8
                : vehicle.vehicleType === "5톤 탑차"
                ? 9
                : vehicle.vehicleType === "8톤 윙바디"
                ? 10
                : vehicle.vehicleType === "냉동 탑차"
                ? 11
                : vehicle.vehicleType === "냉동 윙바디"
                ? 12
                : vehicle.vehicleType === "트레일러"
                ? 13
                : 4, // 기본값을 4로 설정 (1톤 카고)
            driverId: null, // 백엔드에서 JWT 토큰으로 driverId를 추출하므로 null로 설정
          };

          console.log(`차량 ID ${vehicle.id} 업데이트 시도:`, updateData);
          await updateCar(vehicle.id, updateData);
          console.log(`차량 ID ${vehicle.id} 업데이트 성공`);
        } catch (error) {
          console.error(`차량 ID ${vehicle.id} 업데이트 실패:`, error);
          let errorMessage = "차량 수정에 실패했습니다.";

          if (error.response?.data) {
            if (typeof error.response.data === "string") {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else {
              errorMessage = JSON.stringify(error.response.data);
            }
          }

          alert(errorMessage);
          return;
        }
      }

      // 3. 삭제된 차량들 처리
      for (const deletedId of deletedVehicleIds) {
        try {
          console.log(`차량 ID ${deletedId} 삭제 시도`);
          await deleteCar(deletedId);
          console.log(`차량 ID ${deletedId} 삭제 성공`);
        } catch (error) {
          console.error(`차량 ID ${deletedId} 삭제 실패:`, error);
          let errorMessage = "차량 삭제에 실패했습니다.";

          if (error.response?.data) {
            if (typeof error.response.data === "string") {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else {
              errorMessage = JSON.stringify(error.response.data);
            }
          }

          alert(errorMessage);
          return;
        }
      }

      // 4. 추가 폼 초기화 및 삭제된 차량 ID 초기화
      setAdditionalForms([]);
      setIsManualAdd(false);
      setDeletedVehicleIds([]);

      // 5. 성공 후 차량 목록 재조회
      await fetchVehicles();

      alert("차량 정보가 성공적으로 저장되었습니다.");
      navigate("/driver/profile", {
        state: { fromVehicleManagement: true },
      });
    } catch (error) {
      console.error("차량 정보 저장 실패:", error);
      alert("차량 정보 저장에 실패했습니다.");
    }
  };

  const vehicleTypes = [
    "1톤 카고",
    "1.4톤 카고",
    "2.5톤 카고",
    "3.5톤 카고",
    "5톤 카고",
    "5톤 탑차",
    "8톤 윙바디",
    "냉동 탑차",
    "냉동 윙바디",
    "트레일러",
  ];
  const loadCapacities = [
    "1톤 미만",
    "1~3톤",
    "3~5톤",
    "5~10톤",
    "10~15톤",
    "25톤 초과",
  ];
  const vehicleStatuses = ["운행가능", "수리중", "운행불가"];
  const operationStatuses = ["운행중", "대기중", "정비중", "휴식중"];
  const insuranceStatuses = ["유", "무"];

  // 로딩 상태
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, color: "#113F67", fontWeight: "bold" }}
      >
        차량 관리
      </Typography>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 차량 목록 표시 */}
      {vehicles.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#113F67" }}>
            등록된 차량 ({vehicles.length}대)
          </Typography>
          <Box
            sx={{
              border: "1px solid #e1e5e9",
              borderRadius: 2,
              backgroundColor: "white",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr 1fr",
                borderBottom: "1px solid #e1e5e9",
                backgroundColor: "#f8fafc",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  fontWeight: "bold",
                  borderRight: "1px solid #e1e5e9",
                }}
              >
                차량
              </Box>
              <Box
                sx={{
                  p: 2,
                  fontWeight: "bold",
                  borderRight: "1px solid #e1e5e9",
                }}
              >
                차량 번호
              </Box>
              <Box sx={{ p: 2, fontWeight: "bold" }}>차량상태</Box>
            </Box>
            {vehicles.map((vehicle, index) => (
              <Box
                key={vehicle.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr 1fr",
                  borderBottom:
                    index < vehicles.length - 1 ? "1px solid #e1e5e9" : "none",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRight: "1px solid #e1e5e9",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {index + 1}
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRight: "1px solid #e1e5e9",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {vehicle.vehiclePlateNumber || "차량번호 없음"}
                </Box>
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {vehicle.vehicleStatus || "운행 가능"}
                  {vehicles.length > 1 && (
                    <Button
                      onClick={() => deleteVehicle(vehicle.id)}
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                    >
                      삭제
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 차량 추가 버튼 */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={openAddForm}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "#113F67",
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(17, 63, 103, 0.3)",
            "&:hover": {
              backgroundColor: "#0d2d4a",
              boxShadow: "0 4px 12px rgba(17, 63, 103, 0.4)",
            },
          }}
        >
          차량 추가하기
        </Button>
      </Box>

      {/* 차량 정보 입력 폼 */}
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h6">차량 등록</Typography>

        {/* 기존 차량 정보 수정 */}
        {vehicles.map((vehicle, vehicleIndex) => (
          <Box
            key={vehicle.id}
            sx={{
              border: "2px solid #e1e5e9",
              borderRadius: 3,
              p: 3,
              backgroundColor: "#fafbfc",
              mb: 3,
            }}
          >
            <Box key={vehicle.id} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#113F67" }}>
                자동차 기본 정보 {vehicleIndex + 1}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {/* 1행: 차량번호, 최초등록일자 */}
                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="차량 번호"
                    fullWidth
                    value={vehicle.vehiclePlateNumber}
                    onChange={(e) =>
                      handleChange(
                        vehicle.id,
                        "vehiclePlateNumber",
                        e.target.value
                      )
                    }
                    helperText=" "
                    FormHelperTextProps={helperProps}
                  />
                </div>

                <div style={{ flex: "1 1 48%" }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="최초등록일자"
                      value={
                        vehicle.firstRegistrationDate
                          ? dayjs(vehicle.firstRegistrationDate)
                          : null
                      }
                      onChange={(newValue) =>
                        handleChange(
                          vehicle.id,
                          "firstRegistrationDate",
                          newValue
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: " ",
                          FormHelperTextProps: helperProps,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                {/* 2행: 차종, 최대 적재량 */}
                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="차종"
                    select
                    fullWidth
                    value={vehicle.vehicleType}
                    onChange={(e) =>
                      handleChange(vehicle.id, "vehicleType", e.target.value)
                    }
                    helperText=" "
                    FormHelperTextProps={helperProps}
                  >
                    {vehicleTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="최대 적재량"
                    select
                    fullWidth
                    value={vehicle.loadCapacity}
                    onChange={(e) =>
                      handleChange(vehicle.id, "loadCapacity", e.target.value)
                    }
                    helperText=" "
                    FormHelperTextProps={helperProps}
                  >
                    {loadCapacities.map((capacity) => (
                      <MenuItem key={capacity} value={capacity}>
                        {capacity}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                {/* 3행: 현재 주행거리, 차량상태 */}
                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="현재 주행거리"
                    fullWidth
                    value={vehicle.currentDistance}
                    onChange={(e) =>
                      handleChange(
                        vehicle.id,
                        "currentDistance",
                        e.target.value
                      )
                    }
                    InputProps={{
                      endAdornment: <span>km</span>,
                    }}
                    helperText=" "
                    FormHelperTextProps={helperProps}
                  />
                </div>

                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="차량상태 (관리자만 수정 가능)"
                    fullWidth
                    value={vehicle.vehicleStatus || "운행 가능"}
                    disabled
                    helperText="차량 상태는 관리자만 수정할 수 있습니다"
                    FormHelperTextProps={helperProps}
                  />
                </div>

                {/* 4행: 차량 마지막 점검일, 다음 정비 예정일 */}
                <div style={{ flex: "1 1 48%" }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="차량 마지막 점검일"
                      value={vehicle.lastInspectionDate}
                      onChange={(newValue) =>
                        handleChange(vehicle.id, "lastInspectionDate", newValue)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: " ",
                          FormHelperTextProps: helperProps,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <div style={{ flex: "1 1 48%" }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="다음 정비 예정일"
                      value={vehicle.nextMaintenanceDate}
                      onChange={(newValue) =>
                        handleChange(
                          vehicle.id,
                          "nextMaintenanceDate",
                          newValue
                        )
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: " ",
                          FormHelperTextProps: helperProps,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                {/* 5행: 보험 유무 */}
                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="보험 유무"
                    select
                    fullWidth
                    value={vehicle.insuranceStatus}
                    onChange={(e) =>
                      handleChange(
                        vehicle.id,
                        "insuranceStatus",
                        e.target.value
                      )
                    }
                    helperText=" "
                    FormHelperTextProps={helperProps}
                  >
                    {insuranceStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                {/* 6행: 보험 시작일, 보험 만료일 (보험 유무가 "유"일 때만) */}
                {vehicle.insuranceStatus === "유" && (
                  <>
                    <div style={{ flex: "1 1 48%" }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="보험시작일"
                          value={vehicle.insuranceStartDate}
                          onChange={(newValue) =>
                            handleChange(
                              vehicle.id,
                              "insuranceStartDate",
                              newValue
                            )
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              helperText: " ",
                              FormHelperTextProps: helperProps,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>

                    <div style={{ flex: "1 1 48%" }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="보험만료일"
                          value={vehicle.insuranceEndDate}
                          onChange={(newValue) =>
                            handleChange(
                              vehicle.id,
                              "insuranceEndDate",
                              newValue
                            )
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              helperText: " ",
                              FormHelperTextProps: helperProps,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </>
                )}

                {/* 7행: 운전면허증 번호, 운전면허 만료일 */}
                <div style={{ flex: "1 1 48%" }}>
                  <TextField
                    label="운전면허증 번호"
                    fullWidth
                    value={vehicle.licenseNum || ""}
                    onChange={(e) =>
                      handleChange(vehicle.id, "licenseNum", e.target.value)
                    }
                    helperText=" "
                    FormHelperTextProps={helperProps}
                  />
                </div>

                <div style={{ flex: "1 1 48%" }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="운전면허 만료일"
                      value={vehicle.licenseDT}
                      onChange={(newValue) =>
                        handleChange(vehicle.id, "licenseDT", newValue)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: " ",
                          FormHelperTextProps: helperProps,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => alert("진위확인 연동 예정")}
                  sx={{ height: 56 }}
                >
                  운전면허 진위확인
                </Button>

                {/* 선호 시간대 */}
                <div style={{ flex: "1 1 100%" }}>
                  <Box
                    sx={{
                      border: "1px solid #e1e5e9",
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 2, color: "#113F67" }}
                    >
                      선호 시간대
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                          label="시작 시간"
                          value={vehicle.startTime || dayjs().hour(7).minute(0)}
                          onChange={(newValue) =>
                            handleChange(vehicle.id, "startTime", newValue)
                          }
                          slotProps={{
                            textField: { size: "small" },
                          }}
                        />
                        <Typography>~</Typography>
                        <TimePicker
                          label="종료 시간"
                          value={vehicle.endTime || dayjs().hour(18).minute(0)}
                          onChange={(newValue) =>
                            handleChange(vehicle.id, "endTime", newValue)
                          }
                          slotProps={{
                            textField: { size: "small" },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          handleChange(
                            vehicle.id,
                            "startTime",
                            dayjs().hour(7).minute(0)
                          );
                          handleChange(
                            vehicle.id,
                            "endTime",
                            dayjs().hour(18).minute(0)
                          );
                        }}
                      >
                        주간(07:00~18:00)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          handleChange(
                            vehicle.id,
                            "startTime",
                            dayjs().hour(18).minute(0)
                          );
                          handleChange(
                            vehicle.id,
                            "endTime",
                            dayjs().hour(1).minute(0)
                          );
                        }}
                      >
                        야간(18:00~01:00)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          handleChange(
                            vehicle.id,
                            "startTime",
                            dayjs().hour(22).minute(0)
                          );
                          handleChange(
                            vehicle.id,
                            "endTime",
                            dayjs().hour(6).minute(0)
                          );
                        }}
                      >
                        심야(22:00~06:00)
                      </Button>
                    </Box>
                  </Box>
                </div>

                <div style={{ flex: "1 1 100%" }}>
                  <FormControl fullWidth>
                    <InputLabel>운행 선호 지역 (복수 선택)</InputLabel>
                    <Select
                      multiple
                      value={
                        vehicle.preferredAreas
                          ? vehicle.preferredAreas.split(",")
                          : []
                      }
                      onChange={(e) => {
                        const selectedAreas = e.target.value;
                        handleChange(
                          vehicle.id,
                          "preferredAreas",
                          selectedAreas.join(",")
                        );
                      }}
                      input={
                        <OutlinedInput label="운행 선호 지역 (복수 선택)" />
                      }
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              onDelete={(e) => {
                                e.stopPropagation(); // 이벤트 버블링 방지
                                const currentAreas = vehicle.preferredAreas
                                  ? vehicle.preferredAreas.split(",")
                                  : [];
                                const updatedAreas = currentAreas.filter(
                                  (area) => area !== value
                                );
                                handleChange(
                                  vehicle.id,
                                  "preferredAreas",
                                  updatedAreas.join(",")
                                );
                              }}
                              deleteIcon={
                                <span
                                  style={{
                                    fontSize: "16px",
                                    cursor: "pointer",
                                  }}
                                >
                                  ×
                                </span>
                              }
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {[
                        "서울",
                        "부산",
                        "대구",
                        "인천",
                        "광주",
                        "대전",
                        "울산",
                        "세종",
                        "경기",
                        "강원",
                        "충북",
                        "충남",
                        "전북",
                        "전남",
                        "경북",
                        "경남",
                        "제주",
                      ].map((area) => (
                        <MenuItem key={area} value={area}>
                          {area}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Box>
            </Box>
          </Box>
        ))}

        {/* 추가된 차량 폼들 */}
        {additionalForms.map((form, formIndex) => (
          <Box
            key={form.id}
            sx={{
              border: "2px solid #e1e5e9",
              borderRadius: 3,
              p: 3,
              backgroundColor: "#fafbfc",
              mb: 3,
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: "#113F67" }}>
                새 차량 추가 {formIndex + 1}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => removeAdditionalForm(form.id)}
                startIcon={<DeleteIcon />}
              >
                차량 삭제
              </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {/* 1행: 차량번호, 최초등록일자 */}
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차량 번호"
                  fullWidth
                  value={form.vehiclePlateNumber}
                  onChange={(e) =>
                    handleAdditionalFormChange(
                      form.id,
                      "vehiclePlateNumber",
                      e.target.value
                    )
                  }
                  helperText=" "
                  FormHelperTextProps={helperProps}
                />
              </div>

              <div style={{ flex: "1 1 48%" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="최초등록일자"
                    value={
                      form.firstRegistrationDate
                        ? dayjs(form.firstRegistrationDate)
                        : null
                    }
                    onChange={(newValue) =>
                      handleAdditionalFormChange(
                        form.id,
                        "firstRegistrationDate",
                        newValue
                      )
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: " ",
                        FormHelperTextProps: helperProps,
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {/* 2행: 차종, 최대 적재량 */}
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차종"
                  select
                  fullWidth
                  value={form.vehicleType}
                  onChange={(e) =>
                    handleAdditionalFormChange(
                      form.id,
                      "vehicleType",
                      e.target.value
                    )
                  }
                  helperText=" "
                  FormHelperTextProps={helperProps}
                >
                  {vehicleTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="최대 적재량"
                  select
                  fullWidth
                  value={form.loadCapacity}
                  onChange={(e) =>
                    handleAdditionalFormChange(
                      form.id,
                      "loadCapacity",
                      e.target.value
                    )
                  }
                  helperText=" "
                  FormHelperTextProps={helperProps}
                >
                  {loadCapacities.map((capacity) => (
                    <MenuItem key={capacity} value={capacity}>
                      {capacity}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* 3행: 현재 주행거리, 차량상태 */}
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="현재 주행거리"
                  fullWidth
                  value={form.currentDistance}
                  onChange={(e) =>
                    handleAdditionalFormChange(
                      form.id,
                      "currentDistance",
                      e.target.value
                    )
                  }
                  InputProps={{
                    endAdornment: <span>km</span>,
                  }}
                  helperText=" "
                  FormHelperTextProps={helperProps}
                />
              </div>

              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="차량상태 (관리자만 수정 가능)"
                  fullWidth
                  value={form.vehicleStatus || "운행 가능"}
                  disabled
                  helperText="차량 상태는 관리자만 수정할 수 있습니다"
                  FormHelperTextProps={helperProps}
                />
              </div>

              {/* 4행: 차량 마지막 점검일, 다음 정비 예정일 */}
              <div style={{ flex: "1 1 48%" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="차량 마지막 점검일"
                    value={form.lastInspectionDate}
                    onChange={(newValue) =>
                      handleAdditionalFormChange(
                        form.id,
                        "lastInspectionDate",
                        newValue
                      )
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: " ",
                        FormHelperTextProps: helperProps,
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              <div style={{ flex: "1 1 48%" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="다음 정비 예정일"
                    value={form.nextMaintenanceDate}
                    onChange={(newValue) =>
                      handleAdditionalFormChange(
                        form.id,
                        "nextMaintenanceDate",
                        newValue
                      )
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: " ",
                        FormHelperTextProps: helperProps,
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              {/* 5행: 보험 유무 */}
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="보험 유무"
                  select
                  fullWidth
                  value={form.insuranceStatus}
                  onChange={(e) =>
                    handleAdditionalFormChange(
                      form.id,
                      "insuranceStatus",
                      e.target.value
                    )
                  }
                  helperText=" "
                  FormHelperTextProps={helperProps}
                >
                  {insuranceStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* 6행: 보험 시작일, 보험 만료일 (보험 유무가 "유"일 때만) */}
              {form.insuranceStatus === "유" && (
                <>
                  <div style={{ flex: "1 1 48%" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="보험시작일"
                        value={form.insuranceStartDate}
                        onChange={(newValue) =>
                          handleAdditionalFormChange(
                            form.id,
                            "insuranceStartDate",
                            newValue
                          )
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            helperText: " ",
                            FormHelperTextProps: helperProps,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>

                  <div style={{ flex: "1 1 48%" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="보험만료일"
                        value={form.insuranceEndDate}
                        onChange={(newValue) =>
                          handleAdditionalFormChange(
                            form.id,
                            "insuranceEndDate",
                            newValue
                          )
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            helperText: " ",
                            FormHelperTextProps: helperProps,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </>
              )}

              {/* 7행: 운전면허증 번호, 운전면허 만료일 */}
              <div style={{ flex: "1 1 48%" }}>
                <TextField
                  label="운전면허증 번호"
                  fullWidth
                  value={form.licenseNum || ""}
                  onChange={(e) =>
                    handleAdditionalFormChange(
                      form.id,
                      "licenseNum",
                      e.target.value
                    )
                  }
                  helperText=" "
                  FormHelperTextProps={helperProps}
                />
              </div>

              <div style={{ flex: "1 1 48%" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="운전면허 만료일"
                    value={form.licenseDT}
                    onChange={(newValue) =>
                      handleAdditionalFormChange(form.id, "licenseDT", newValue)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: " ",
                        FormHelperTextProps: helperProps,
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>

              <Button
                variant="outlined"
                type="button"
                onClick={() => alert("진위확인 연동 예정")}
                sx={{ height: 56 }}
              >
                운전면허 진위확인
              </Button>

              {/* 선호 시간대 */}
              <div style={{ flex: "1 1 100%" }}>
                <Box
                  sx={{
                    border: "1px solid #e1e5e9",
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, color: "#113F67" }}
                  >
                    선호 시간대
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="시작 시간"
                        value={form.startTime}
                        onChange={(newValue) =>
                          handleAdditionalFormChange(
                            form.id,
                            "startTime",
                            newValue
                          )
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { width: 150 },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    <Typography>~</Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="종료 시간"
                        value={form.endTime}
                        onChange={(newValue) =>
                          handleAdditionalFormChange(
                            form.id,
                            "endTime",
                            newValue
                          )
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { width: 150 },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        handleAdditionalFormChange(
                          form.id,
                          "startTime",
                          dayjs().hour(7).minute(0)
                        );
                        handleAdditionalFormChange(
                          form.id,
                          "endTime",
                          dayjs().hour(18).minute(0)
                        );
                      }}
                    >
                      주간(07:00~18:00)
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        handleAdditionalFormChange(
                          form.id,
                          "startTime",
                          dayjs().hour(18).minute(0)
                        );
                        handleAdditionalFormChange(
                          form.id,
                          "endTime",
                          dayjs().hour(1).minute(0)
                        );
                      }}
                    >
                      야간(18:00~01:00)
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        handleAdditionalFormChange(
                          form.id,
                          "startTime",
                          dayjs().hour(22).minute(0)
                        );
                        handleAdditionalFormChange(
                          form.id,
                          "endTime",
                          dayjs().hour(6).minute(0)
                        );
                      }}
                    >
                      심야(22:00~06:00)
                    </Button>
                  </Box>
                </Box>
              </div>

              {/* 운행선호지역 */}
              <div style={{ flex: "1 1 100%" }}>
                <FormControl fullWidth>
                  <InputLabel>운행 선호 지역 (복수 선택)</InputLabel>
                  <Select
                    multiple
                    value={
                      form.preferredAreas ? form.preferredAreas.split(",") : []
                    }
                    onChange={(e) => {
                      const selectedAreas = e.target.value;
                      handleAdditionalFormChange(
                        form.id,
                        "preferredAreas",
                        selectedAreas.join(",")
                      );
                    }}
                    input={<OutlinedInput label="운행 선호 지역 (복수 선택)" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            onDelete={(e) => {
                              e.stopPropagation(); // 이벤트 버블링 방지
                              const currentAreas = form.preferredAreas
                                ? form.preferredAreas.split(",")
                                : [];
                              const updatedAreas = currentAreas.filter(
                                (area) => area !== value
                              );
                              handleAdditionalFormChange(
                                form.id,
                                "preferredAreas",
                                updatedAreas.join(",")
                              );
                            }}
                            deleteIcon={
                              <span
                                style={{
                                  fontSize: "16px",
                                  cursor: "pointer",
                                }}
                              >
                                ×
                              </span>
                            }
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {[
                      "서울",
                      "부산",
                      "대구",
                      "인천",
                      "광주",
                      "대전",
                      "울산",
                      "세종",
                      "경기",
                      "강원",
                      "충북",
                      "충남",
                      "전북",
                      "전남",
                      "경북",
                      "경남",
                      "제주",
                    ].map((area) => (
                      <MenuItem key={area} value={area}>
                        {area}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </Box>
          </Box>
        ))}

        {/* 저장 버튼 */}
        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: "#113F67",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#0d2d4a",
              },
            }}
          >
            저장하기
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/driver/profile")}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            취소
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ManageVehicles;
