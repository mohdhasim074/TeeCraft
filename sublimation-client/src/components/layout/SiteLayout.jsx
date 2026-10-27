
import { Outlet } from "react-router";

import Header from "./Header";
import Footer from "./Footer";

function SiteLayout() {
    return (
        <>
            <Header />

            <main id="home">
                <Outlet />
            </main>

            <Footer />
        </>
    );
}

export default SiteLayout;
