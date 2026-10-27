
import { Outlet } from "react-router";

import Header from "./Header";
import Footer from "./Footer";

function SiteLayout() {
    return (
        <>
            <Header />

            <main id="main-content" tabIndex={-1}>
                <Outlet />
            </main>

            <Footer />
        </>
    );
}

export default SiteLayout;
