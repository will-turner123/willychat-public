// import NavBar from "../components/NavBar";
import {Outlet} from "react-router-dom";


const Layout = () => {
    return (
        <>
        {/* <NavBar></NavBar> */}
        <div class="container-scroller">
            <Outlet />
        </div>
        </>
    )
}

export default Layout;