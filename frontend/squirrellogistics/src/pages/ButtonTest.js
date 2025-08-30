import { Grid } from "@mui/material"
import { theme } from "../components/common/CommonTheme"
import { ButtonContainer, One100ButtonAtCenter, OneButtonAtCenter, OneButtonAtLeft, OneButtonAtRight, TwoButtonsAtCenter, TwoButtonsAtEnd } from "../components/common/CommonButton"

const ButtonTest = () => {

    const red = theme.palette.error
    return (
        <Grid container height={'100vh'} margin={"5% 0"}>
            <Grid size={3} />
            <Grid size={6} border={'2px solid'} borderColor={theme.palette.primary.main}>
                <ButtonContainer width={"100%"} marginTop={"5%"} marginBottom={"5%"}>
                    <TwoButtonsAtCenter
                        leftTitle={"TwoButtonsAtCenter-left"}
                        leftColor={theme.palette.error.main}
                        rightTitle={"TwoButtonsAtCenter-right"}
                    />
                </ButtonContainer>

                <ButtonContainer width={"100%"} marginTop={"5%"} marginBottom={"5%"}>
                    <TwoButtonsAtEnd
                        leftTitle={"TwoButtonsAtEnd-left"}
                        rightTitle={"TwoButtonsAtEnd-right"}
                        rightDisabled={true}
                    />
                </ButtonContainer>

                <ButtonContainer width={"100%"} marginTop={"5%"} marginBottom={"5%"}>
                    <One100ButtonAtCenter>
                        One100ButtonAtCenter
                    </One100ButtonAtCenter>
                </ButtonContainer>

                {/* One100ButtonAtCenter - container의 width로 크기 조절 가능, height, fontSize는 직접 설정 */}
                <ButtonContainer width={"50%"} marginTop={"5%"} marginBottom={"5%"}>
                    <One100ButtonAtCenter height={"25px"} fontSize={"25px"}>
                        One100ButtonAtCenter
                    </One100ButtonAtCenter>
                </ButtonContainer>

                <ButtonContainer width={"100%"} marginTop={"5%"} marginBottom={"5%"}>
                    <OneButtonAtLeft height={"auto"}>
                        OneButtonAtLeft
                    </OneButtonAtLeft>
                </ButtonContainer>

                <ButtonContainer width={"100%"} marginTop={"5%"} marginBottom={"5%"}>
                    <OneButtonAtRight>
                        OneButtonAtRight
                    </OneButtonAtRight>
                </ButtonContainer>

                <ButtonContainer width={"100%"} marginTop={"5%"} marginBottom={"5%"}>
                    <OneButtonAtCenter>
                        OneButtonAtCenter
                    </OneButtonAtCenter>
                </ButtonContainer>
            </Grid>
            <Grid size={3} />
        </Grid>
    )
}
export default ButtonTest