import { FormControl, MenuItem, Select } from "@mui/material";

export const PayMethod = ({paymentMethod, setPaymentMethod}) => {

    const paymentOptions = [
        { value: '', label: '결제수단을 선택하세요' },
        { value: 'html5_inicis', label: '신용카드' },
        { value: 'kakaopay', label: '카카오페이' },
        { value: 'danal', label: '휴대폰 소액결제' },
        { value: 'tosspay', label: '토스페이' }
    ];

    function handlePaymentMethodChange(e) {
        setPaymentMethod(e.target.value);
    }
    return (

        <FormControl fullWidth sx={{ mb: 3 }}>
            <Select value={paymentMethod} onChange={handlePaymentMethodChange} displayEmpty>
                {paymentOptions.map(option => (
                    <MenuItem key={option.value} value={option.value} disabled={option.value === ''}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}