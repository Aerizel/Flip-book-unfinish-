import React, { useState, useContext, useEffect, useRef } from "react";
import axios from 'axios';
import "../Styles/UploadBook.css"
import Swal from 'sweetalert2';
import { apiContext } from "../..";
//import * as Icon from "react-icons/tb";

export default function UploadBook() {

    //Function form style control
    const [UploadOption, SetUploadOption] = useState('none');
    const ChangeToSell = () => {
        //Change form upload normal to form sell
        const UploadForm = document.querySelector('.upload-ebook');
        if (UploadOption === 'none') {
            UploadForm.classList.add('active');
        }
        UploadForm.classList.remove('normal');
        UploadForm.classList.add('sell');

        //Change button animation 
        const ButtonUpload = document.querySelector('.button-block-upload');
        const ButtonSell = document.querySelector('.button-block-sell');
        ButtonUpload.classList.remove('active');
        ButtonSell.classList.add('active');
        SetUploadOption("sell");

        //Show upload sell first when user click in first time
        const EbookForm = document.querySelector('.ebook-form');
        EbookForm.classList.add('active');
    }

    const ChangeToUpload = () => {
        //Change form sell normal to form upload
        const UploadForm = document.querySelector('.upload-ebook');
        if (UploadOption === 'none') {
            UploadForm.classList.add('active');
        }

        UploadForm.classList.add('normal');
        UploadForm.classList.remove('sell');

        //Change button animation 
        const ButtonUpload = document.querySelector('.button-block-upload');
        const ButtonSell = document.querySelector('.button-block-sell');
        ButtonUpload.classList.add('active');
        ButtonSell.classList.remove('active');
        SetUploadOption("upload");

        //Show upload sell first when user click in first time
        const EbookForm = document.querySelector('.ebook-form');
        EbookForm.classList.remove('active');
    }

    //Value upload e-book to server
    const [bookType, SetBookType] = useState(0);
    const [bookname, SetBookname] = useState('');
    const [writer, SetWriter] = useState('');
    const [artist, SetArtist] = useState('');
    const [translator, SetTraslator] = useState('');
    const [desc, SetDesc] = useState('');
    const [price, SetPrice] = useState(0);
    const [age, SetAge] = useState(0);
    const [bookcover, SetBookcover] = useState(null);
    const [pdfFile, SetPdfFile] = useState([]);
    const [pdfName, SetPdfName] = useState([]);
    const [status, SetStatus] = useState(0);

    const [userID, SetUserID] = useState(0);

    const [editEpisodeError,SetEditEpisodeError] = useState(false);
    const [editEpisode, SetEditEpisode] = useState(false);
    const [pdfNewIndex,SetPdfNewIndex] = useState(null);
    const [pdfSourceIndex, SetPdfSourceIndex] = useState(0);
    const [episodeName, SetEpisodeName] = useState('');
    const [newEpisodeName, SetNewEpisodeName] = useState('');

    const backend = useContext(apiContext);

    const reload = useRef(true);

    let decode = '';

    //Send token to node js to get user email from database 
    const token = JSON.parse(localStorage.getItem("token"));
    if (token !== '') {

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const bodyParameters = {
            key: "value"
        };

        axios.post(`${backend}CheckToken`,
            bodyParameters,
            config
        ).then((response) => {
            if (response.data.status === 'ok') {
                decode = response.data.decoded.email;
                Getiduser();
            } else {
                console.log('authen fail.');
            }
        });

        const Getiduser = () => {
            axios.post(`${backend}GetIDUser`, { email: decode }).then((response) => {
                if (response.data.status === 'ok') {
                    SetUserID(response.data.result);
                } else {
                    console.log("Get id user fail.");
                }
            });
        }

    } else {
        console.log('Token is null please login first.');
    }

    useEffect(() => {
        if (pdfFile.length) {
            //Change upload book sell form scale size in css when user is upload file
            const UploadCard = document.querySelector('.upload-ebook');
            const SpaceBottom = document.querySelector('.ebook-form');
            UploadCard.classList.add('pdf');
            SpaceBottom.classList.add('pdf');
        } else {
            //Change upload book sell to previous size when upload file is null
            const UploadCard = document.querySelector('.upload-ebook');
            const SpaceBottom = document.querySelector('.ebook-form');
            UploadCard.classList.remove('pdf');
            SpaceBottom.classList.remove('pdf');
            reload.current = true;
        }
    }, [pdfFile]);

    useEffect(()=>{
        if(reload.current && pdfFile.length) {
            console.log('set name title');
            //get pdf file name into new array
            let cutname = [];
            Object.values(pdfFile).forEach(val => {const name = val.name.split('.'); cutname.push(name[0]);});
            SetPdfName(cutname);
            reload.current = false;
        }
    }, [reload,pdfName,pdfFile]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files); // Convert FileList to an array
        SetPdfFile(files);
    };

    const EditEpisode = (event) => {
        event.preventDefault();
        
        if (pdfNewIndex===null && newEpisodeName==='') {
            SetEditEpisodeError(true);
        } else {

            if(pdfNewIndex!==null && newEpisodeName==='') {

                const fileArray = [...pdfFile];
                const nameArray = [...pdfName];

                //Back up old element before move into new index
                const backupFile = fileArray[pdfSourceIndex];
                const backupName = nameArray[pdfSourceIndex];

                //Change index of pdf file and pdf title name
                fileArray.splice(pdfSourceIndex, 1); // Remove the element from old index in pdfFile
                nameArray.splice(pdfSourceIndex, 1); // Remove the element from old index in pdfName
                fileArray.splice(pdfNewIndex, 0, backupFile); // Move element into new index
                nameArray.splice(pdfNewIndex, 0, backupName); // Move element into new index
                SetPdfFile(fileArray);
                SetPdfName(nameArray);
    
            } else if(pdfNewIndex!==null && newEpisodeName!=='') {

                const fileArray = [...pdfFile];
                const nameArray = [...pdfName];

                //Back up old element before move into new index
                const backupFile = fileArray[pdfSourceIndex];

                //Change pdf file index and replace new pdf title name
                fileArray.splice(pdfSourceIndex, 1); // Remove the element from old index in pdfFile
                nameArray.splice(pdfSourceIndex, 1); // Remove the element from old index in pdfName
                fileArray.splice(pdfNewIndex, 0, backupFile); // Move element into new index
                nameArray.splice(pdfNewIndex, 0, newEpisodeName); // Insert new element into new index
                SetPdfFile(fileArray);
                SetPdfName(nameArray);

            } else if(pdfNewIndex===null && newEpisodeName!=='') {

                //Change pdf title name
                const pdfArray = [...pdfName];
                pdfArray[pdfSourceIndex] = newEpisodeName;
                SetPdfName(pdfArray);

            }
    
            SetEditEpisode(false);
            SetPdfSourceIndex(0);
            SetPdfNewIndex(null);
            SetEpisodeName('');
            SetNewEpisodeName('');
        }
    }

    const CancelEditEpisode = (event) => {
        event.preventDefault();

        SetEditEpisode(false);
        SetPdfName([]);
        SetPdfSourceIndex(0);
        SetPdfNewIndex(null);
        SetEpisodeName('');
        SetNewEpisodeName('');
    }

    const Upbook = (event) => {

        event.preventDefault();

        // Display a loading alert
        const loadingAlert = Swal.fire({
            icon: 'warning',
            title: 'อยู่ในระหว่างดำเนินการ...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            showCancelButton: false,
            showConfirmButton: false
        });

        //Create form data for sending to node js
        const formData = new FormData();
        formData.append('userId', userID);
        formData.append('bookType', bookType);
        formData.append('bookname', bookname);
        formData.append('writer', writer);
        formData.append('age', age);
        formData.append('bookcover', bookcover);
        formData.append('status', status);

        //Check if user is insert these value or not
        if (artist === '') {
            formData.append('artist', 'null');
        } else {
            formData.append('artist', artist);
        }

        if (translator === '') {
            formData.append('translator', 'null');
        } else {
            formData.append('translator', translator);
        }

        if (desc === '') {
            formData.append('desc', 'null');
        } else {
            formData.append('desc', desc);
        }

        //send register value through api to node js
        axios.post(`${backend}Upbook`, formData).then((response) => {

            //Close loading alert
            loadingAlert.close();

            if (response.data.status === 'ok') {
                Swal.fire({
                    icon: 'success',
                    title: 'ดำเนินรายการสำเร็จ!',
                    text: 'อัปโหลดหนังสือสำเร็จแล้ว',
                    footer: 'กดเข้าไปดูรายการหนังสือที่อัปโหลดแล้ว',
                    confirmButtonColor: '#1ec7fd',
                    confirmButtonText: 'ตกลง'
                });
                //console.log('upload book complate.');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาดขึ้น',
                    text: 'ไม่สามารถอัปโหลดหนังสือได้',
                    confirmButtonColor: '#1ec7fd',
                    confirmButtonText: 'ตกลง'
                });
                //console.log('upload book fail.');
            }

        });

        //Reset value upload normal form to default
        SetBookType(0);
        SetBookname('');
        SetWriter('');
        SetArtist('');
        SetTraslator('');
        SetDesc('');
        SetAge(0);
        SetBookcover(null);
        SetStatus(0);

    }

    const Upbookforsell = (event) => {

        event.preventDefault();

        // Display a loading alert
        const loadingAlert = Swal.fire({
            icon: 'warning',
            title: 'อยู่ในระหว่างดำเนินการ...',
            allowEscapeKey: false,
            allowOutsideClick: false,
            showCancelButton: false,
            showConfirmButton: false
        });

        //console.log(req.body.userId,req.body.bookType,req.body.bookname,req.body.writer,req.body,req.body,req.body,req.body);

        //Create form data for sending to node js
        const formData = new FormData();
        formData.append('userId', userID);
        formData.append('bookType', bookType);
        formData.append('bookname', bookname);
        formData.append('writer', writer);
        formData.append('price', price);
        formData.append('age', age);
        formData.append('bookcover', bookcover);

        for (let i = 0; i < pdfFile.length; i++) {
            formData.append('pdf', pdfFile[i]);
            formData.append('pdfname', pdfName[i]);
        }

        //Check if user is insert these value or not
        if (artist === '') {
            formData.append('artist', 'null');
        } else {
            formData.append('artist', artist);
        }

        if (translator === '') {
            formData.append('translator', 'null');
        } else {
            formData.append('translator', translator);
        }

        if (desc === '') {
            formData.append('desc', 'null');
        } else {
            formData.append('desc', desc);
        }

        //send register value through api to node js
        axios.post(`${backend}UpBookForSell`, formData).then((response) => {

            //Close loading alert
            loadingAlert.close();

            if (response.data.status === 'ok') {
                Swal.fire({
                    icon: 'success',
                    title: 'ดำเนินรายการสำเร็จ!',
                    text: 'อัปโหลดหนังสือสำเร็จแล้ว',
                    footer: 'กดเข้าไปดูรายการหนังสือที่อัปโหลดแล้ว',
                    confirmButtonColor: '#1ec7fd',
                    confirmButtonText: 'ตกลง'
                });
                //console.log('upload book for sell complate.');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาดขึ้น',
                    text: 'ไม่สามารถอัปโหลดหนังสือได้',
                    confirmButtonColor: '#1ec7fd',
                    confirmButtonText: 'ตกลง'
                });
                //console.log('upload book for sell fail.');
            }

            //Reset value upload normal form to default
            SetBookType(0);
            SetBookname('');
            SetWriter('');
            SetArtist('');
            SetTraslator('');
            SetDesc('');
            SetAge(0);
            SetBookcover(null);
            SetPdfFile([]);
            SetPdfName([]);
        });
    }

    return (
        <>
            {editEpisode ?
                <div className="up-bookedit-name-bg">
                    <div className="up-bookedit-name-box">
                        <h4>แก้ไขชื่อตอนหนังสือที่ {pdfSourceIndex + 1}</h4>
                        <form>
                            <p>ชื่อตอนหนังสือเดิม : {episodeName}</p>
                            <div className="form-control">
                                <label htmlFor="ChangeEpisodeName">ใส่ชื่อตอน</label>
                                <input type="text" id="ChangeEpisodeName" placeholder="ใส่ชื่อตอน" onChange={(e) => SetNewEpisodeName(e.target.value)} pattern="[A-Za-z0-9ก-๛\s]{1,21}" title="กรุณาใส่ชื่อตอนเป็นตัวอักษรหรือตัวเลขไม่เกิน 20 ตัว" required />
                            </div>
                            <div className="form-control">
                                <label htmlFor="ChangeEpisodeIndex">เรียงลำดับตอนหนังสือใหม่</label>
                                <select id="ChangeEpisodeIndex" onChange={(e) => SetPdfNewIndex(e.target.value)}>
                                    <option value="">-เลือกลำดับตอนหนังสือ-</option>
                                    {pdfFile.map((file, index)=>{
                                        return(
                                            <option key={index} value={index}>ตอนที่ {index + 1}</option>    
                                        );
                                    })}
                                </select>
                            </div>
                            {editEpisodeError ? <p>กรุณาใส่หรือเลือกข้อมูลที่ต้องการจะเปลี่ยนแปลงในช่องเปลี่ยนชื่อหรือเลือกลำดับตอน</p> : ''}
                            <div className="alert-box-btn">
                                <button type="button" className="alert-box-btn submit" onClick={EditEpisode}>ยืนยัน</button>
                                <button type="button" className="alert-box-btn cancel" onClick={CancelEditEpisode}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
                : ''}
            <div className="upload-ebook">
                <h1>สร้างผลงานหนังสืออีบุ๊ก</h1>
                <div className="ebook-form">
                    <div className="select-option">
                        {UploadOption !== 'none' ? '' : <p>เลือกโหมดที่จะอัปโหลด</p>}
                    </div>
                    <div className="switch-mode">
                        <div className="button-block-upload">
                            <button type="button" onClick={ChangeToUpload}>อัปโหลดแบบทั่วไป</button>
                        </div>
                        <div className="button-block-sell">
                            <button type="button" onClick={ChangeToSell}>ขอวางขายหนังสือ</button>
                        </div>
                    </div>
                    <div className="attention">
                        <p>กรุณาใส่ข้อมูลในทุกช่องที่บนหัวข้อมีเครื่องหมาย *</p>
                    </div>
                    <div className="upload-form normal">
                        <form onSubmit={Upbook}>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="BookTitle">*ตั้งชื่อหนังสืออีบุ๊ก</label>
                                <input type="text" id="BookTitle" placeholder="ใส่ชื่อหนังสืออีบุ๊ก" value={bookname} onChange={(e) => SetBookname(e.target.value)} pattern="^\S.*[A-Za-zก-๏0-9]{1,31}" title="กรุณาใส่ชื่อหนังสือที่เป็นตัวอักษรหรือตัวเลขไม่เกิน 30 ตัว และห้ามเว้นช่องหน้าสุด" required autoComplete="off"></input>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="Author">*ชื่อผู้เขียน</label>
                                <input type="text" id="Author" placeholder="ใส่ชื่อผู้แต่ง" value={writer} onChange={(e) => SetWriter(e.target.value)} pattern="^\S.*[A-Za-zก-๏]{1,51}" title="กรุณาใส่ชื่อนักเขียนที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" required autoComplete="off"></input>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="Artist">ชื่อนักวาด</label>
                                <input type="text" id="Artist" placeholder="ใส่ชื่อนักวาด" value={artist} onChange={(e) => SetArtist(e.target.value)} pattern="^\S.*[A-Za-zก-๏]{1,51}" title="กรุณาใส่ชื่อนักวาดที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" autoComplete="off"></input>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="Translator">ชื่อผู้แปล</label>
                                <input type="text" id="Translator" placeholder="ใส่ชื่อผู้แปล" value={translator} onChange={(e) => SetTraslator(e.target.value)} pattern="^\S.*[A-Za-zก-๏]+{1,51}" title="กรุณาใส่ชื่อผู้แปลที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" autoComplete="off"></input>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="BookType">*ประเภทของหนังสือ</label>
                                <select id="BookType" onChange={(e) => SetBookType(e.target.value)} required>
                                    <option value="">-เลือกประเภทของหนังสือ-</option>
                                    <option value="1">นิยายและวรรณกรรม</option>
                                    <option value="2">วิทยาการและเทคโนโลยี</option>
                                    <option value="3">ประวัติศาสตร์และวัฒนธรรม</option>
                                    <option value="4">การศึกษาและการเรียนรู้</option>
                                    <option value="5">ธุรกิจและการเงิน</option>
                                    <option value="6">สุขภาพและการดูแลรักษา</option>
                                    <option value="7">ศาสนาและปรัชญา</option>
                                </select>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="AgeRestrict">*กำหนดช่วงอายุของผู้ที่เข้ามาอ่าน</label>
                                <select id="AgeRestrict" onChange={(e) => SetAge(e.target.value)} required>
                                    <option value="">-เลือกช่วงอายุของผู้ที่เข้ามาอ่าน-</option>
                                    <option value="0">อ่านได้ทุกวัย</option>
                                    <option value="6">ตั้งแต่ 6 ปีขึ้นไป</option>
                                    <option value="12">ตั้งแต่ 12 ปีขึ้นไป</option>
                                    <option value="18">ตั้งแต่ 18 ปีขึ้นไป</option>
                                </select>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="BookCover">*อัปโหลดภาพหน้าปกหนังสือ (ไฟล์ .png หรือ ไฟล์ .jpeg เท่านั้น)</label>
                                <input className="file" type="file" id="BookCover" onChange={(e) => { SetBookcover(e.target.files[0]) }} accept="image/png,image/jpeg" required></input>
                            </div>
                            <div className="input-box-up area">
                                <label className="up-label" htmlFor="BookDesc">แนะนำหนังสืออีบุ๊ก</label>
                                <textarea id="BookDesc" value={desc} onChange={(e) => SetDesc(e.target.value)} rows="4" cols="33" pattern="[a-zA-Zก-๏0-9]{1,501}" title="กรุณาใส่ข้อความที่เป็นตัวอักษรหรือตัวเลขเท่านั้นที่ไม่เกิด 500 ตัว"></textarea>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="BookStatus">*สถานะการเผยแพร่หนังสือ</label>
                                <select id="BookStatus" onChange={(e) => SetStatus(e.target.value)} required>
                                    <option value="">-เลือกสถานะการเผยแพร่หนังสือ-</option>
                                    <option value="2">เผยแพร่สาธารณะ</option>
                                    <option value="1">ไม่เป็นสาธารณะ</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-create-ebook">สร้างหนังสืออีบุ๊ก</button>
                        </form>
                    </div>
                    <div className={"upload-form sell"}>
                        <form onSubmit={Upbookforsell}>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="BookTitle">*ตั้งชื่อหนังสืออีบุ๊ก</label>
                                <input type="text" id="BookTitle" placeholder="ใส่ชื่อหนังสืออีบุ๊ก" value={bookname} onChange={(e) => SetBookname(e.target.value)} pattern="^\S.*[A-Za-zก-๏0-9]{1,31}" title="กรุณาใส่ชื่อหนังสือที่เป็นตัวอักษรหรือตัวเลขไม่เกิน 30 ตัว และห้ามเว้นช่องหน้าสุด" required autoComplete="off"></input>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="Author">*ชื่อผู้เขียน</label>
                                <input type="text" id="Author" placeholder="ใส่ชื่อผู้แต่ง" value={writer} onChange={(e) => SetWriter(e.target.value)} pattern="^\S.*[A-Za-zก-๏]{1,51}" title="กรุณาใส่ชื่อนักเขียนที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" required autoComplete="off"></input>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="Artist">ชื่อนักวาด</label>
                                <input type="text" id="Artist" placeholder="ใส่ชื่อนักวาด" value={artist} onChange={(e) => SetArtist(e.target.value)} pattern="^\S.*[A-Za-zก-๏]{1,51}" title="กรุณาใส่ชื่อนักวาดที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" autoComplete="off"></input>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="Translator">ชื่อผู้แปล</label>
                                <input type="text" id="Translator" placeholder="ใส่ชื่อผู้แปล" value={translator} onChange={(e) => SetTraslator(e.target.value)} pattern="^\S.*[A-Za-zก-๏]{1,51}" title="กรุณาใส่ชื่อผู้แปลที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" autoComplete="off"></input>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="BookType">*ประเภทของหนังสือ</label>
                                <select id="BookType" onChange={(e) => SetBookType(e.target.value)} required>
                                    <option value="">-เลือกประเภทของหนังสือ-</option>
                                    <option value="1">นิยายและวรรณกรรม</option>
                                    <option value="2">วิทยาการและเทคโนโลยี</option>
                                    <option value="3">ประวัติศาสตร์และวัฒนธรรม</option>
                                    <option value="4">การศึกษาและการเรียนรู้</option>
                                    <option value="5">ธุรกิจและการเงิน</option>
                                    <option value="6">สุขภาพและการดูแลรักษา</option>
                                    <option value="7">ศาสนาและปรัชญา</option>
                                </select>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="AgeRestrict">*กำหนดช่วงอายุของผู้ที่เข้ามาอ่าน</label>
                                <select id="AgeRestrict" onChange={(e) => SetAge(e.target.value)} required>
                                    <option value="">-เลือกช่วงอายุของผู้ที่เข้ามาอ่าน-</option>
                                    <option value="0">อ่านได้ทุกวัย</option>
                                    <option value="6">ตั้งแต่ 6 ปีขึ้นไป</option>
                                    <option value="12">ตั้งแต่ 12 ปีขึ้นไป</option>
                                    <option value="18">ตั้งแต่ 18 ปีขึ้นไป</option>
                                </select>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="BookCover">*อัปโหลดภาพหน้าปกหนังสือ (ไฟล์ .png หรือ ไฟล์ .jpeg เท่านั้น)</label>
                                <input className="file" type="file" id="BookCover" onChange={(e) => SetBookcover(e.target.files[0])} accept="image/png,image/jpeg" required></input>
                            </div>
                            <div className={`input-box-up ${pdfFile.length ? 'pdfdetail' : ''}`}>
                                <label className="up-label" htmlFor="BookContent">*อัปโหลดไฟล์เนื้อหาหนังสือ (สามารถอัปโหลดได้หลายไฟล์แต่ต้องเป็น .pdf เท่านั้น)</label>
                                <input className="file" type="file" id="BookContent" onChange={handleFileChange} accept=".pdf" multiple required></input>
                                {pdfFile.length ? <p>ชื่อของตอนหนังสือจะถูกตั้งตามชื่อของไฟล์ pdf โดยสามารถเปลี่ยนชื่อได้ผ่านตารางด้านล่าง</p> : ''}
                                {pdfFile.length && pdfName.length ?
                                    <div className="content-table">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <th>ตอนที่</th>
                                                    <th>ชื่อตอนของหนังสือ</th>
                                                    <th>แก้ไขชื่อตอน</th>
                                                </tr>
                                                {pdfName.map((value,index)=>{                                           
                                                    return( 
                                                        <tr key={index}>
                                                            <td>{index+1}</td>
                                                            <td>{value}</td>
                                                            <td><button type="button" onClick={()=>{SetEditEpisode(true); SetPdfSourceIndex(index); SetEpisodeName(value);}}>แก้ไข</button></td>
                                                        </tr>    
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    : ''}
                            </div>
                            <div className="input-box-up area">
                                <label className="up-label" htmlFor="BookDesc">แนะนำหนังสืออีบุ๊ก</label>
                                <textarea id="BookDesc" value={desc} onChange={(e) => SetDesc(e.target.value)} rows="4" cols="33" pattern="[a-zA-Zก-๏0-9]+{1,501}" title="กรุณาใส่ข้อความที่เป็นตัวอักษรหรือตัวเลขเท่านั้นที่ไม่เกิด 500 ตัว"></textarea>
                            </div>
                            <div className="input-box-up">
                                <label className="up-label" htmlFor="Price">*ราคาหนังสืออีบุ๊ก</label>
                                <input type="number" id="Price" value={price} onChange={(e) => SetPrice(e.target.value)} placeholder="ใส่ราคาหนังสืออีบุ๊ก" min="0" max="1000" pattern="[0-9]" title="กรุณาใส่เป็นตัวเลขเท่านั้นที่ไม่เกิด 1000" required></input>
                            </div>
                            <button type="submit" className="btn-create-ebook">ยืนคำร้องขอวางขายหนังสืออีบุ๊ก</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}