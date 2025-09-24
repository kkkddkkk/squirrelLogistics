import { Grid, useTheme } from "@mui/material";
import { CommonTitle } from "../../components/common/CommonText";
import BannerList from "../../components/admin/Banner/BannerList";
import CommonList from "../../components/common/CommonList";
import BannerThumbnail from "../../components/admin/Banner/BannerThumbnail";
import { ButtonContainer, Two100Buttons } from "../../components/common/CommonButton";
import ReactDragList from 'react-drag-list';
import { useEffect, useState } from "react";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import { API_SERVER_HOST, deleteBanner, getBannerList } from "../../api/admin/bannerApi";
import { useLocation, useNavigate } from "react-router-dom";

const BannerPage = () => {

    const thisTheme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { moveToMain } = usePaymentMove();

    const [refreshKey, setRefreshKey] = useState(0);
    const [bannerList, setBannerList] = useState([]);
    const [bannerForm, setBannerForm] = useState([]);


    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();
        const fetchData = async () => {
            try {
                const res = await getBannerList({ accessToken });
                setBannerList(res.data);
                console.log(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [refreshKey])

    const NumberBox = ({ index }) => {
        return (
            <CommonList padding={2} sx={{
                display: "flex",
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: "column",
                boxSizing: "border-box",
                height: "calc(100% - 16px)",
            }}>
                {index}
            </CommonList>
        )
    }

    const addBanner = () => {
        navigate({ pathname: `/admin/banner/add` });
    }

    const handleDeleteBanner = (bannerId) => {
        console.log(bannerId);
        if (!window.confirm("배너를 삭제하시겠습니까? 삭제된 배너는 복구되지 않습니다.")) return;
        const accessToken = localStorage.getItem("accessToken");
        deleteBanner({ accessToken, bannerId })
            .then(
                console.log('삭제성공')
            );
        console.log('deleted');
    }
    const showBanner = (record) => {
        navigate({ pathname: `/admin/banner/add`, search: `?id=${record.bannerId}` });

    }
    const returnBanner = () => {

    }
    const saveBanner = () => {

    }
    const showThumbnail = (record) => {
        setBannerForm(record);
    }

    return (
        <>
            <CommonTitle>배너 관리</CommonTitle>
            <Grid container spacing={3} marginBottom={10}>
                <Grid size={3} />
                <Grid size={6}>
                    <BannerThumbnail bannerLength={bannerList?.length}
                        src={bannerForm.imageUrl}
                        bannerForm={bannerForm} adding={false} />
                    {bannerList?.length > 0 ?
                        bannerList?.map((record, index) => (
                            <Grid container spacing={1} onClick={() => showThumbnail(record)}>
                                <Grid size={1} >
                                    <NumberBox index={index + 1} />
                                </Grid>
                                <Grid size={11}>
                                    <BannerList
                                        key={record.id}
                                        title={record.title}
                                        deleteFunc={() => handleDeleteBanner(record.bannerId)}
                                        showFunc={() => showBanner(record)}
                                        isBanner={true}
                                        showThumbnail={showThumbnail}
                                    />
                                </Grid>
                            </Grid>
                        ))
                        // <ReactDragList
                        //     key={refreshKey}
                        //     dataSource={bannerList}
                        //     row={(record, index) => (
                        //         <Grid container spacing={1} onClick={() => showThumbnail(record)}>
                        //             <Grid size={1} >
                        //                 <NumberBox index={index + 1} />
                        //             </Grid>
                        //             <Grid size={11}>
                        //                 <BannerList
                        //                     key={record.id}
                        //                     title={record.title}
                        //                     deleteFunc={()=>handleDeleteBanner(record.bannerId)}
                        //                     showFunc={() => showBanner(record)}
                        //                     isBanner={true}
                        //                     showThumbnail={showThumbnail}
                        //                 />
                        //             </Grid>
                        //         </Grid>
                        //     )}
                        //     handles={false}
                        //     onUpdate={() => {
                        //         setRefreshKey(prev => prev + 1);
                        //     }}
                        // />
                        : <></>}

                    {bannerList.length < 3 ?
                        <BannerList
                            isBanner={false}
                            addFunc={addBanner}
                        />
                        : <></>
                    }

                    {bannerList?.length > 1 ?
                        <ButtonContainer marginTop={5} marginBottom={5}>
                            <Two100Buttons
                                leftTitle={"되 돌 리 기"}
                                leftClickEvent={returnBanner}
                                rightTitle={"순 서 저 장"}
                                rightClickEvent={saveBanner}
                                gap={5}
                            />
                        </ButtonContainer> : <></>
                    }

                </Grid>
                <Grid size={3} />
            </Grid>
        </>
    )
}
export default BannerPage;