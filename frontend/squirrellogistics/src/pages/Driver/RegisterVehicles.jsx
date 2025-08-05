import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
const RegisterVehicles = () => {
  const navigate = useNavigate();

  const createEmptyVehicle = () => {
    const today = new Date().toISOString().split("T")[0];
    return {
      registrationDate: today,
      vehicleNumber: "",
      vehicleType: "",
      loadCapacity: "",
      vehicleStatus: "운행 가능",
      insuranceStatus: "유",
      currentDistance: "",
      lastInspection: "",
      nextInspection: "",
    };
  };

  const [vehicles, setVehicles] = useState([createEmptyVehicle()]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setVehicles((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const addVehicle = () => {
    setVehicles((prev) => [...prev, createEmptyVehicle()]);
  };

  const removeVehicle = (index) => {
    if (vehicles.length === 1) return;
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("등록된 차량:", vehicles);
    alert("차량 등록이 완료되었습니다.");
    navigate("/driver/profile");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <NavBar />
      <h1 className="text-2xl font-bold text-center mb-6 text-[#113F67]">
        차량 최초 등록
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {vehicles.map((vehicle, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-xl p-4 relative bg-gray-50"
          >
            <h2 className="text-lg font-semibold mb-2 text-[#113F67]">
              차량 {index + 1}
            </h2>

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
              onChange={(e) => handleChange(index, e)}
            />

            <SelectField
              label="차량 종류"
              name="vehicleType"
              value={vehicle.vehicleType}
              onChange={(e) => handleChange(index, e)}
              options={["일반 카고", "윙바디", "냉장/냉동", "탑차", "리프트"]}
            />

            <SelectField
              label="최대 적재량"
              name="loadCapacity"
              value={vehicle.loadCapacity}
              onChange={(e) => handleChange(index, e)}
              options={[
                "~1톤",
                "1~3톤",
                "3~5톤",
                "5~10톤",
                "10~15톤",
                "20~25톤",
              ]}
            />

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
              onChange={(e) => handleChange(index, e)}
              options={["유", "무"]}
            />

            <InputField
              label="현재 주행거리"
              name="currentDistance"
              value={vehicle.currentDistance}
              onChange={(e) => handleChange(index, e)}
              append="km"
            />

            <InputField
              label="마지막 점검일"
              name="lastInspection"
              type="date"
              value={vehicle.lastInspection}
              onChange={(e) => handleChange(index, e)}
            />

            <InputField
              label="다음 정비 예정일"
              name="nextInspection"
              type="date"
              value={vehicle.nextInspection}
              onChange={(e) => handleChange(index, e)}
            />

            {vehicles.length > 1 && (
              <button
                type="button"
                onClick={() => removeVehicle(index)}
                className="absolute top-4 right-4 text-red-500 hover:underline text-sm"
              >
                삭제
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addVehicle}
          className="w-full py-2 border border-[#113F67] text-[#113F67] rounded hover:bg-[#113F67] hover:text-white transition"
        >
          + 차량 추가하기
        </button>

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
            전체 차량 등록
          </button>
        </div>
      </form>
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
  <div className="mb-3">
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
          readOnly ? "bg-gray-100 text-gray-500" : ""
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
  <div className="mb-3">
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

export default RegisterVehicles;
