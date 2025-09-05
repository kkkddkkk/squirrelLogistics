import { Select } from "@mui/material";


const CommonSelect = ({children, changeEvent, value}) => {
    return (
        <Select
            value={value}
            onChange={changeEvent}
            displayEmpty
            sx={{
                padding: 0,
                background: "transparent",
                minWidth: "auto",
                boxShadow: 'none',
                "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                },

                // 선택된 텍스트 영역
                "& .MuiSelect-select": {
                    padding: 0,
                    color: "var(--text-primary)", // 글자색
                    display: "flex",
                    alignItems: "center",
                },

                // 드롭다운 아이콘
                "& .MuiSelect-icon": {
                    color: "var(--text-primary)", // 아이콘 색
                    right: 0, // 필요에 따라 위치 조정
                },

                // Paper (드롭다운 배경)
                "& .MuiPaper-root": {
                    backgroundColor: "var(--background-paper)", // 드롭다운 배경
                },
            }}
        >
            {children}

        </Select>
    )
}

export default CommonSelect;