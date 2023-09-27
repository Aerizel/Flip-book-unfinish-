import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import '../Style/MenuAdmin.css';
import { GetProfile } from '../../GetProfile';
import * as Icon1 from 'react-icons/fa';
import * as Icon2 from 'react-icons/tb';
import * as Icon4 from 'react-icons/rx';
import * as Icon5 from 'react-icons/io';
import * as Icon6 from 'react-icons/im';
import * as Icon7 from 'react-icons/md';
import * as Icon8 from 'react-icons/ri';

export default function MenuAdmin() {

    const navigate = useNavigate();

    const [username, SetUsername] = useState('');
    const [name, SetName] = useState('');
    const [imageURL, SetImageURL] = useState('');
    const [userStatus,SetUserStatus] = useState(0);

    const Logout = () => {
        // Alert box popup
        toast.success('ล็อกเอาท์ออกจากระบบแล้ว', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });

        localStorage.removeItem('status');
        localStorage.setItem('token', '');
        sessionStorage.setItem("UserStatus", "not login");
        navigate("/");
    }

    //Check token that is null or not
    const token = localStorage.getItem("token");
    if (token) {
        fetchData();
    } else {
        Logout();
    }

    //Call GetProfile component to get profile value then receive return value 
    async function fetchData() {
        try {
            const profileData = await GetProfile();

            if (profileData.status==='ok') {
                SetUsername(profileData.username);
                SetName(profileData.real_name);
                SetImageURL(profileData.url);
                SetUserStatus(profileData.user_status);
            } else {
                console.error('Can not get infomation from getProfile');
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    return (
        <>
            <div className="menu-admin">
                <div className="navbar">
                    <div className="nav-list">
                        <div className="profile-card">
                            <div className="profile">
                                <img src={imageURL} alt="profile" />
                            </div>
                            <div className="profile-detail">
                                <h4>ชื่อผู้ใช้งาน : {username}</h4>
                                <h4>ชื่อ : {name}</h4>
                                <h4>{userStatus===3 ? 'สถานะ : Admin (ใหญ่สุด)' : 'สถานะ : Admin'}</h4>
                            </div>
                        </div>
                        {userStatus===3 ? 
                            <div className="nav-menu">
                                <button onClick={() => navigate('/admin/ManageAdmin')}>
                                    <span><Icon8.RiAdminLine /></span>
                                    <p>บริหารจัดการผู้ดูแลระบบ</p>
                                </button>
                            </div>
                        : ''}
                        <div className="nav-menu">
                            <button >
                                <span><Icon1.FaUsersCog /></span>
                                <p>จัดการผู้ใช้งานระบบ</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button >
                                <span><Icon6.ImBooks /></span>
                                <p>จัดการหนังสือในระบบ</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button onClick={() => navigate('/admin/ReportFromUser')}>
                                <span><Icon2.TbMessageReport /></span>
                                <p>เรื่องร้องเรียนจากผู้ใช้งาน</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button onClick={() => navigate('/admin/ReportAccept')}>
                                <span><Icon2.TbReportSearch /></span>
                                <p>เรื่องร้องเรียนที่ได้รับมา</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button onClick={() => navigate('/admin/BookSellApprove')}>
                                <span><Icon7.MdSell /></span>
                                <p>อนุญาติสิทธิการขายหนังสือ</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button onClick={() => navigate('/admin/StatisticAdmin')}>
                                <span><Icon2.TbChartHistogram /></span>
                                <p>รายงานผลสถิติ</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button>
                                <span><Icon1.FaNewspaper /></span>
                                <p>ประกาศข่าวและแจ้งเตือน</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button>
                                <span><Icon8.RiAdvertisementFill /></span>
                                <p>สร้างโฆษณา</p>
                            </button>
                        </div>
                        <div className="nav-menu">
                            <button onClick={Logout}>
                                <span><Icon4.RxExit /></span>
                                <p>ออกจากระบบ</p>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={"top-nav-admin"}>
                    <div className="top-menubar">
                        <form className="notification">
                            <button type="button"><span><Icon5.IoMdNotifications /></span></button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

