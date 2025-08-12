import { Box, Modal, Typography } from "@mui/material";
import StarRate from "./StarRate";
import { OneBigBtn, SubTitle } from "../common/CommonForCompany";

const ReviewModal = ({ modal, setModal, scope, setScope }) => {
    return (
        <Modal open={modal} onClose={() => setModal(false)}
        >
            <Box sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                aspectRatio: "2/1",
                bgcolor: "background.paper",
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap"
            }}>
                <Box
                    sx={{
                        width: "20%",
                        margin: "5%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap"
                    }}
                >
                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap"
                    }}>
                        <Box
                            component="img"
                            sx={{
                                width: "100%",
                                aspectRatio: "1/1",
                                borderRadius: "100%",
                                marginBottom: "5%"
                            }}
                            alt="OtterImg"
                            src="https://www.otterspecialistgroup.org/osg-newsite/wp-content/uploads/2017/04/ThinkstockPhotos-827261360-2000x1200.jpg"
                        />
                        <Typography sx={{ marginBottom: "10%" }}>운전자명</Typography>
                        <StarRate modifying={true} scope={scope} setScope={setScope} />
                    </Box>

                </Box>
                <Box sx={{ width: "60%", margin: "5% 5% 5% 0", border: "1px solid black" }}>

                </Box>
                <Box width={"60%"}>
                    <OneBigBtn>리뷰등록</OneBigBtn>
                </Box>

            </Box>
        </Modal>
    )
}

export default ReviewModal;