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
  const fileInputRef = useRef(null);

  const handleImageChange = () => {
    fileInputRef.current.click();
  }

  const handleFileSelect = () => {

  }

  return (
    <Box sx={{ position: "relative", display: "inline-block", ...sx }}>
      {/* 프로필 이미지 표시 */}
      <Box
        component="img"
        src={imageUrl}
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
