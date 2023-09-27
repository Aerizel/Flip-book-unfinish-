import { React, useContext, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { apiContext } from "../..";
import "../Style/EditAdmin.css";
import * as Icon1 from 'react-icons/ri'

export default function EditAdmin() {

    const backend = useContext(apiContext);

    //Open or close form input  
    const [editPic, SetEditPic] = useState(false);
    const [editName, SetEditname] = useState(false);
    const [editSurname, SetEditSurname] = useState(false);
    const [editUsername, SetEditUsername] = useState(false);
    const [editBirthdate, SetEditBirthdate] = useState(false);
    const [editEmail, SetEditEmail] = useState(false);
    const [editPassword, SetEditPassword] = useState(false);

    //Form value
    const [name, SetName] = useState('');
    const [surname, SetSurname] = useState('');
    const [username, SetUsername] = useState('');
    const [birthdate, SetBirthdate] = useState('');
    const [email, Setemail] = useState('');
    const [imageURL, SetImageURL] = useState('');
    const [pictureLocate, SetPictureLocate] = useState('');
    const [newImage, SetNewImage] = useState('');
    const [newUsername, SetNewusername] = useState('');
    const [newEmail, SetNewEmail] = useState('');
    const [newPassword, SetNewPassword] = useState('');

    //Receive book id value from main page
    const location = useLocation();
    const AdminID = location.state?.editadmin;

    const toastId = useRef(null);

    useEffect(() => {

        //Get user profile data from backend
        axios.post(`${backend}GetAdminProfile`, { email: AdminID }).then((response) => {
            if (response.data.status === 'ok') {
                const userProfile = response.data.userProfile;
                SetName(userProfile.name);
                SetSurname(userProfile.surname);
                SetUsername(userProfile.username);
                Setemail(userProfile.email);
                SetPictureLocate(userProfile.picture);
                SetImageURL(response.data.url);

                //Format date
                const dateFormat = new Date(userProfile.birthdate);
                const convertDate = String(dateFormat.getDate()).padStart(2, '0') + "/" + String(dateFormat.getMonth() + 1).padStart(2, '0') + "/" + dateFormat.getFullYear();
                SetBirthdate(convertDate);

            } else {
                console.log("Get admin profile fail.");
            }
        });

    }, [AdminID, backend, email]);

    //Send new edit data to backend
    const EditProfileDB = (props) => {

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}EditProfile`, {
            column: props.column,
            value: props.value,
            email: email
        }).then((response) => {
            if (response.data.status === 'ok') {
                toast.update(toastId.current, {
                    render: "แก้ไขข้อมูลสำเร็จแล้ว",
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
                //console.log(`Update ${props.column} complete.`);
            } else {
                toast.update(toastId.current, {
                    render: "แก้ไขข้อมูลไม่สำเร็จ",
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
                //console.log(`Update ${props.column} fail`);
            }
        });
    }

    //Send new picture file to backend to update database and file storage
    const UpdatePicture = () => {

        //Create form data for send to node js
        const formData = new FormData();
        formData.append('email', email);
        formData.append('oldimage', pictureLocate);
        formData.append('pic', newImage);
        formData.append('username', username);

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}UpdateProfilePicture`, formData).then((response) => {
            if (response.data.status === 'ok') {
                toast.update(toastId.current, {
                    render: "แก้ไขรูปภาพสำเร็จแล้ว",
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
                //console.log(`Update picture complete.`);
                SetImageURL(response.data.url);
                SetPictureLocate(response.data.piclocate);
            } else {
                toast.update(toastId.current, {
                    render: "แก้ไขรูปภาพไม่สำเร็จ",
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
                //console.log(`Update picture fail`);
            }
        });
    }

    //Submit form
    const ChangePicture = (event) => {
        event.preventDefault();
        UpdatePicture();
        SetEditPic(false);
    }

    const ChangeName = (event) => {
        event.preventDefault();
        SetName(name);
        EditProfileDB({ column: "name", value: name });
        SetEditname(false);
    }

    const ChangeSurname = (event) => {
        event.preventDefault();
        SetSurname(surname);
        EditProfileDB({ column: "surname", value: surname });
        SetEditSurname(false);
    }

    const ChangeUsername = async (event) => {
        event.preventDefault();
        SetUsername(newUsername);
        EditProfileDB({ column: "username", value: newUsername });
        SetNewusername('');
        SetEditUsername(false);
    }

    const ChangeBirthdate = (event) => {
        event.preventDefault();
        EditProfileDB({ column: "birthdate", value: birthdate });

        //Format date for display after submit
        const dateFormat = new Date(birthdate);
        const convertDate = String(dateFormat.getDate()).padStart(2, '0') + "/" + String(dateFormat.getMonth() + 1).padStart(2, '0') + "/" + dateFormat.getFullYear();
        SetBirthdate(convertDate);

        SetEditBirthdate(false);
    }

    const ChangeEmail = async (event) => {
        event.preventDefault();
        Setemail(newEmail);
        EditProfileDB({ column: "email", value: newEmail });
        SetNewEmail('')
        SetEditEmail(false);
    }

    const ChangePassword = async (event) => {
        event.preventDefault();
        EditProfileDB({ column: "password", value: newPassword });
        SetNewPassword('');
        SetEditPassword(false);
    }

    //Cancel form input
    const CancelName = (event) => {
        event.preventDefault();
        SetEditname(false);
    }

    const CancelSurname = (event) => {
        event.preventDefault();
        SetEditSurname(false);
    }

    const CancelUsername = (event) => {
        event.preventDefault();
        SetNewusername('');
        SetEditUsername(false);
    }

    const CancelBirthdate = (event) => {
        event.preventDefault();
        SetEditBirthdate(false);
    }

    const picturecancel = (event) => {
        event.preventDefault();
        SetNewImage('');
        SetEditPic(false);
    }

    const cancelEmail = (event) => {
        event.preventDefault();
        SetNewEmail('');
        SetEditEmail(false);
    }

    const cancelPassword = (event) => {
        event.preventDefault();
        SetNewPassword('');
        SetEditPassword(false);
    }

    return (
        <>
            {editPic ?
                <div className="edit-alert-box-bg">
                    <div className="edit-alert-box">
                        <h4>เปลี่ยนรูปโปรไฟล์ใหม่</h4>
                        <form onSubmit={ChangePicture}>
                            <div className="form-control-picture">
                                <label htmlFor="content">อัปโหลดรูปภาพ (ไฟล์ .png หรือ .jpeg เท่านั้น)</label>
                                <input className="file" type="file" id="content" onChange={(e) => { SetNewImage(e.target.files[0]) }} accept="image/png,image/jpeg" required></input>
                            </div>
                            <div className="alert-box-btn">
                                <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                <button type="button" className="alert-box-btn cancel" onClick={picturecancel}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
                : ""}
            <div className="edit-admin">
                <div className="edit-header">
                    <span><Icon1.RiUserSettingsLine /></span>
                    <h1>แก้ไขโปรไฟล์</h1>
                </div>
                <div className="edit-admin-form">
                    <div className="edit-pic">
                        <img src={imageURL} alt="profile user" />
                        <button type="button" onClick={() => SetEditPic(true)}>เปลี่ยนรูปโปรไฟล์</button>
                    </div>
                    <div className="edit-box">
                        {editName ?
                            <div className="edit-choice">
                                <form onSubmit={ChangeName}>
                                    <div className="form-control">
                                        <h4>ชื่อ </h4>
                                        <input type="text" id="name" placeholder="กรุณาใส่ชื่อที่จะเปลี่ยนใหม่" onChange={(e) => SetName(e.target.value)} pattern="[A-Za-zก-๏]\S{1,30}" title="กรุณาใส่ชื่อที่เป็นตัวอักษรไม่เกิน 30 ตัว" autoComplete="off" required />
                                        <button type="submit" className="edit-choice submit">ตกลง</button>
                                        <button type="button" className="edit-choice cancel" onClick={CancelName}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div> :
                            <div className="edit-select">
                                <h4>ชื่อ </h4>
                                <p>{name}</p>
                                <button type="button" onClick={() => SetEditname(true)}>แก้ไข</button>
                            </div>
                        }
                    </div>
                    <div className="edit-box">
                        {editSurname ?
                            <div className="edit-choice">
                                <form onSubmit={ChangeSurname}>
                                    <div className="form-control">
                                        <h4>นามกสุล </h4>
                                        <input type="text" id="surname" placeholder="กรุณาใส่นามสกุลที่จะเปลี่ยนใหม่" onChange={(e) => SetSurname(e.target.value)} pattern="[A-Za-zก-๏]\S{1,30}" title="กรุณาใส่นามสกุลที่เป็นตัวอักษรไม่เกิน 30 ตัว" autoComplete="off" required />
                                        <button type="submit" className="edit-choice submit">ตกลง</button>
                                        <button type="button" className="edit-choice cancel" onClick={CancelSurname}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div> :
                            <div className="edit-select">
                                <h4>นามกสุล </h4>
                                <p>{surname}</p>
                                <button type="button" onClick={() => SetEditSurname(true)}>แก้ไข</button>
                            </div>
                        }
                    </div>
                    <div className="edit-box">
                        {editUsername ?
                            <div className="edit-choice">
                                <form onSubmit={ChangeUsername}>
                                    <div className="form-control">
                                        <h4>ชื่อผู้ใช้งาน </h4>
                                        <input type="text" id="changeusername" value={newUsername} placeholder="ใส่ชื่อผู้ใช้งาน" onChange={(e) => SetNewusername(e.target.value)} pattern="[A-Za-zก-๏]\S{1,20}" required autoComplete="off" />
                                        <button type="submit" className="edit-choice submit">ตกลง</button>
                                        <button type="button" className="edit-choice cancel" onClick={CancelUsername}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div> :
                            <div className="edit-select">
                                <h4>ชื่อผู้ใช้งาน </h4>
                                <p>{username}</p>
                                <button type="button" onClick={() => SetEditUsername(true)}>แก้ไข</button>
                            </div>
                        }
                    </div>
                    <div className="edit-box">
                        {editBirthdate ?
                            <div className="edit-choice">
                                <form onSubmit={ChangeBirthdate}>
                                    <div className="form-control">
                                        <h4>วันเกิด </h4>
                                        <input type="date" id="birhtdate" onChange={(e) => SetBirthdate(e.target.value)} title="กรุณาใส่วันเกิดก่อน" autoComplete="off" required />
                                        <button type="submit" className="edit-choice submit">ตกลง</button>
                                        <button type="submit" className="edit-choice submit">ตกลง</button>
                                        <button type="button" className="edit-choice cancel" onClick={CancelBirthdate}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div> :
                            <div className="edit-select">
                                <h4>วันเกิด </h4>
                                <p>{birthdate}</p>
                                <button type="button" onClick={() => SetEditBirthdate(true)}>แก้ไข</button>
                            </div>
                        }
                    </div>
                    <div className="edit-box">
                        {editEmail ?
                            <div className="edit-choice">
                                <form onSubmit={ChangeEmail}>
                                    <div className="form-control">
                                        <h4>อีเมล </h4>
                                        <input type="email" id="changeemail" value={newEmail} placeholder="ใส่อีเมล" onChange={(e) => SetNewEmail(e.target.value)} pattern="[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$" title="กรุณาใส่เฉพาะอีเมล" required autoComplete="off" />
                                        <button type="submit" className="edit-choice submit">ตกลง</button>
                                        <button type="button" className="edit-choice cancel" onClick={cancelEmail}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div> :
                            <div className="edit-select">
                                <h4>อีเมล </h4>
                                <p>{email}</p>
                                <button type="button" onClick={() => SetEditEmail(true)}>แก้ไข</button>
                            </div>
                        }
                    </div>
                    <div className="edit-box">
                        {editPassword ?
                            <div className="edit-choice">
                                <form onSubmit={ChangePassword}>
                                    <div className="form-control">
                                        <h4>เปลี่ยนรหัสผ่านใหม่</h4>
                                        <input type="password" id="changepassword" value={newPassword} placeholder="ใส่รหัสผ่านใหม่" onChange={(e) => SetNewPassword(e.target.value)} pattern="[A-Za-z0-9]\S{5,20}" title="กรุณาใส่รหัสผ่านที่เป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 6-20 ตัว" required />
                                        <button type="submit" className="edit-choice submit">ตกลง</button>
                                        <button type="button" className="edit-choice cancel" onClick={cancelPassword}>ยกเลิก</button>
                                    </div> 
                                </form>
                            </div> :
                            <div className="edit-select">
                                <h4>เปลี่ยนรหัสผ่านใหม่</h4>
                                <button type="button" onClick={() => SetEditPassword(true)}>แก้ไข</button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}