import { FormControl, FormLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";

export const PayMethod = () => {
    const [paymentMethod, setPaymentMethod] = useState("")

    const paymentOptions = [
        { value: '', label: '결제수단을 선택하세요' },
        { value: 'card', label: '신용카드' },
        { value: 'kakaoPay', label: '카카오페이' },
        { value: 'naverPay', label: '네이버페이' },
        { value: 'tossPay', label: '토스페이' }
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