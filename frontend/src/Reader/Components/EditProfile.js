import {React,useContext,useState,useEffect,useRef} from "react";
import axios from "axios";
import "../Styles/EditProfile.css";
import { toast } from 'react-toastify';
import * as Icon1 from 'react-icons/ri'
import { apiContext } from "../..";

export default function EditProfile() {

    const backend = useContext(apiContext);

    const [userEmail,SetUserEmail] = useState(0);

    //Open or close form input  
    const [editPic,SetEditPic] = useState(false);
    const [editName,SetEditname] = useState(false);
    const [editSurname,SetEditSurname] = useState(false);
    const [editUsername,SetEditUsername] = useState(false);
    const [editBirthdate,SetEditBirthdate] = useState(false);
    const [editEmail,SetEditEmail] = useState(false);
    const [editPassword,SetEditPassword] = useState(false);
    const [deleteUser,SetDeleteUser] = useState(false);

    //Form value
    const [name,SetName] = useState('');
    const [surname,SetSurname] = useState('');
    const [username,SetUsername] = useState('');
    const [birthdate,SetBirthdate] = useState('');
    const [email,Setemail] = useState('');
    const [bankname,SetBankname] = useState('');
    const [bankserial,SetBankSerial] = useState('');
    const [imageURL,SetImageURL] = useState('');
    const [PictureLocate,SetPictureLocate] = useState('');
    const [password,SetPassword] = useState('');
    const [pwdWrong,SetPwdWrong] = useState(false);
    const [newImage,SetNewImage] = useState('');
    const [newUsername,SetNewusername] = useState('');
    const [newEmail,SetNewEmail] = useState('');
    const [newPassword,SetNewPassword] = useState('');

    const toastId = useRef(null);

    useEffect(()=> {

        let user_email = '';
        let pictureURL = [];

        //Check token that is still valid or not
        const token = JSON.parse(localStorage.getItem("token"));
        if(token!=='') {
            
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            
            const bodyParameters = {
               key: "value"
            };

            axios.post(`${backend}CheckToken`,
                bodyParameters,
                config
            ).then((response)=>{
                if(response.data.status === 'ok') {
                    user_email = response.data.decoded.email;
                    SetUserEmail(response.data.decoded.email);
                    Getuserprofile();
                } else {
                    console.log('authen fail.');
                }
            });

        } else {
            console.log('Token is null please login first.');
            localStorage.setItem('token','');
        }

        //Get user profile data from backend
        const Getuserprofile =()=> {
            axios.post(`${backend}GetUserProfile`, {email: user_email}).then((response)=>{
                if(response.data.status === 'ok') {
                    SetName(response.data.result.name);
                    SetSurname(response.data.result.surname);
                    SetUsername(response.data.result.username);
                    Setemail(response.data.result.email);
                    SetBankname(response.data.result.bank_name);
                    SetBankSerial(response.data.result.bank_serial);

                    //Format date
                    const dateFormat = new Date(response.data.result.birthdate);
                    const convertDate = String(dateFormat.getDate()).padStart(2, '0')+"/"+String(dateFormat.getMonth() + 1).padStart(2, '0')+"/"+dateFormat.getFullYear();
                    SetBirthdate(convertDate);

                    SetPictureLocate(response.data.result.picture);
                    pictureURL.push(response.data.result.picture);
                    GetImage();

                } else {
                    console.log("Get id user fail.");
                }
            });
        }

        //Get profile image from backend
        const GetImage =()=> {
            axios.post(`${backend}GetStorageFile`,{imageURL: pictureURL}
            ).then((response)=>{
                if(response.data.status === 'ok') {
                    SetImageURL(response.data.imageURL);
                } else {
                    console.log('Get user profile image fail.');
                }
            });
        }

    },[backend]);

    //Send user input password to backend for verify then receive result 
    const CheckPassword = async () => {
        try {
            const response = await axios.post(`${backend}CheckPassword`, {
                email: userEmail,
                password: password
            });
            return response.data.status; 
        } catch (error) {
            console.error('Error fetching data:', error);
            return null; 
        }
    }

    //Send new edit data to backend
    const EditProfileDB =(props)=> {

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}EditProfile`,{
            column : props.column,
            value : props.value,
            email : userEmail   
        }).then((response)=>{
            if(response.data.status === 'ok') {
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
                if(props.column === 'email') {
                    localStorage.setItem('token', JSON.stringify(response.data.token));
                }
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
    const UpdatePicture =()=> {

        //Create form data for send to node js
        const formData = new FormData();
        formData.append('email', userEmail);
        formData.append('oldimage', PictureLocate);
        formData.append('pic', newImage);
        formData.append('username',username);

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}UpdateProfilePicture`,formData).then((response)=>{

            if(response.data.status === 'ok') {
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
    const ChangePicture =(event)=> {
        event.preventDefault();
        UpdatePicture();
        SetEditPic(false);
    }

    const ChangeName =(event)=> {
        event.preventDefault();
        EditProfileDB({column: "name", value: name});
        SetEditname(false);
    }

    const ChangeSurname =(event)=> {
        event.preventDefault();
        EditProfileDB({column: "surname", value: surname});
        SetEditSurname(false);
    }

    const ChangeUsername = async (event)=> {
        event.preventDefault();
        const checkStatus = await CheckPassword()
        if(checkStatus === 'ok') {
            SetPwdWrong(false);
            SetUsername(newUsername);
            EditProfileDB({column: "username", value: newUsername});
            SetNewusername('');
            SetPassword('');
            SetEditUsername(false);
        } else {
            SetPwdWrong(true);
            SetPassword('');
        }
    }

    const ChangeBirthdate =(event)=> {
        event.preventDefault();
        EditProfileDB({column: "birthdate", value: birthdate});
    
        //Format date for display after submit
        const dateFormat = new Date(birthdate);
        const convertDate = String(dateFormat.getDate()).padStart(2, '0')+"/"+String(dateFormat.getMonth() + 1).padStart(2, '0')+"/"+dateFormat.getFullYear();
        SetBirthdate(convertDate);

        SetEditBirthdate(false);
    }

    const ChangeEmail = async (event)=> {
        event.preventDefault();
        const checkStatus = await CheckPassword()
        if(checkStatus === 'ok') {
            SetPwdWrong(false);
            Setemail(newEmail);
            EditProfileDB({column: "email", value: newEmail});
            SetNewEmail('');
            SetPassword('');
            SetEditEmail(false);
        } else {
            SetPwdWrong(true);
            SetPassword('');
        }
    }

    const ChangePassword = async (event) => {
        event.preventDefault();
        const checkStatus = await CheckPassword()
        if(checkStatus === 'ok') {
            SetPwdWrong(false);
            EditProfileDB({column: "password", value: newPassword});
            SetNewPassword('');
            SetPassword('');
            SetEditPassword(false);
        } else {
            SetPwdWrong(true);
            SetPassword('');
        }
    }

    const DeleteAccount = async (event) => {
        event.preventDefault();

        const phasetwo =()=> {
            const phaseone = document.querySelector('.delete-phase-one');
            phaseone.classList.add('active');
            const phasetwo = document.querySelector('.delete-phase-two');
            phasetwo.classList.add('active');
        }

        const checkStatus = await CheckPassword()
        if(checkStatus === 'ok') {
            SetPwdWrong(false);
            SetPassword('');
            phasetwo();
        } else {
            SetPwdWrong(true);
            SetPassword('');
        }
    }

    const DeleteAccountConfirm =()=> {
        EditProfileDB({column: 'delete', value: 'none'});
    }

    //Cancel form input
    const CancelName =(event)=> {
        event.preventDefault();
        SetEditname(false);
    }

    const CancelSurname =(event)=> {
        event.preventDefault();
        SetEditSurname(false);
    }

    const CancelUsername =(event)=> {
        event.preventDefault();
        SetNewusername('');
        SetPassword('');
        SetPwdWrong(false);
        SetEditUsername(false);
    }

    const CancelBirthdate =(event)=> {
        event.preventDefault();
        SetEditBirthdate(false);
    }

    const picturecancel =(event)=> {
        event.preventDefault();
        SetNewImage('');
        SetEditPic(false);
    }

    const emailcancel =(event)=> {
        event.preventDefault();
        SetNewEmail('');
        SetPassword('');
        SetPwdWrong(false);
        SetEditEmail(false);
    }

    const passwordcancel =(event)=> {
        event.preventDefault();
        SetNewPassword('');
        SetPassword('');
        SetPwdWrong(false);
        SetEditPassword(false);
    }

    const deletecancel =(event)=> {
        event.preventDefault();
        SetPassword('');
        SetPwdWrong(false);
        SetDeleteUser(false);
    }

    return(
        <>
            {editPic ? 
                <div className="edit-alert-box-bg">
                    <div className="edit-alert-box">
                        <h4>เปลี่ยนรูปโปรไฟล์ใหม่</h4>
                        <form onSubmit={ChangePicture}>
                            <div className="form-control-picture">
                                <label htmlFor="content">อัปโหลดรูปภาพ (ไฟล์ .png หรือ .jpeg เท่านั้น)</label>
                                <input className="file" type="file" id="content" onChange={(e)=>{SetNewImage(e.target.files[0])}} accept="image/png,image/jpeg" required></input>
                            </div>
                            <div className="alert-box-btn">
                                <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                <button type="button" className="alert-box-btn cancel" onClick={picturecancel}>ยกเลิก</button>    
                            </div>
                        </form>
                    </div>
                </div>
            : ""}
            {editUsername ? 
                <div className="edit-alert-box-bg">
                    <div className="edit-alert-box">
                        <h4>เปลี่ยนชื่อผู้ใช้งานใหม่</h4>
                        <form onSubmit={ChangeUsername}>
                            <div className="form-control">
                                <label htmlFor="changeusername">ใส่ชื่อผู้ใช้งานใหม่</label>
                                <input type="text" id="changeusername" value={newUsername} placeholder="ใส่ชื่อผู้ใช้งาน" onChange={(e)=>SetNewusername(e.target.value)} pattern="[A-Za-zก-๏]\S{1,20}" required autoComplete="off"/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="checkpassword">ใส่รหัสผ่านเพื่อยืนยัน</label>
                                <input type="password" id="checkpassword" value={password} placeholder="ใส่รหัสผ่าน" onChange={(e)=>SetPassword(e.target.value)} pattern="[A-Za-z0-9]\S+" title="กรุณาใส่รหัสผ่านที่เป็นตัวอักษรภาษาอังกฤษหรือตัวเลข" required/>
                            </div>
                            <div className="pwd-alert">
                                {pwdWrong ? <p>รหัสผ่านผิดกรุณาลองใหม่อีกครั้ง</p> : ''}
                            </div>
                            <div className="alert-box-btn">
                                <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                <button type="button" className="alert-box-btn cancel" onClick={CancelUsername}>ยกเลิก</button>  
                            </div>
                        </form>
                    </div>
                </div> 
            : ""}
            {editEmail ? 
                <div className="edit-alert-box-bg">
                    <div className="edit-alert-box">
                        <h4>เปลี่ยนอีเมลใหม่</h4>
                        <form onSubmit={ChangeEmail}>
                            <div className="form-control">
                                <label htmlFor="changeemail">ใส่อีเมลตัวใหม่</label>
                                <input type="email" id="changeemail" value={newEmail} placeholder="ใส่อีเมล" onChange={(e)=>SetNewEmail(e.target.value)} pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$" title="กรุณาใส่เฉพาะอีเมล" required autoComplete="off"/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="checkpassword">ใส่รหัสผ่านเพื่อยืนยัน</label>
                                <input type="password" id="checkpassword" value={password} placeholder="ใส่รหัสผ่าน" onChange={(e)=>SetPassword(e.target.value)} pattern="[A-Za-z0-9]\S+" title="กรุณาใส่รหัสผ่านที่เป็นตัวอักษรภาษาอังกฤษหรือตัวเลข" required/>
                            </div>
                            <div className="pwd-alert">
                                {pwdWrong ? <p>รหัสผ่านผิดกรุณาลองใหม่อีกครั้ง</p> : ''}
                            </div>
                            <div className="alert-box-btn">
                                <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                <button type="button" className="alert-box-btn cancel" onClick={emailcancel}>ยกเลิก</button>    
                            </div>
                        </form>
                    </div>
                </div>
            : ""}
            {editPassword ? 
                <div className="edit-alert-box-bg">
                    <div className="edit-alert-box">
                        <h4>เปลี่ยนรหัสผ่านใหม่</h4>
                        <form onSubmit={ChangePassword}>
                            <div className="form-control">
                                <label htmlFor="changepassword">ใส่รหัสผ่านใหม่</label>
                                <input type="password" id="changepassword" value={newPassword} placeholder="ใส่รหัสผ่านใหม่" onChange={(e)=>SetNewPassword(e.target.value)} pattern="[A-Za-z0-9]\S{5,20}" title="กรุณาใส่รหัสผ่านที่เป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 6-20 ตัว" required/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="checkpassword">ใส่รหัสผ่านเดิมเพื่อยืนยัน</label>
                                <input type="password" id="checkpassword" value={password} placeholder="ใส่รหัสผ่านเดิม" onChange={(e)=>SetPassword(e.target.value)} pattern="[A-Za-z0-9]\S+" title="กรุณาใส่รหัสผ่านที่เป็นตัวอักษรภาษาอังกฤษหรือตัวเลข" required/>
                            </div>
                            <div className="pwd-alert">
                                {pwdWrong ? <p>รหัสผ่านผิดกรุณาลองใหม่อีกครั้ง</p> : ''}
                            </div>
                            <div className="alert-box-btn">
                                <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                <button type="button" className="alert-box-btn cancel" onClick={passwordcancel}>ยกเลิก</button>    
                            </div>
                        </form>
                    </div>
                </div>
            : ""}
            {deleteUser ? 
                <div className="edit-alert-box-bg">
                    <div className="edit-alert-box delete">
                        <h4>ลบบัญชีออกถาวร</h4>
                        <form onSubmit={DeleteAccount}>
                            <div className="delete-phase-one">
                                <div className="delete-massage-alert">
                                    <h5>*คำเตือน</h5>
                                    <p>หลังจากลบบัญชีออกถาวรแล้ว ข้อมูลของคุณจะถูกลบออกไปจากระบบทั้งหมดและจะไม่สามารถเรียกคืนกลับมาได้อีกครั้ง</p>
                                </div>
                                <div className="form-control delete">
                                    <label htmlFor="checkpassword">ใส่รหัสผ่านเพื่อยืนยัน</label>
                                    <input type="password" id="checkpassword" value={password} placeholder="ใส่รหัสผ่าน" onChange={(e)=>SetPassword(e.target.value)} pattern="[A-Za-z0-9]\S+" title="กรุณาใส่รหัสผ่านที่เป็นตัวอักษรภาษาอังกฤษหรือตัวเลข" required/>
                                </div>
                                <div className="pwd-alert">
                                    {pwdWrong ? <p>รหัสผ่านผิดกรุณาลองใหม่อีกครั้ง</p> : ''}
                                </div>
                                <div className="alert-box-btn delete">
                                    <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                    <button type="button" className="alert-box-btn cancel" onClick={deletecancel}>ยกเลิก</button>    
                                </div> 
                            </div>
                            <div className="delete-phase-two">
                                <div className="delete-massage-alert">
                                    <h5>*คำเตือน</h5>
                                    <p>เมื่อกดปุ่มยืนยันเพื่อลบบัญชีแล้ว ข้อมูลของคุณทัั้งหมดจะถูกลบออกไปจากระบบอย่างถาวร คุณแน่ใจแล้วใช่หรือไม่ที่จะลบบัญชีออกจากระบบ?</p>
                                </div>
                                <div className="alert-box-btn delete">
                                    <button type="button" className="alert-box-btn submit" onClick={DeleteAccountConfirm}>ยืนยัน</button>
                                    <button type="button" className="alert-box-btn cancel" onClick={deletecancel}>ยกเลิก</button>    
                                </div> 
                            </div>
                        </form>
                    </div>
                </div> 
            : ""}
            <div className="edit-profile">
                <div className="edit-header">
                    <span><Icon1.RiUserSettingsLine /></span>
                    <h1>แก้ไขโปรไฟล์</h1>
                </div>
                <div className="edit-pic">
                    <img src={imageURL} alt="profile user"/>
                    <button type="button" onClick={()=>SetEditPic(true)}>เปลี่ยนรูปโปรไฟล์</button>
                </div>
                <div className="edit-box">
                    {editName ?
                        <div className="edit-choice">
                            <form onSubmit={ChangeName}>
                                <div className="form-control">
                                    <h4>ชื่อ </h4>
                                    <input type="text" id="name" placeholder="กรุณาใส่ชื่อที่จะเปลี่ยนใหม่" onChange={(e)=>SetName(e.target.value)} pattern="[A-Za-zก-๏]\S{1,30}" title="กรุณาใส่ชื่อที่เป็นตัวอักษรไม่เกิน 30 ตัว" autoComplete="off" required/>
                                    <button type="submit" className="edit-choice submit">ตกลง</button>
                                    <button type="button" className="edit-choice cancel" onClick={CancelName}>ยกเลิก</button> 
                                </div>
                            </form>
                        </div> :
                        <div className="edit-select">
                            <h4>ชื่อ </h4>
                            <p>{name}</p>
                            <button type="button" onClick={()=>SetEditname(true)}>แก้ไข</button> 
                        </div> 
                    }
                </div>
                <div className="edit-box">
                    {editSurname ?
                        <div className="edit-choice">
                            <form onSubmit={ChangeSurname}>
                                <div className="form-control">
                                <h4>นามกสุล </h4>
                                    <input type="text" id="surname" placeholder="กรุณาใส่นามสกุลที่จะเปลี่ยนใหม่" onChange={(e)=>SetSurname(e.target.value)} pattern="[A-Za-zก-๏]\S{1,30}" title="กรุณาใส่นามสกุลที่เป็นตัวอักษรไม่เกิน 30 ตัว" autoComplete="off" required/>
                                    <button type="submit" className="edit-choice submit">ตกลง</button>
                                    <button type="button" className="edit-choice cancel" onClick={CancelSurname}>ยกเลิก</button> 
                                </div>
                            </form>
                        </div> :
                        <div className="edit-select">
                            <h4>นามกสุล </h4>
                            <p>{surname}</p>
                            <button type="button" onClick={()=>SetEditSurname(true)}>แก้ไข</button> 
                        </div>
                    }
                </div>
                <div className="edit-box">
                    <h4>ชื่อผู้ใช้งาน </h4>
                    <p>{username}</p>
                    <button type="button" onClick={()=>SetEditUsername(true)}>แก้ไข</button> 
                </div>
                <div className="edit-box">
                    {editBirthdate ?
                        <div className="edit-choice">
                            <form onSubmit={ChangeBirthdate}>
                                <div className="form-control">
                                <h4>วันเกิด </h4>
                                    <input type="date" id="birhtdate" onChange={(e)=>SetBirthdate(e.target.value)} title="กรุณาใส่วันเกิดก่อน" autoComplete="off" required/>
                                    <button type="submit" className="edit-choice submit">ตกลง</button>
                                    <button type="button" className="edit-choice cancel" onClick={CancelBirthdate}>ยกเลิก</button> 
                                </div>
                            </form>
                        </div> :
                        <div className="edit-select">
                            <h4>วันเกิด </h4>
                            <p>{birthdate}</p>
                            <button type="button" onClick={()=>SetEditBirthdate(true)}>แก้ไข</button> 
                        </div>
                    }
                </div>
                <div className="edit-box">
                    <h4>อีเมล </h4>
                    <p>{email}</p>
                    <button type="button" onClick={()=>SetEditEmail(true)}>แก้ไข</button>
                </div>
                <div className="edit-box">
                    <h4>เปลี่ยนรหัสผ่านใหม่</h4>
                    <button type="button" onClick={()=>SetEditPassword(true)}>แก้ไข</button>
                </div>
                <div className="edit-box">
                    <h4>ชื่อธนาคาร </h4>
                    <p>{bankname}</p>
                    <button type="button">แก้ไข</button>
                </div>
                <div className="edit-box">
                    <h4>เลขบัญชี </h4>
                    <p>{bankserial}</p>
                    <button type="button">แก้ไข</button>
                </div>
                <div className="edit-box">
                    <h4>ลบบัญชีออกถาวร </h4>
                    <div className="btn-edit-delete">
                        <button type="button" onClick={()=>SetDeleteUser(true)}>ลบบัญชี</button>
                    </div>
                </div>
            </div>
        </> 
    );
}