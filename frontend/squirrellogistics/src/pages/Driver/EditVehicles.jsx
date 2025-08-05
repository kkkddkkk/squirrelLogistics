import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
const EditVehicles = () => {
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    registrationDate: "",
    vehicleNumber: "",
    vehicleTypes: [],
    selectedType: "",
    loadCapacities: {},
    vehicleStatus: "운행 가능",
    insuranceStatus: "유",
    currentDistance: "",
    lastInspection: "",
    nextInspection: "",
  });

  const [warning, setWarning] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setVehicle((prev) => ({ ...prev, registrationDate: today }));
  }, []);

  useEffect(() => {
    if (vehicle.lastInspection) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const lastDate = new Date(vehicle.lastInspection);
      setWarning(lastDate < oneYearAgo ? "차량 점검일을 확인하세요." : "");
    }
  }, [vehicle.lastInspection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeSelect = (e) => {
    const selected = e.target.value;
    if (!vehicle.vehicleTypes.includes(selected)) {
      setVehicle((prev) => ({
        ...prev,
        vehicleTypes: [...prev.vehicleTypes, selected],
        loadCapacities: { ...prev.loadCapacities, [selected]: "" },
      }));
    }
  };

  const handleTypeRemove = (type) => {
    const updatedTypes = vehicle.vehicleTypes.filter((t) => t !== type);
    const updatedCapacities = { ...vehicle.loadCapacities };
    delete updatedCapacities[type];
    setVehicle((prev) => ({
      ...prev,
      vehicleTypes: updatedTypes,
      loadCapacities: updatedCapacities,
    }));
  };

  const handleCapacityChange = (type, value) => {
    setVehicle((prev) => ({
      ...prev,
      loadCapacities: { ...prev.loadCapacities, [type]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("차량 정보가 수정되었습니다.");
    navigate("/driver/profile");
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#113F67]">
          운송 차량 정보 수정
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="차량 등록일"
            name="registrationDate"
            value={vehicle.registrationDate}
            readOnly
          />

          <InputField
            label="차량 번호"
            name="vehicleNumber"
            value={vehicle.vehicleNumber}
            onChange={handleChange}
          />

          <SelectField
            label="차량 종류"
            name="selectedType"
            value={vehicle.selectedType}
            onChange={handleTypeSelect}
            options={["일반 카고", "윙바디", "냉장/냉동", "탑차", "리프트"]}
          />

          {vehicle.vehicleTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {vehicle.vehicleTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm"
                >
                  <span>{type}</span>
                  <select
                    className="text-sm border rounded px-1 py-0.5"
                    value={vehicle.loadCapacities[type] || ""}
                    onChange={(e) => handleCapacityChange(type, e.target.value)}
                  >
                    <option value="">적재량</option>
                    {[
                      "~1톤",
                      "1~3톤",
                      "3~5톤",
                      "5~10톤",
                      "10~15톤",
                      "20~25톤",
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => handleTypeRemove(type)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <InputField
            label="차량 상태"
            name="vehicleStatus"
            value={vehicle.vehicleStatus}
            readOnly
          />

          <SelectField
            label="보험 여부"
            name="insuranceStatus"
            value={vehicle.insuranceStatus}
            onChange={handleChange}
            options={["유", "무"]}
          />

          <InputField
            label="현재 주행거리"
            name="currentDistance"
            value={vehicle.currentDistance}
            onChange={handleChange}
            append=" km"
          />

          <InputField
            label="마지막 점검일"
            name="lastInspection"
            type="date"
            value={vehicle.lastInspection}
            onChange={handleChange}
          />
          {warning && <p className="text-red-500 text-sm">{warning}</p>}

          <InputField
            label="다음 정비 예정일"
            name="nextInspection"
            type="date"
            value={vehicle.nextInspection}
            onChange={handleChange}
          />

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate("/driver/profile")}
              className="px-4 py-2 text-sm border border-gray-400 rounded hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#113F67] text-white rounded hover:opacity-90"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
  append = "",
}) => (
  <div>
    <label htmlFor={name} className="block mb-1 text-sm font-medium">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full border border-gray-300 px-3 py-2 pr-10 rounded text-sm focus:outline-[#113F67] ${
          readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
        }`}
      />
      {append && (
        <span className="absolute right-3 top-2 text-sm text-gray-500">
          {append}
        </span>
      )}
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block mb-1 text-sm font-medium">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-[#113F67]"
    >
      <option value="">선택하세요</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// 상단 컴포넌트 추가
const Header = () => (
  <header className="bg-[#F5F7FA] p-4 border-b">
    <h1 className="text-xl font-bold text-[#113F67]">Squirrel Logistics</h1>
  </header>
);
export default EditVehicles;
