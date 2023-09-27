import React,{useContext, useState, useRef} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { apiContext } from '../..';
import '../Styles/LogRegis.css'
import * as Icon from 'react-icons/md'
import * as Icon2 from 'react-icons/ai'
import * as Icon3 from 'react-icons/fa'
import * as Icon4 from 'react-icons/ri'
import * as Icon5 from 'react-icons/im'

function LogRegis() {

    const backend = useContext(apiContext);

    const navigate = useNavigate();

    const [logname,SetLogname] = useState('');
    const [logpwd,SetLogpwd] = useState('');
    const [name,SetName] = useState('');
    const [surname,SetSurname] = useState('');
    const [username,SetUsername] = useState('');
    const [birthdate,SetBirthdate] = useState('');
    const [email,SetEmail] = useState('');
    const [pwd,SetPwd] = useState('');
    const [pwdcheck,SetPwdcheck] = useState('');
    const [bankname,SetBankname] = useState('');
    const [bankserial,SetBankserial] = useState('');
    const [pic,SetPic] = useState('');
    const [pwdfail,SetPwdfail] = useState(false);
    const [LogFail,SetLogFail] = useState('');

    const toastId = useRef(null);

    //Open register form
    const btnregister = () => {
        const wrapper = document.querySelector('.wrapper');
        wrapper.classList.add('active');
    }

    //Open login form 
    const btnlogin = () => {
        const wrapper = document.querySelector('.wrapper');
        wrapper.classList.remove('active');
    }

    //Close both login and register form
    const btnLogRegisout = () => {
        const wrapper = document.querySelector('.wrapper');
        wrapper.classList.remove('open');
    }

    const Regis =(event)=> {

        event.preventDefault();

        if(pwd===pwdcheck) {

            // Display a loading alert
            const loadingAlert = Swal.fire({
                icon: 'warning',
                title: 'อยู่ในระหว่างดำเนินการ...',
                allowEscapeKey: false,
                allowOutsideClick: false,
            });

            //Create form data for send to node js
            const formData = new FormData();
            formData.append('name', name);
            formData.append('surname',surname);
            formData.append('username',username);
            formData.append('birthdate',birthdate);
            formData.append('email',email);
            formData.append('pwd',pwd);
            formData.append('pic',pic);

            //Check if user is insert bank name and bank serial or not
            if(bankname==='' && bankserial==='') {
                formData.append('bankname','null');
                formData.append('bankserial','null');
            } else {
                formData.append('bankname',bankname);
                formData.append('bankserial',bankserial);
            }
            
            //send register value through api to node js
            axios.post(`${backend}Regis`, formData).then((response)=> {

                //Close loading alert
                loadingAlert.close();

                if(response.data.status === 'ok') {
                    Swal.fire({
                        icon: 'success',
                        title: 'ดำเนินรายการสำเร็จ!',
                        text: 'สร้างบัญชีใหม่สำเร็จแล้ว',
                        confirmButtonColor: '#1ec7fd',
                        confirmButtonText: 'ตกลง'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            btnlogin();
                        }
                    });

                    //Reset value register form to default
                    SetName('');
                    SetSurname('');
                    SetUsername('');
                    SetBirthdate('');
                    SetEmail('');
                    SetPwd('');
                    SetPwdcheck('');
                    SetBankname('');
                    SetBankserial('');
                    SetPic('');
                    SetPwdfail(false);

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาดขึ้น',
                        text: 'ไม่สามารถสร้างบัญชีขึ้นมาใหม่ได้',
                        confirmButtonColor: '#1ec7fd',
                        confirmButtonText: 'ตกลง'
                    });
                }
            });

        } else {
            SetPwdfail(true);
            SetPwdcheck('');
        }
    }

    const Login =(event)=> {

        event.preventDefault();

        axios.post(`${backend}Login`,{user: logname,password: logpwd}).then((response)=> {
            
            toastId.current = toast.loading("กำลังดำเนินการ", {
                position: "bottom-center",
                autoClose: false,
                closeButton: false,
                showCancelButton: false,
                showConfirmButton: false
            });

            if(response.data.status === 'ok') {
                toast.update(toastId.current, {
                    render: `ล็อกอินเข้าสู่ระบบแล้ว`,
                    type: "success",
                    isLoading: false,
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",  
                });

                //Set token and in web local storage
                localStorage.setItem('token', JSON.stringify(response.data.token));

                //Check if user status number is 2 or not
                if(response.data.userstatus === 2 || response.data.userstatus === 3) {
                    localStorage.setItem('status', 'admin');
                    sessionStorage.setItem("UserStatus","admin");
                    btnLogRegisout();
                    navigate("/admin");
                } else {
                    btnLogRegisout();
                    sessionStorage.setItem("UserStatus","reader");
                    window.location.reload(false);
                }

                SetLogFail('');
                SetLogname('');
                SetLogpwd('');

            } else if(response.data.status === 'NonUser') {
                toast.dismiss(toastId.current);
                SetLogFail('ไม่มีชื่อผู้ใช้งานในระบบ');
                SetLogname('');
                SetLogpwd('');
            } else if(response.data.status === 'WrongPwd') {
                toast.dismiss(toastId.current);
                SetLogFail('รหัสผ่านไม่ถูกต้อง');
                SetLogpwd('');
            } else {
                toast.dismiss(toastId.current);
                SetLogFail('ไม่สามารถเข้าสู่ระบบได้');
                SetLogname('');
                SetLogpwd('');
            }
        });
    }
    
    return(
        <>
            <div className="wrapper">
                <button className="close-icon" onClick={btnLogRegisout}>
                    <Icon2.AiOutlineClose />
                </button>
                <div className="form-box login">
                    <h2>ล็อกอิน</h2>
                    <form onSubmit={Login}>
                        <div className="input-box">
                            <span>
                                <Icon.MdEmail />
                            </span>
                            <input type="text" id="user" placeholder="ชื่อผู้ใช้งาน" value={logname} onChange={(e)=>SetLogname(e.target.value)} pattern="[A-Za-z0-9ก-๛\s]+" title="กรุณาใส่ชื่อที่เป็นตัวอักษรหรือตัวเลข" required></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdPassword />
                            </span>
                            <input type="password" id="password" placeholder="รหัสผ่าน" value={logpwd} onChange={(e)=>SetLogpwd(e.target.value)} pattern="[A-Za-z0-9]\S+" title="กรุณาใส่รหัสที่เป็นตัวอักษรหรือตัวเลข" required></input>
                        </div>
                        {LogFail!=='' ? <p className="login-alert">{LogFail}</p> : ''}
                        <button type="submit" className="btn-login">เข้าสู่ระบบ</button>
                        <div className="register-link">
                            <p>ยังไม่เคยสมัครเป็นสมาชิก? 
                                <button onClick={btnregister}>สมัครบัญชีใหม่</button>
                            </p>
                        </div>
                    </form>
                </div>
                <div className="form-box register">
                    <h2>สมัครบัญชีใหม่</h2>
                    <form onSubmit={Regis}>
                        <div className="input-box">
                            <span>
                                <Icon.MdDriveFileRenameOutline />
                            </span>
                            <input type="text" id="loginname" placeholder="ชื่อ" value={name} onChange={(e)=>SetName(e.target.value)} pattern="[A-Za-zก-๏]\S{1,30}" title="กรุณาใส่ชื่อที่เป็นตัวอักษรไม่เกิน 30 ตัว" required></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdDriveFileRenameOutline />
                            </span>
                            <input type="text" id="regsurname" placeholder="นามกสุล" value={surname} onChange={(e)=>SetSurname(e.target.value)} pattern="[A-Za-zก-๏]\S{1,30}" title="กรุณาใส่นามสกุลที่เป็นตัวอักษรไม่เกิน 30 ตัว" required></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon2.AiOutlineUser />
                            </span>
                            <input type="text" id="regusername" placeholder="ชื่อผู้ใช้งาน" value={username} onChange={(e)=>SetUsername(e.target.value)} pattern="^\S.*[A-Za-z0-9ก-๛]{2,20}" title="กรุณาใส่ชื่อผู้ใช้งานที่เป็นตัวอักษรหรือตัวเลข 3-20 ตัว" required ></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon3.FaBirthdayCake />
                            </span>
                            <input type="date" id="regbirthdate" placeholder="dd-mm-yyyy" value={birthdate} onChange={(e)=>SetBirthdate(e.target.value)} required></input>
                            <div className="title-birthdate"><p>วันเกิด</p></div>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdEmail />
                            </span>
                            <input type="email" id="regemail" placeholder="อีเมล" value={email} onChange={(e)=>SetEmail(e.target.value)} pattern="\S+" required></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdPassword />
                            </span>
                            <input type="password" id="regpassword" placeholder="รหัสผ่าน" value={pwd} onChange={(e)=>SetPwd(e.target.value)} pattern="[A-Za-z0-9]\S{5,20}" title="กรุณาใส่รหัสผ่านที่เป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 6-20 ตัว" required></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdPassword />
                            </span>
                            <input type="password" id="regcheckpassword" placeholder="ยืนยันรหัสผ่าน" value={pwdcheck} onChange={(e)=>SetPwdcheck(e.target.value)} pattern="\S+" required></input>
                            {pwdfail!==false ? <div className="title-pwdcheck"><p>*รหัสผ่านผิดกรุณาใส่รหัสผ่านยืนยันใหม่</p></div> : ''}
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon2.AiTwotoneBank />
                            </span>
                            <input type="text" id="regbankname" placeholder="ชื่อธนาคาร" value={bankname} onChange={(e)=>SetBankname(e.target.value)} pattern="\S+"></input>
                            <p className="bank name">*ใส่ในกรณีที่ต้องการวางขายหนังหรือเปิดรับเงินโดเนท</p>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon4.RiBankCardFill />
                            </span>
                            <input type="text" id="regbankserial" value={bankserial} onChange={(e)=>SetBankserial(e.target.value)} placeholder="เลขบัญชี"></input>
                            <p className="bank serial">*ใส่ในกรณีที่ต้องการวางขายหนังหรือเปิดรับเงินโดเนท</p>
                        </div>
                        <div className="input-box pic">
                            <span>
                                <Icon5.ImFilePicture />
                            </span>
                            <label className="label-profile" htmlFor="pic-user">อัปโหลดภาพโปรไฟล์ตัวเอง</label>
                            <input type="file" id="pic-user" onChange={(e)=>{SetPic(e.target.files[0])}} accept="image/png,image/jpeg"></input>
                        </div>
                        <button type="submit" className="btn-login">สมัครบัญชี</button>
                        <div className="login-link">
                            <p>มีบัญชีที่เคยสมัครเป็นสมาชิกแล้ว? 
                                <button onClick={btnlogin}>ล็อกอินเข้าสู่ระบบ</button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default LogRegis