import React, { useState } from "react";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { PhotoCamera, Edit, Person } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const Input = styled("input")({
  display: "none",
});

const ProfileImage = ({
  imageUrl,
  alt = "프로필 이미지",
  size = 120,
  editable = false,
  onImageChange = null,
  showEditIcon = true,
  sx = {},
}) => {
  const [previewUrl, setPreviewUrl] = useState(imageUrl);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      // 부모 컴포넌트에 파일 전달
      if (onImageChange) {
        onImageChange(file);
      }
    }
  };

  // 이미지 URL이 있는지 확인 (빈 문자열도 체크)
  const hasValidImage =
    (previewUrl &&
      previewUrl.trim() !== "" &&
      previewUrl !== "undefined" &&
      previewUrl !== "null" &&
      previewUrl.length > 0) ||
    (imageUrl &&
      imageUrl.trim() !== "" &&
      imageUrl !== "undefined" &&
      imageUrl !== "null" &&
      imageUrl.length > 0);

  // 디버깅용 로그
  console.log("ProfileImage Debug:", {
    previewUrl,
    imageUrl,
    hasValidImage,
    previewUrlTrimmed: previewUrl?.trim(),
    imageUrlTrimmed: imageUrl?.trim(),
  });

  // 강제로 Box 컴포넌트 사용 (임시 테스트)
  const forceUseBox = true;

  return (
    <Box sx={{ position: "relative", display: "inline-block", ...sx }}>
      {hasValidImage && !forceUseBox ? (
        <Avatar
          src={previewUrl || imageUrl}
          alt={alt}
          sx={{
            width: size,
            height: size,
            border: "3px solid #E0E6ED",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            cursor: editable ? "pointer" : "default",
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
          }}
        >
          <Person sx={{ fontSize: size * 0.6 }} />
        </Box>
      )}

      {editable && showEditIcon && (
        <IconButton
          component="label"
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            width: 32,
            height: 32,
          }}
        >
          <Edit sx={{ fontSize: 16 }} />
          <Input accept="image/*" type="file" onChange={handleImageChange} />
        </IconButton>
      )}
    </Box>
  );
};

export default ProfileImage;
