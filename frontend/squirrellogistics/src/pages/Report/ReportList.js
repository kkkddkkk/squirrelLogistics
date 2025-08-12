import { useState } from "react";
import { Layout, ListBoxContainer, SubTitle } from "../../components/common/CommonForCompany";
import { Box, Grid, Typography } from "@mui/material";

const ReportList = () => {

    const [isExpand, setIsExpand] = useState();

    return (
        <Layout title={"내 신고목록"}>
            <Grid container>
                <Grid size={3} />
                <Grid size={6}>
                    <SubTitle>0000.00.00.</SubTitle>
                    <ListBoxContainer isExpand={isExpand} setIsExpand={setIsExpand} header={"id.start->id.end"}>
                        <Box margin={"3%"}>
                            <SubTitle>아무내용이나 대충 갈기기 </SubTitle>
                            <Typography textAlign={"justify"}>
                                딱 세줄만 넘길만큼 만 아무말이나 써봅시다 제가 오늘 연어를 절였는대요 여름이라 차가운 물이 잘 안나와서
                                아주 낭패였답니다 그래도 열라 맛있게 만들어졌어요 이게 지금 당장 먹을 수 있는게 아니라 불필요한 수분이
                                빠질 때까지 기다려야 돼서 내일 먹을 수 있는데요 넘 기대가 됩니다 연어랑 먹으려고 술도 샀어요
                                백화수복을 샀답니다 백화수복은 의외로 굉장히 맛있는 청주그등요 청하도 충분히 맛있지만 기분이 좋으니
                                백화수복을 사봤어요
                            </Typography>
                            <Box width={"100%"} border={"1px solid #909095"} margin={"5% 0"} />
                            <SubTitle>A. 아무내용이나 대충 갈기기</SubTitle>
                            <Typography textAlign={"justify"}>
                                그러셨군요<br/>뭐 어쩌라는거죠? 두번 다시는 이런 일로 신고하지 마세요.
                                블랙리스트로 올리도록 하겠습니다.<br/>
                                감사합니다.
                            </Typography>
                        </Box>

                    </ListBoxContainer>
                </Grid>
                <Grid size={3} />
            </Grid>

        </Layout>
    )
}
export default ReportList;