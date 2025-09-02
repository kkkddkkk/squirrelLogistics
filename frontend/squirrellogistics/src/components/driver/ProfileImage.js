import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { Edit, Person } from "@mui/icons-material";

const ProfileImage = ({
  imageUrl,
  alt = "프로필 이미지",
  size = 120,
  editable = false,
  onImageChange = null,
  showEditIcon = true,
  sx = {},
}) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // imageUrl prop이 변경될 때 previewUrl 업데이트
  useEffect(() => {
    if (imageUrl && imageUrl.trim() !== "") {
      // data URL인 경우 그대로 사용
      if (imageUrl.startsWith("data:image")) {
        setPreviewUrl(imageUrl);
      }
      // http URL인 경우 그대로 사용
      else if (imageUrl.startsWith("http")) {
        setPreviewUrl(imageUrl);
      }
      // 파일명만 있는 경우 전체 URL 구성
      else if (!imageUrl.includes("/")) {
        const fullUrl = `http://localhost:8080/api/images/profile/${imageUrl}`;
        setPreviewUrl(fullUrl);
      }
      // 기타 경우
      else {
        setPreviewUrl("");
      }
    } else {
      setPreviewUrl("");
    }
  }, [imageUrl]);

  const handleImageChange = (event) => {
    console.log("handleImageChange 호출됨:", event);
    console.log("event.target.files:", event.target.files);

    const file = event.target.files[0];
    if (file) {
      console.log("파일 선택됨:", file.name, file.type, file.size);

      // FileReader를 사용하여 data URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("FileReader onload 실행됨:", e.target.result);
        const dataUrl = e.target.result;
        setPreviewUrl(dataUrl);

        // 부모 컴포넌트에 파일 전달
        if (onImageChange) {
          console.log("부모 컴포넌트에 파일 전달:", file);
          onImageChange(file);
        } else {
          console.log("onImageChange 함수가 없음");
        }
      };
      reader.onerror = (e) => {
        console.error("FileReader 에러:", e);
        alert("이미지 로드에 실패했습니다.");
      };
      reader.readAsDataURL(file);
    } else {
      console.log("선택된 파일이 없음");
    }

    // 파일 재선택을 위해 value 초기화
    event.target.value = null;
  };

  // 이미지 URL이 유효한지 확인하는 함수
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== "string") return false;

    const trimmedUrl = url.trim();
    if (
      trimmedUrl === "" ||
      trimmedUrl === "undefined" ||
      trimmedUrl === "null" ||
      trimmedUrl === "data:,"
    ) {
      return false;
    }

    // data:image로 시작하거나 http로 시작하는 경우만 유효 (blob 제외)
    return trimmedUrl.startsWith("data:image") || trimmedUrl.startsWith("http");
  };

  const hasValidImage = isValidImageUrl(previewUrl);

  // 디버깅용 로그
  console.log("ProfileImage Debug:", {
    previewUrl: previewUrl ? previewUrl.substring(0, 50) + "..." : "empty",
    imageUrl: imageUrl ? imageUrl.substring(0, 50) + "..." : "empty",
    hasValidImage,
    editable,
    showEditIcon,
  });

  // 파일 선택을 위한 함수
  const handleFileSelect = () => {
    console.log("파일 선택 버튼 클릭됨");
    if (fileInputRef.current) {
      console.log("fileInputRef.current 찾음, 클릭 시도");
      fileInputRef.current.click();
    } else {
      console.log("fileInputRef.current이 null임");
    }
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block", ...sx }}>
      {/* 프로필 이미지 표시 */}
      {hasValidImage ? (
        <Box
          component="img"
          src={previewUrl}
          alt={alt}
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: "3px solid #E0E6ED",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            cursor: editable ? "pointer" : "default",
            objectFit: "cover",
            ...sx,
          }}
        />
      ) : (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: "3px solid #E0E6ED",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            cursor: editable ? "pointer" : "default",
            bgcolor: "white",
            color: "#113F67",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...sx,
          }}
        >
          <Person sx={{ fontSize: size * 0.6 }} />
        </Box>
      )}

      {/* 편집 아이콘 */}
      {editable && showEditIcon && (
        <Box
          onClick={handleFileSelect}
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "#113F67",
            color: "white",
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#0d2d4a",
              transform: "scale(1.1)",
            },
          }}
        >
          <Edit sx={{ fontSize: 18 }} />
        </Box>
      )}

      {/* 숨겨진 파일 입력 */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            opacity: 0,
            width: "1px",
            height: "1px",
          }}
        />
      )}
    </Box>
  );
};

export default ProfileImage;
