import Header from "./Header";
import Body from "./Body";
import InfiniteArea from "./InfiniteArea";
import Footer from "./Footer";
import ScrollTopButton from "./ScrollTopButton";

export default function Layout() {
    return (
        <>
            <Header />
            <ScrollTopButton />
            <Body />
            <InfiniteArea />
            <Footer />
        </>
    );
}
