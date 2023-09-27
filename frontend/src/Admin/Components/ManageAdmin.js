import { useContext, useState, useEffect, useRef } from "react";
import "../Style/ManageAdmin.css";
import axios from 'axios';
import { toast } from 'react-toastify';
import { apiContext } from "../..";
import * as Icon from "react-icons/fa6";
import { useNavigate } from "react-router-dom";


export default function ManageAdmin() {

    const navigate = useNavigate();

    const backend = useContext(apiContext);

    const [adminList, SetAdminList] = useState([]);
    const [deleteAdmin, SetDeleteAdmin] = useState(false);
    const [deleteAdminID, SetDeleteAdminID] = useState(0);
    const [deleteAdminName, SetDeleteAdminName] = useState('');
    const [deletePiclocate,SetDeletePicLocate] = useState('');

    const toastId = useRef(null);

    useEffect(() => {

        axios.get(`${backend}GetManageAdmin`).then((response) => {
            if (response.data.status === 'ok') {
                SetAdminList(response.data.results);
            } else {
                console.log("Can not get manage admin");
            }
        });

    }, [backend]);

    function deleteAdminNow() {
        
        SetDeleteAdmin(false);
        SetDeleteAdminID(0);
        SetDeleteAdminName('');

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}DeleteAdmin`, { userID: deleteAdminID, oldfile: deletePiclocate }).then((response) => {
            if (response.data.status === 'ok') {
                toast.update(toastId.current, {
                    render: `ลบผู้ใช้ออกจากระบบแล้ว`,
                    type: "success",
                    isLoading: false,
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",  
                });
                //console.log("Delete admin complete.");
            } else {
                toast.update(toastId.current, {
                    render: "ลบผู้ใช้งานออกจากระบบไม่สำเร็จ",
                    type: "error",
                    isLoading: false,
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                //console.log("Delete admin fail.");
            }
        });
    }

    function cancelDelete() {
        SetDeleteAdmin(false);
        SetDeleteAdminID(0);
        SetDeleteAdminName('');
    }

    return (
        <>
            {deleteAdmin ?
                <div className="delete-admin-box-bg">
                    <div className="delete-admin-box">
                        <h5>ลบบัญชีผู้ดูแลระบบ</h5>
                        <p className="alert-message">คุณต้องการที่จะลบผู้ดูแลระบบที่ชื่อว่า "{deleteAdminName}" ออกใช่หรือไม่</p>
                        <div className="alert-box-btn">
                            <button type="button" className="alert-box-btn submit" onClick={deleteAdminNow}>ยืนยัน</button>
                            <button type="button" className="alert-box-btn cancel" onClick={cancelDelete}>ยกเลิก</button>
                        </div>
                    </div>
                </div>
                : ''}
            <div className="manage-admin">
                <h1>บริหารจัดการผู้ดูแลระบบ</h1>
                <button type="button" className="create-admin" onClick={() => navigate("/admin/AddAdmin")}>
                    <span><Icon.FaUserPlus /></span>เพิ่มผู้ดูแลระบบ
                </button>
                <div className="manage-content">
                    <div className="content-table">
                        <table>
                            <tbody>
                                <tr>
                                    <th>ลำดับ</th>
                                    <th>รูปภาพโปรไฟล์</th>
                                    <th>ชื่อ</th>
                                    <th>ชื่อผู้ใช้งาน</th>
                                    <th>แก้ไขข้อมูล</th>
                                    <th>ลบบัญชีออก</th>
                                </tr>
                                {adminList.length > 0 ?
                                    adminList.map((value, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td><img src={value.url} alt="bookcover" /></td>
                                                <td>{value.real_name}</td>
                                                <td>{value.username}</td>
                                                <td><button className="btn-edit" onClick={() => navigate("/admin/EditAdmin", { state: { editadmin: value.userID } })}>แก้ไข</button></td>
                                                <td><button className="btn-delete" onClick={() => { SetDeleteAdminID(value.userID); SetDeleteAdminName(value.username); SetDeletePicLocate(value.picture_locate); SetDeleteAdmin(true);}}>ลบบัญชี</button></td>
                                            </tr>
                                        )
                                    })
                                    : ''}
                            </tbody>
                        </table>
                        {adminList.length > 0 ? '' : <h2>ไม่มีรายชื่อของผู้ดูแลระบบในปัจจุบัน</h2>}
                    </div>
                </div>
            </div>
        </>
    );
}