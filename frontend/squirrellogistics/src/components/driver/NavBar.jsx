import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const menuItems = [
    { path: "/driver/profile", label: "요청목록" },
    { path: "/driver/editprofile", label: "진행중운송" },
    { path: "/driver/editvehicles", label: "운송기록" },
    { path: "/driver/registervehicles", label: "차량등록" },
    { path: "/driver/calendar", label: "캘린더" },
    { path: "/driver/profile", label: "나의정보" },
    { path: "/driver/profile", label: "고객지원" },
  ];
  const navigate = useNavigate();
  const handleClick = (path) => {
    navigate(path);
  };
  return (
    <nav className="bg-white py-2 border-b text-sm flex justify-center gap-8 text-gray-600">
      {menuItems.map((item, index) => (
        <span
          key={index}
          className="hover:text-black cursor-pointer font-medium"
          onClick={() => handleClick(item.path)}
        >
          {item.label}
        </span>
      ))}
    </nav>
  );
}
