import { Children, useEffect, useState } from "react";



/// initially
{/* <nav class="sidebar sidebar-offcanvas sidebar-icon-only" id="sidebar"><div class="sidebar-brand-wrapper d-flex align-items-center justify-content-center"><a class="sidebar-brand brand-logo text-primary" href="/"><i class="fas fa-bomb"></i> Willycord</a><a class="sidebar-brand brand-logo-mini" href="/"><i class="fas fa-bomb"></i></a></div><ul class="nav" id="sidebarNav"><li class="nav-item profile"><div class="profile-desc"><div class="profile-pic"><div class="count-indicator"><img class="img-xs rounded-circle " src="https://firebasestorage.googleapis.com/v0/b/willycord-cf09f.appspot.com/o/profiles%2FnE2Oqo3T0XcZ4K89v0cdEkYdfjb2?alt=media&amp;token=de2e9862-f612-4dd4-bcea-443d14d82c4b" alt=""><span class="count bg-success"></span></div><div class="profile-name"><h5 class="mb-0 font-weight-normal">willy</h5></div></div></div></li><li class="nav-item nav-category"><span class="nav-link">Menu</span></li><li class="nav-item menu-items"><a class="nav-link" href="/"><span class="menu-icon"><i class="fas fa-home"></i></span><span class="menu-title">Home</span></a></li><li class="nav-item menu-items"><a class="nav-link" href="/"><span class="menu-icon"><i class="fas fa-cog"></i></span><span class="menu-title">Settings</span></a></li><li class="nav-item menu-items"><a class="nav-link" href="/inbox"><span class="menu-icon"><i class="fas fa-envelope"></i></span><span class="menu-title">DMs</span></a></li><li class="nav-item nav-category"><span class="nav-link">Servers</span></li><li class="nav-item menu-items"><a class="nav-link" href="/server/default"><span class="menu-icon"><img class="navServerIcon img-xs rounded-circle" src="https://firebasestorage.googleapis.com/v0/b/willycord-cf09f.appspot.com/o/servers%2Fbomb-icon-vector-line-boom-260nw-1050259721.jpg?alt=media&amp;token=9534db7f-cb32-4f87-927e-dd63b2825dff"></span><span class="menu-title">WillyChat Official Server</span></a></li><li class="nav-item menu-items"><a class="nav-link" href="/"><span class="menu-icon"><i class="fas fa-plus"></i></span><span class="menu-title">Create a new server</span></a></li></ul></nav> */}



const Header = ({collapsed, setCollapsed, children}) => {
    // const [channelData, setChannelData] = useState({})
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.getElementById('sidebarNav').classList.remove('collapsedSidebar');
        document.getElementById('sidebar').classList.remove('collapsedSidebar');
    }, [])

    const toggleCollapse = () => {
        console.log(collapsed)
        if(collapsed){
            document.getElementById('sidebar').classList.remove('active');
            document.getElementById('sidebarNav').classList.remove('collapsedSidebar');

            if(window.innerWidth > 991){
                document.getElementById('root').classList.add('sidebar-icon-only')
            }
            else{
                document.getElementById('sidebarNav').classList.remove('collapsedSidebar');
                document.getElementById('sidebar').classList.remove('collapsedSidebar');

            }
        }
        else{
            document.getElementById('sidebar').classList.add('active');
            if(window.innerWidth > 991){
                document.getElementById('root').classList.remove('sidebar-icon-only')
            }
        }
        setCollapsed(!collapsed);
    }

    return (
    <>
    {!loading && (
        <nav class="navbar p-0 fixed-top d-flex flex-row">
        <div class="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
          <button class="navbar-toggler navbar-toggler align-self-center" type="button" onClick={toggleCollapse}>
            <span class="fas fa-bars"></span>
          </button>
          <ul class="navbar-nav w-100">
              <li class="nav-item">
                {children}
              </li>
          </ul>
        </div>
      </nav>
    )}
    {loading && (
        <nav class="navbar p-0 fixed-top d-flex flex-row navbar-chat-header">
        <div class="border-spinner text-primary"></div>
        </nav>
    )}
    </>

    
    )
}

export default Header;