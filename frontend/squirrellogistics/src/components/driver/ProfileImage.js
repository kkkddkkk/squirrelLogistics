import React, { useState } from "react";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { PhotoCamera, Edit } from "@mui/icons-material";
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

  const getImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (imageUrl) return imageUrl;
    return "/images/default-profile.png"; // 기본 이미지 경로
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block", ...sx }}>
      <Avatar
        src={getImageUrl()}
        alt={alt}
        sx={{
          width: size,
          height: size,
          border: "3px solid #fff",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          cursor: editable ? "pointer" : "default",
        }}
      />

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
