import { Autocomplete, Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const regions = [
    "상관없음", "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
    "대전광역시", "울산광역시", "세종특별자치시",
    "경기도", "강원특별자치도",
    "충청북도", "충청남도",
    "전북특별자치도", "전라남도",
    "경상북도", "경상남도",
    "제주특별자치도",
];

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

/**
 * props:
 * - value: string[]  (선택된 지역 배열)
 * - onChange: (string[]) => void
 * - label?: string
 * - error?: boolean
 * - helperText?: string
 * - maxSelections?: number (선택 최대 개수 제한 옵션)
 */
export default function PreferredAreasSelect({
    value = [],
    onChange,
    label = "선호지역",
    error,
    helperText,
    maxSelections,
}) {
    const handleChange = (_e, newValue) => {
        if (maxSelections && newValue.length > maxSelections) return;
        onChange?.(newValue);
    };

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={regions}
            value={value}
            onChange={handleChange}
            renderOption={(props, option, { selected }) => (
                <li {...props}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                        sx={{ mr: 1 }}
                    />
                    {option}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={!!error}
                    helperText={helperText || " "}
                />
            )}
            // 태그가 많아지면 표시를 줄임
            limitTags={3}
            // 선택된 값 정렬 유지
            getOptionLabel={(opt) => opt}
            isOptionEqualToValue={(opt, val) => opt === val}
        />
    );
}