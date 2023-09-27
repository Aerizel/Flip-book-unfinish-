import { useContext,useState } from "react";
import "../Style/AddAdmin.css";
import { apiContext } from "../..";
import axios from "axios";
import * as Icon from 'react-icons/md';
import * as Icon2 from 'react-icons/ai';
import * as Icon3 from 'react-icons/fa';
import * as Icon5 from 'react-icons/im';

export default function AddAdmin() {

    const backend = useContext(apiContext);

    const [name, SetName] = useState('');
    const [surname, SetSurname] = useState('');
    const [username, SetUsername] = useState('');
    const [birthdate, SetBirthdate] = useState('');
    const [email, SetEmail] = useState('');
    const [pwd, SetPwd] = useState('');
    const [pwdcheck, SetPwdcheck] = useState('');
    const [pic, SetPic] = useState('');
    const [pwdfail, SetPwdfail] = useState(false);

    function Regis(event) {

        event.preventDefault();

        if (pwd === pwdcheck) {
            //Create form data for send to node js
            const formData = new FormData();
            formData.append('name', name);
            formData.append('surname', surname);
            formData.append('username', username);
            formData.append('birthdate', birthdate);
            formData.append('email', email);
            formData.append('pwd', pwd);
            formData.append('pic', pic);


            //send register value through api to node js
            axios.post(`${backend}AddAdmin`, formData).then((response) => {
                if(response.data.status==='ok') {
                    console.log("Add admin complete.");
                } else {
                    console.log("Add admin fail.");
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
            SetPic('');
            SetPwdfail(false);
        } else {
            SetPwdfail(true);
            SetPwdcheck('');
        }
    }

    return (
        <>
            <div className="add-admin">
                <h1>เพิ่มผู้ดูแลระบบ</h1>
                <div className="add-admin-form">
                    <form onSubmit={Regis}>
                        <div className="input-box name">
                            <span>
                                <Icon.MdDriveFileRenameOutline />
                            </span>
                            <input type="text" id="loginname" placeholder="ชื่อ" value={name} onChange={(e) => SetName(e.target.value)} pattern="^\S.*[A-Za-zก-๏0-9]{1,31}" title="กรุณาใส่ชื่อที่เป็นตัวอักษรหรือตัวเลขไม่เกิน 30 ตัว และห้ามเว้นช่องหน้าสุด" required autoComplete="off"></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdDriveFileRenameOutline />
                            </span>
                            <input type="text" id="regsurname" placeholder="นามกสุล" value={surname} onChange={(e) => SetSurname(e.target.value)} pattern="^\S.*[A-Za-zก-๏0-9]{1,31}" title="กรุณาใส่นามสกุลที่เป็นตัวอักษรไม่เกิน 30 ตัว และห้ามเว้นช่องหน้าสุด" required></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon2.AiOutlineUser />
                            </span>
                            <input type="text" id="regusername" placeholder="ชื่อผู้ใช้งาน" value={username} onChange={(e) => SetUsername(e.target.value)} pattern="^\S.*[A-Za-z0-9ก-๛]{2,20}" title="กรุณาใส่ชื่อผู้ใช้งานที่เป็นตัวอักษรหรือตัวเลข 3-20 ตัว" required ></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon3.FaBirthdayCake />
                            </span>
                            <input type="date" id="regbirthdate" placeholder="dd-mm-yyyy" value={birthdate} onChange={(e) => SetBirthdate(e.target.value)} required></input>
                            <div className="title-birthdate"><p>วันเกิด</p></div>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdEmail />
                            </span>
                            <input type="email" id="regemail" placeholder="อีเมล" value={email} onChange={(e) => SetEmail(e.target.value)} pattern="\S+" required></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdPassword />
                            </span>
                            <input type="password" id="regpassword" placeholder="รหัสผ่าน" value={pwd} onChange={(e) => SetPwd(e.target.value)} pattern="[A-Za-z0-9]\S{5,20}" title="กรุณาใส่รหัสผ่านที่เป็นตัวอักษรภาษาอังกฤษหรือตัวเลข 6-20 ตัว" required></input>
                        </div>
                        <div className="input-box">
                            <span>
                                <Icon.MdPassword />
                            </span>
                            <input type="password" id="regcheckpassword" placeholder="ยืนยันรหัสผ่าน" value={pwdcheck} onChange={(e) => SetPwdcheck(e.target.value)} pattern="\S+" required></input>
                            {pwdfail !== false ? <div className="title-pwdcheck"><p>*รหัสผ่านผิดกรุณาใส่รหัสผ่านยืนยันใหม่</p></div> : ''}
                        </div>
                        <div className="input-box pic">
                            <span>
                                <Icon5.ImFilePicture />
                            </span>
                            <label className="label-profile" htmlFor="pic-user">อัปโหลดภาพโปรไฟล์</label>
                            <input type="file" id="pic-user" onChange={(e) => { SetPic(e.target.files[0]) }} accept="image/png,image/jpeg"></input>
                        </div>
                        <button type="submit" className="btn-login">เพิ่มเป็นผู้ดูแลระบบ</button>
                    </form>
                </div>
            </div>
        </>
    );
}