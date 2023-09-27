import { useContext, useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import "../Styles/ViewSellBook.css";
import "../Styles/ViewSellBook.css";
import { apiContext } from "../..";
import * as Icon from "react-icons/tb";
import * as Icon2 from "react-icons/io";
import * as Icon3 from "react-icons/md";
import * as Icon4 from "react-icons/gi";
import * as Icon5 from "react-icons/bi"

export default function ViewBookSell() {

    const backend = useContext(apiContext);

    const navigate = useNavigate();

    const [userEmail, SetUserEmail] = useState('');

    //Edit input status
    const [editBookname, SetEditBookname] = useState(false);
    const [editbookType, SetEditBookType] = useState(false);
    const [editwriter, SetEditWriter] = useState(false);
    const [editartist, SetEditAritst] = useState(false);
    const [edittranslator, SetEditTraslator] = useState(false);
    const [editdesc, SetEditDesc] = useState(false);
    const [editbookPicture, SetEditBookPicture] = useState(false);
    const [editPrice, SetEditPrice] = useState(false);
    const [editage, SetEditAge] = useState(false);
    const [cancelSellApprove, SetCancelSellApprove] = useState(false);
    const [sellRequest, SetSellRequest] = useState(false);
    const [deleteBook, SetDeleteBook] = useState(false);
    const [uploadChapter, SetUploadChapter] = useState(false);
    const [editChapter, SetEditChapter] = useState(false);
    const [deletechapter, SetDeleteChapter] = useState(false);

    //Display value
    const [bookID, SetBookID] = useState(0);
    const [bookname, SetBookname] = useState('');
    const [bookType, SetBookType] = useState('');
    const [writer, SetWriter] = useState('');
    const [artist, SetAritst] = useState('');
    const [translator, SetTraslator] = useState('');
    const [desc, SetDesc] = useState('');
    const [bookPicture, SetBookPicture] = useState('');
    const [age, SetAge] = useState(0);
    const [status, SetStatus] = useState('');
    const [statusTxt,SetStatusTxt] = useState('');
    const [message,SetMessage] = useState('');
    const [price, SetPrice] = useState(0);
    const [nextEp, SetNextEp] = useState(0);
    const [chID, SetChID] = useState(0);
    const [file, SetFile] = useState('');
    const [PictureLocate, SetPictureLocate] = useState('');
    const [chapter, SetChapter] = useState([]);
    const [deleteThisChapter, SetDeleteThisChapter] = useState(0);

    //New input value
    const [newBookname, SetNewBookname] = useState('');
    const [newbookType, SetNewBookType] = useState('');
    const [newwriter, SetNewWriter] = useState('');
    const [newartist, SetNewAritst] = useState('');
    const [newtranslator, SetNewTraslator] = useState('');
    const [newdesc, SetNewDesc] = useState('');
    const [newbookPicture, SetNewBookPicture] = useState('');
    const [newprice, SetNewPrice] = useState('');
    const [newage, SetNewAge] = useState('');
    const [password, SetPassword] = useState('');
    const [pwdWrong, SetPwdWrong] = useState(false);
    const [chapterName, SetChapterName] = useState('');
    const [oldChaptername, SetOldChapterName] = useState('');
    const [content, SetContent] = useState('');
    const [inputNull, SetInputNull] = useState(false);
    const [numUnUnique, SetNumUnUnique] = useState(false);

    const preventReload = useRef(false);
    const toastId = useRef(null);

    //Receive book id value from main page
    const location = useLocation();

    useEffect(() => {

        if (preventReload.current !== true) {

            let bookID = 0;
            bookID = location.state?.bookID;
            SetBookID(bookID);
            SetUserEmail(location.state?.userEmail);

            axios.post(`${backend}GetEditBook`, { bookID: bookID }).then((response) => {

                if (response.data.status === 'ok') {
                    const bookProfileTxt = response.data.bookProfile;
                    SetBookname(bookProfileTxt.bookname);
                    SetBookType(bookProfileTxt.typename);
                    SetWriter(bookProfileTxt.writer);
                    SetAritst(bookProfileTxt.artist);
                    SetTraslator(bookProfileTxt.translator);
                    SetDesc(bookProfileTxt.description);
                    SetPrice(bookProfileTxt.price);
                    SetStatus(bookProfileTxt.status);
                    SetMessage(bookProfileTxt.message);
                    SetBookPicture(response.data.picURL);
                    SetStatusTxt(response.data.bookStatus);
                    SetAge(response.data.ageTxt);
                    SetChapter(response.data.bookContent);
                } else {
                    console.log('Can not get book detail approve');
                }

            });
        }

    }, [backend, SetBookID, location.state?.bookID, location.state?.userEmail]);

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
    const EditBookDB = (props) => {

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}EditBook`, {
            column: props.column,
            value: props.value,
            bookID: bookID
        }).then((response) => {
            if (response.data.status === 'ok') {
                toast.update(toastId.current, {
                    render: `แก้ไขข้อมูลหนังสือเรียบร้อยแล้ว`,
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

                if (props.column === 'typeID') { SetBookType(response.data.newvalue) };
                if (props.column === 'age_restrict') { SetAge(response.data.newvalue) };
            } else {
                toast.update(toastId.current, {
                    render: "แก้ไขข้อมูลหนังสือไม่สำเร็จ",
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
                console.log(response.data.message);
            }
        });
    }

    //Submit form
    const ChangeBookPicture = (event) => {
        event.preventDefault();

        //Create form data for sending to node js
        const formData = new FormData();
        formData.append('bookID', bookID);
        formData.append('bookcover', newbookPicture);
        formData.append('oldbookcover', PictureLocate);

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}EditBookPicture`, formData).then((response) => {
            if (response.data.status === 'ok') {
                toast.update(toastId.current, {
                    render: `แก้ไขรูปภาพปกหนังสือเรียบร้อยแล้ว`,
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
                SetBookPicture(response.data.url);
                SetPictureLocate(response.data.file);
            } else {
                toast.update(toastId.current, {
                    render: "แก้ไขรูปภาพปกหนังสือไม่สำเร็จ",
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

        SetNewBookPicture('');
        SetEditBookPicture(false);
    }

    const ChangeBookname = (event) => {
        event.preventDefault();
        EditBookDB({ column: 'bookname', value: newBookname });
        SetBookname(newBookname);
        SetNewBookname('');
        SetEditBookname(false);
    }

    const ChangeBookType = (event) => {
        event.preventDefault();
        EditBookDB({ column: 'typeID', value: newbookType });
        SetBookType(newbookType);
        SetNewBookType('');
        SetEditBookType(false);
    }

    const ChangeAuthor = (event) => {
        event.preventDefault();
        EditBookDB({ column: 'writer', value: newwriter });
        SetWriter(newwriter);
        SetNewWriter('');
        SetEditWriter(false);
    }

    const ChangeArtist = (event) => {
        event.preventDefault();
        EditBookDB({ column: 'artist', value: newartist });
        SetAritst(newartist);
        SetNewAritst('');
        SetEditAritst(false);
    }

    const ChangeTranslator = (event) => {
        event.preventDefault();
        EditBookDB({ column: 'translator', value: newtranslator });
        SetTraslator(newtranslator);
        SetNewTraslator('');
        SetEditTraslator(false);
    }

    const ChangePrice = (event) => {
        event.preventDefault();
        EditBookDB({ column: 'price', value: newprice });
        SetPrice(newprice);
        SetNewPrice(0);
        SetEditPrice(false);
    }

    const ChangeAge = (event) => {
        event.preventDefault();
        EditBookDB({ column: 'age_restrict', value: newage });
        SetAge(newage);
        SetNewAge('');
        SetEditAge(false);
    }

    const CancelRequestForSell = async (event) => {
        event.preventDefault();

        const checkStatus = await CheckPassword();

        if (checkStatus === 'ok') {

            // Display a loading alert
            const loadingAlert = Swal.fire({
                icon: 'warning',
                title: 'อยู่ในระหว่างดำเนินการ...',
                allowEscapeKey: false,
                allowOutsideClick: false,
            });

            axios.post(`${backend}CancelRequestForSell`, { bookID: bookID }).then((response) => {

                //Close loading alert
                loadingAlert.close();

                if (response.data.status === "ok") {
                    Swal.fire({
                        icon: 'success',
                        title: 'ดำเนินรายการสำเร็จ!',
                        text: `ยกเลิกการขอวางขายหนังสือเรียบร้อยแล้ว`,
                        confirmButtonColor: '#1ec7fd',
                        confirmButtonText: 'ตกลง'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.reload(false);
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาดขึ้น',
                        text: 'ไม่สามารถยกเลิกการขอวางขายหนังสือได้',
                        confirmButtonColor: '#1ec7fd',
                        confirmButtonText: 'ตกลง'
                    });
                }
            });

            SetPwdWrong(false);
            SetPassword('');
            SetCancelSellApprove(false);
        } else {
            SetPwdWrong(true);
            SetPassword('');
        }
    }

    const RequestForSell = async (event) => {
        event.preventDefault();

        const checkStatus = await CheckPassword();

        if (checkStatus === 'ok') {

            // Display a loading alert
            const loadingAlert = Swal.fire({
                icon: 'warning',
                title: 'อยู่ในระหว่างดำเนินการ...',
                allowEscapeKey: false,
                allowOutsideClick: false,
            });

            axios.post(`${backend}RequestForSell`, { bookID: bookID }).then((response) => {

                //Close loading alert
                loadingAlert.close();

                if (response.data.status === "ok") {
                    Swal.fire({
                        icon: 'success',
                        title: 'ดำเนินรายการสำเร็จ!',
                        text: `ส่งคำขอขอวางขายหนังสือเรียบร้อยแล้ว`,
                        confirmButtonColor: '#1ec7fd',
                        confirmButtonText: 'ตกลง'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.reload(false);
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาดขึ้น',
                        text: 'ไม่สามารถส่งคำขอขอวางขายหนังสือได้',
                        confirmButtonColor: '#1ec7fd',
                        confirmButtonText: 'ตกลง'
                    });
                }
            });

            SetPwdWrong(false);
            SetPassword('');
            SetSellRequest(false);
        } else {
            SetPwdWrong(true);
            SetPassword('');
        }
    }

    const DeleteBook = async (event) => {
        event.preventDefault();

        const checkStatus = await CheckPassword();

        if (checkStatus === 'ok') {

            toastId.current = toast.loading("กำลังดำเนินการ", {
                position: "bottom-center",
                autoClose: false,
                closeButton: false,
            });

            axios.post(`${backend}DeleteBook`, {
                bookID: bookID,
                oldpicture: PictureLocate
            }).then((response) => {
                if (response.data.status === "ok") {
                    toast.update(toastId.current, {
                        render: `ลบหนังสือออกจากระบบแล้ว`,
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
                    //console.log("Delete book complete");
                    navigate("/publisher/Managebook");
                } else {
                    toast.update(toastId.current, {
                        render: "ลบหนังสือออกจากระบบไม่สำเร็จ",
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
                    //console.log("Delete book fail. "+response.data.massage);
                }
            });

            SetPwdWrong(false);
            SetPassword('');
            SetDeleteBook(false);
        } else {
            SetPwdWrong(true);
            SetPassword('');
        }
    }

    const ChangeDesc = (event) => {
        event.preventDefault();
        EditBookDB({ column: 'description', value: newdesc });
        SetDesc(newdesc);
        SetNewDesc('');
        SetEditDesc(false);
    }

    function ViewMessage() {
        Swal.fire({
            title: 'สาเหตุที่ไม่อนุญาติให้วางขายหนังสือ',
            text: message,
            confirmButtonColor: '#1ec7fd',
            confirmButtonText: 'ตกลง'
        })
    }

    const UploadContent = (event) => {
        event.preventDefault();

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        //Check if there are episode number that repetitive to user input
        let check = true;
        let x = 0;
        while (check !== false && x < chapter.length) {
            if (chapter[x].chapter === parseInt(nextEp)) {
                check = false;
            }
            x++;
        }

        if (check) {
            //Create form data for sending to node js
            const formData = new FormData();
            formData.append('bookID', bookID);
            formData.append('chaptername', chapterName);
            formData.append('ep', nextEp);
            formData.append('bookcontent', content);

            axios.post(`${backend}UploadChapter`, formData).then((response) => {
                if (response.data.status === "ok") {
                    toast.update(toastId.current, {
                        render: `เพิ่มตอนหนังสือใหม่แล้ว`,
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
                    //console.log("Upload complete");
                    SetChapter(response.data.newvalue);
                    SetNextEp(response.data.nextep);
                } else {
                    toast.update(toastId.current, {
                        render: "เพิ่มตอนหนังสือใหม่ไม่สำเร็จ",
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
                    //console.log("Upload new chapter fail. "+response.data.massage);
                }
            });

            SetNumUnUnique(false);
            SetChapterName('');
            SetContent('');
            SetUploadChapter(false);
        } else {
            SetNumUnUnique(true);
        }

    }

    const EditContent = (event) => {
        event.preventDefault();

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        if (chapterName === oldChaptername && content === '') {
            SetInputNull(true);
        } else {
            //Create form data for sending to node js
            const formData = new FormData();
            formData.append('chID', chID);
            formData.append('bookID', bookID);
            formData.append('bookcontent', content);
            formData.append('oldfile', file);

            if (chapterName !== oldChaptername) {
                formData.append('chaptername', chapterName);
            } else {
                formData.append('chaptername', '');
            }

            toastId.current = toast.loading("กำลังดำเนินการ", {
                position: "bottom-center",
                autoClose: false,
                closeButton: false,
            });

            axios.post(`${backend}EditChapter`, formData).then((response) => {
                if (response.data.status === "ok") {
                    toast.update(toastId.current, {
                        render: `แก้ไขข้อมูลตอนหนังสือสำเร็จแล้ว`,
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
                    //console.log("Edit content complete");
                    SetChapter(response.data.newvalue);
                } else {
                    toast.update(toastId.current, {
                        render: "แก้ไขข้อมูลตอนหนังสือไม่สำเร็จ",
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
                    //console.log("Edit content complete fail. "+response.data.massage);
                }
            });

            SetInputNull(false);
            SetChID(0);
            SetFile('');
            SetChapterName('');
            SetContent('');
            SetEditChapter(false);
        }
    }

    const DeleteChapter = async (event) => {
        event.preventDefault();

        const checkStatus = await CheckPassword();

        if (checkStatus === 'ok') {

            toastId.current = toast.loading("กำลังดำเนินการ", {
                position: "bottom-center",
                autoClose: false,
                closeButton: false,
            });

            axios.post(`${backend}DeleteChapter`, {
                bookID: bookID,
                chID: chID,
                oldfile: file
            }).then((response) => {
                if (response.data.status === "ok") {
                    toast.update(toastId.current, {
                        render: `ลบตอนหนังสือออกจากระบบแล้ว`,
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
                    //console.log("Delete content complete");
                    SetChapter(response.data.newvalue);
                } else {
                    toast.update(toastId.current, {
                        render: "ลบตอนหนังสือออกจากระบบไม่สำเร็จ",
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
                    //console.log("Delete content fail. "+response.data.massage);
                }
            });

            SetPwdWrong(false);
            SetPassword('');
            SetDeleteThisChapter('');
            SetChID(0);
            SetFile('');
            SetDeleteChapter(false);
        } else {
            SetPwdWrong(true);
            SetPassword('');
        }

    }

    //Cancel form input
    const CancelBookPicture = (event) => {
        event.preventDefault();
        SetNewBookPicture('');
        SetEditBookPicture(false);
    }

    const CancelBookname = (event) => {
        event.preventDefault();
        SetNewBookname('');
        SetEditBookname(false);
    }

    const CancelBookType = (event) => {
        event.preventDefault();
        SetNewBookType('');
        SetEditBookType(false);
    }

    const CancelAuthor = (event) => {
        event.preventDefault();
        SetNewWriter('');
        SetEditWriter(false);
    }

    const CancelArtist = (event) => {
        event.preventDefault();
        SetNewAritst('');
        SetEditAritst(false);
    }

    const CancelTranslator = (event) => {
        event.preventDefault();
        SetNewTraslator('');
        SetEditTraslator(false);
    }

    const CancelPrice = (event) => {
        event.preventDefault();
        SetNewPrice(0);
        SetEditPrice(false);
    }

    const CancelAge = (event) => {
        event.preventDefault();
        SetNewAge('');
        SetEditAge(false);
    }

    const CancelDeleteBook = (event) => {
        event.preventDefault();
        SetPwdWrong(false);
        SetPassword('');
        SetDeleteBook(false);
    }

    const CancelBookApprove = (event) => {
        event.preventDefault();
        SetPwdWrong(false);
        SetPassword('');
        SetCancelSellApprove(false);
    }

    const CancelSellRequest = (event) => {
        event.preventDefault();
        SetPwdWrong(false);
        SetPassword('');
        SetSellRequest(false);
    }

    const CancelDesc = (event) => {
        event.preventDefault();
        SetNewDesc('');
        SetEditDesc(false);
    }

    const UploadCancel = (event) => {
        event.preventDefault();
        SetNumUnUnique(false);
        SetChapterName('');
        SetContent('');
        SetUploadChapter(false);
    }

    const CancelChapter = (event) => {
        event.preventDefault();
        SetInputNull(false);
        SetChID(0);
        SetFile('');
        SetChapterName('');
        SetContent('');
        SetEditChapter(false);
    }

    const CancelDeleteChapter = (event) => {
        event.preventDefault();
        SetPwdWrong(false);
        SetPassword('');
        SetDeleteThisChapter('');
        SetChID(0);
        SetFile('');
        SetDeleteChapter(false);
    }

    return (
        <>
            {status === 6 ?
                <>
                    {editbookPicture ?
                        <div className="edit-bookcover-bg">
                            <div className="edit-bookcover">
                                <h4>แก้ไขรูปภาพปกหนังสือ</h4>
                                <form onSubmit={ChangeBookPicture}>
                                    <div className="form-control-file">
                                        <label htmlFor="content">อัปโหลดรูปภาพใหม่ (ไฟล์ .png และ .jpeg เท่านั้น)</label>
                                        <input className="file" type="file" id="bookcover" onChange={(e) => { SetNewBookPicture(e.target.files[0]) }} accept="image/png,image/jpeg" required></input>
                                    </div>
                                    <div className="alert-box-btn">
                                        <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                        <button type="button" className="alert-box-btn cancel" onClick={CancelBookPicture}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        : ''}
                    {uploadChapter ?
                        <div className="bookedit-box-bg">
                            <div className="chapter-box upload">
                                <h4>อัปโหลดตอนหนังสือใหม่</h4>
                                <form onSubmit={UploadContent}>
                                    <div className="form-control ep">
                                        <label htmlFor="chaptername">ใส่หมายเลขตอน</label>
                                        <input type="number" id="nextep" placeholder="ใส่หมายเลข" value={nextEp} onChange={(e) => SetNextEp(e.target.value)} pattern="[0-9\s]" title="กรุณาใส่เฉพาะตัวเลขเท่านั้น" required />
                                    </div>
                                    <div className="form-control">
                                        <label htmlFor="chaptername">ใส่ชื่อตอน</label>
                                        <input type="text" id="chaptername" placeholder="ใส่ชื่อตอน" onChange={(e) => SetChapterName(e.target.value)} pattern="[A-Za-z0-9ก-๛\s]{1,21}" title="กรุณาใส่ชื่อตอนเป็นตัวอักษรหรือตัวเลขไม่เกิน 20 ตัว" required />
                                    </div>
                                    <div className="form-control-file">
                                        <label htmlFor="content">อัปโหลดไฟล์ (ไฟล์ .pdf เท่านั้น)</label>
                                        <input className="file" type="file" id="content" onChange={(e) => { SetContent(e.target.files[0]) }} accept=".pdf" required></input>
                                    </div>
                                    <div className="input-alert">
                                        {numUnUnique ? <p>หมายเลขตอนซ้ำกรุณาใช้หมายเลขตอนที่ยังไม่มี</p> : ''}
                                    </div>
                                    <div className="alert-box-btn">
                                        <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                        <button type="button" className="alert-box-btn cancel" onClick={UploadCancel}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        : ''}
                    {editChapter ?
                        <div className="bookedit-box-bg">
                            <div className="chapter-box edit">
                                <h4>แก้ไขตอนหนังสือ</h4>
                                <form onSubmit={EditContent}>
                                    <div className="form-control">
                                        <label htmlFor="chaptername">เปลี่ยนชื่อตอน</label>
                                        <input type="text" id="chaptername" placeholder="ใส่ชื่อตอน" value={chapterName} onChange={(e) => SetChapterName(e.target.value)} pattern="[A-Za-z0-9ก-๛\s]{1,21}" title="กรุณาใส่ชื่อตอนเป็นตัวอักษรหรือตัวเลขไม่เกิน 20 ตัว" required />
                                    </div>
                                    <div className="form-control-file">
                                        <label htmlFor="content">อัปโหลดไฟล์ใหม่ (ไฟล์ .pdf เท่านั้น)</label>
                                        <input className="file" type="file" id="content" onChange={(e) => { SetContent(e.target.files[0]) }} accept=".pdf" required></input>
                                    </div>
                                    <div className="input-alert">
                                        {inputNull ? <p>กรุณาใส่ข้อมูลที่ต้องการจะเปลี่ยนก่อนจะกดตกลง</p> : ''}
                                    </div>
                                    <div className="alert-box-btn">
                                        <button type="submit" className="alert-box-btn submit">ยืนยัน</button>
                                        <button type="button" className="alert-box-btn cancel" onClick={CancelChapter}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        : ''}
                    {deletechapter ?
                        <div className="bookedit-box-bg">
                            <div className="deletebook-confirm">
                                <div className="delete-massage-alert">
                                    <h5>ลบตอนที่ {deleteThisChapter} ออกจากระบบ</h5>
                                    <p>หลังจากลบตอนนี้ออกไปแล้วจะไม่สามารถเรียกคืนข้อมูลกลับมาได้อีกครั้ง</p>
                                </div>
                                <form onSubmit={DeleteChapter}>
                                    <div className="form-control delete">
                                        <label htmlFor="checkpassword">*ใส่รหัสผ่านเพื่อยืนยัน</label>
                                        <input type="password" id="checkpassword" value={password} placeholder="ใส่รหัสผ่าน" onChange={(e) => SetPassword(e.target.value)} pattern="[A-Za-zก-๏0-9]\S+" required />
                                    </div>
                                    <div className="pwd-alert">
                                        {pwdWrong ? <p>รหัสผ่านผิดกรุณาลองใหม่อีกครั้ง</p> : ''}
                                    </div>
                                    <div className="editbook-box-btn">
                                        <button type="submit" className="submit">ยืนยัน</button>
                                        <button type="button" className="cancel" onClick={CancelDeleteChapter}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        : ''}
                    {deleteBook ?
                        <div className="bookedit-box-bg">
                            <div className="deletebook-confirm">
                                <div className="delete-massage-alert">
                                    <h5>ลบหนังสือออกจากระบบ</h5>
                                    <p>หลังจากลบหนังสือแล้ว หนังสือของคุณจะถูกลบออกไปจากระบบอย่างถาวรและจะไม่สามารถเรียกคืนกลับมาได้อีกครั้ง</p>
                                </div>
                                <form onSubmit={DeleteBook}>
                                    <div className="form-control delete">
                                        <label htmlFor="checkpassword">*ใส่รหัสผ่านเพื่อยืนยัน</label>
                                        <input type="password" id="checkpassword" value={password} placeholder="ใส่รหัสผ่าน" onChange={(e) => SetPassword(e.target.value)} pattern="[A-Za-zก-๏0-9]\S+" required />
                                    </div>
                                    <div className="pwd-alert">
                                        {pwdWrong ? <p>รหัสผ่านผิดกรุณาลองใหม่อีกครั้ง</p> : ''}
                                    </div>
                                    <div className="editbook-box-btn">
                                        <button type="submit" className="submit">ยืนยัน</button>
                                        <button type="button" className="cancel" onClick={CancelDeleteBook}>ยกเลิก</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        : ''}
                    {sellRequest ?
                        <div className="approve-decide-box-bg">
                            <div className="approve-decide-confirm">
                                <div className="massage-alert">
                                    <h5>ส่งคำขอขอวางขายหนังสือใหม่</h5>
                                    <p>คุณต้องการที่จะส่งคำขอขอวางขายหนังสือใหม่ใช่หรือไม่?</p>
                                </div>
                                <div className="pwd">
                                    <label htmlFor="checkpassword">*ใส่รหัสผ่านเพื่อยืนยัน</label>
                                    <input type="password" id="checkpassword" value={password} placeholder="ใส่รหัสผ่าน" onChange={(e) => SetPassword(e.target.value)} pattern="[A-Za-zก-๏0-9]\S+" required />
                                </div>
                                <div className="pwd-alert">
                                    {pwdWrong ? <p>รหัสผ่านผิดกรุณาลองใหม่อีกครั้ง</p> : ''}
                                </div>
                                <div className="box-btn accept">
                                    <button type="button" className="submit" onClick={RequestForSell}>ยืนยัน</button>
                                    <button type="button" className="cancel" onClick={CancelSellRequest}>ยกเลิก</button>
                                </div>
                            </div>
                        </div>
                        : ''}
                    <div className="manage-detail">
                        <h1>แก้ไขข้อมูลหนังสือ</h1>
                        <div className="manage-detail-card">
                            <div className="book-profile">
                                <div className="editbook-img">
                                    <button type="button" onClick={() => SetEditBookPicture(true)}><Icon.TbEdit /> แก้ไขรูปภาพ</button>
                                    <img src={bookPicture} alt="book cover demo" />
                                </div>
                                <div className="detail-text">
                                    {editBookname ?
                                        <div className="editbook-group">
                                            <div className="editbook-detail">
                                                <form onSubmit={ChangeBookname}>
                                                    <div className="form-control">
                                                        <h4>เปลี่ยนชื่อหนังสือใหม่ </h4>
                                                        <input type="text" id="bookname" placeholder="ใส่ชื่อหนังสือ" onChange={(e) => SetNewBookname(e.target.value)} pattern="^\S.*[A-Za-zก-๏0-9]{1,31}" title="กรุณาใส่ชื่อหนังสือที่เป็นตัวอักษรหรือตัวเลขไม่เกิน 30 ตัว โดยห้ามเว้นช่องหน้าสุด" autoComplete="off" required />
                                                        <button type="submit" className="submit"><Icon4.GiCheckMark /></button>
                                                        <button type="button" className="cancel" onClick={CancelBookname}><Icon3.MdClose /></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div> :
                                        <div className="editbook-group">
                                            <div className="text-group title">
                                                <h2>{bookname}</h2>
                                                <button type="button" onClick={() => SetEditBookname(true)}><Icon.TbEdit /> แก้ไข</button>
                                            </div>
                                        </div>
                                    }
                                    {editbookType ?
                                        <div className="editbook-group">
                                            <div className="editbook-detail">
                                                <form onSubmit={ChangeBookType}>
                                                    <div className="form-control">
                                                        <h4>เปลี่ยนประเภทของหนังสือใหม่ </h4>
                                                        <select id="BookType" onChange={(e) => SetNewBookType(e.target.value)} required>
                                                            <option value="">-เลือกประเภทของหนังสือ-</option>
                                                            <option value="1">นิยายและวรรณกรรม</option>
                                                            <option value="2">วิทยาการและเทคโนโลยี</option>
                                                            <option value="3">ประวัติศาสตร์และวัฒนธรรม</option>
                                                            <option value="4">การศึกษาและการเรียนรู้</option>
                                                            <option value="5">ธุรกิจและการเงิน</option>
                                                            <option value="6">สุขภาพและการดูแลรักษา</option>
                                                            <option value="7">ศาสนาและปรัชญา</option>
                                                        </select>
                                                        <button type="submit" className="submit"><Icon4.GiCheckMark /></button>
                                                        <button type="button" className="cancel" onClick={CancelBookType}><Icon3.MdClose /></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div> :
                                        <div className="editbook-group">
                                            <div className="text-group detail">
                                                <p>หมวดหมู่ : {bookType}</p>
                                                <button type="button" onClick={() => SetEditBookType(true)}><Icon.TbEdit /> แก้ไข</button>
                                            </div>
                                        </div>
                                    }
                                    {editwriter ?
                                        <div className="editbook-group">
                                            <div className="editbook-detail">
                                                <form onSubmit={ChangeAuthor}>
                                                    <div className="form-control">
                                                        <h4>เปลี่ยนชื่อนักเขียนใหม่ </h4>
                                                        <input type="text" id="author" placeholder="ใส่ชื่อนักเขียน" onChange={(e) => SetNewWriter(e.target.value)} pattern="^\S.*[A-Za-zก-๏]{1,51}" title="กรุณาใส่ชื่อนักเขียนที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" autoComplete="off" required />
                                                        <button type="submit" className="submit"><Icon4.GiCheckMark /></button>
                                                        <button type="button" className="cancel" onClick={CancelAuthor}><Icon3.MdClose /></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div> :
                                        <div className="editbook-group">
                                            <div className="text-group detail">
                                                <p>ผู้เขียน : {writer}</p>
                                                <button type="button" onClick={() => SetEditWriter(true)}><Icon.TbEdit /> แก้ไข</button>
                                            </div>
                                        </div>
                                    }
                                    {editartist ?
                                        <div className="editbook-group">
                                            <div className="editbook-detail">
                                                <form onSubmit={ChangeArtist}>
                                                    <div className="form-control">
                                                        <h4>{artist !== 'null' ? 'เปลี่ยนชื่อนักวาดใหม่' : 'เพิ่มชื่อนักวาดใหม่'}</h4>
                                                        <input type="text" id="artist" placeholder="ใส่ชื่อนักวาด" onChange={(e) => SetNewAritst(e.target.value)} pattern="^\S.*[A-Za-zก-๏]{1,51}" title="กรุณาใส่ชื่อนักวาดที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" autoComplete="off" required />
                                                        <button type="submit" className="submit"><Icon4.GiCheckMark /></button>
                                                        <button type="button" className="cancel" onClick={CancelArtist}><Icon3.MdClose /></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div> :
                                        <div className="editbook-group">
                                            <div className="text-group detail">
                                                <p>นักวาด : {artist !== 'null' ? artist : 'ไม่มีชื่อนักวาด'}</p>
                                                {artist !== 'null' ?
                                                    <button type="button" onClick={() => SetEditAritst(true)}><Icon.TbEdit /> แก้ไข</button>
                                                    : <button className="button-edit" type="button" onClick={() => SetEditAritst(true)}><Icon2.IoIosAddCircleOutline /> เพิ่มใหม่</button>}
                                            </div>
                                        </div>
                                    }
                                    {edittranslator ?
                                        <div className="editbook-group">
                                            <div className="editbook-detail">
                                                <form onSubmit={ChangeTranslator}>
                                                    <div className="form-control">
                                                        <h4>{translator !== 'null' ? 'เปลี่ยนชื่อผู้แปลใหม่' : 'เพิ่มชื่อผู้แปลใหม่'}</h4>
                                                        <input type="text" id="translator" placeholder="ใส่ชื่อผู้แปล" onChange={(e) => SetNewTraslator(e.target.value)} pattern="^\S.*[A-Za-zก-๏]{1,51}" title="กรุณาใส่ชื่อผู้แปลที่เป็นตัวอักษรไม่เกิน 50 ตัว โดยห้ามเว้นช่องว่าง" autoComplete="off" required />
                                                        <button type="submit" className="submit"><Icon4.GiCheckMark /></button>
                                                        <button type="button" className="cancel" onClick={CancelTranslator}><Icon3.MdClose /></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div> :
                                        <div className="editbook-group">
                                            <div className="text-group detail">
                                                <p>ผู้แปล : {translator !== 'null' ? translator : 'ไม่มีชื่อผู้แปล'}</p>
                                                {translator !== 'null' ?
                                                    <button type="button" onClick={() => SetEditTraslator(true)}><Icon.TbEdit /> แก้ไข</button>
                                                    : <button className="button-edit" type="button" onClick={() => SetEditTraslator(true)}><Icon2.IoIosAddCircleOutline /> เพิ่มใหม่</button>}
                                            </div>
                                        </div>
                                    }
                                    {editage ?
                                        <div className="editbook-group">
                                            <div className="editbook-detail agerestrict">
                                                <form onSubmit={ChangeAge}>
                                                    <div className="form-control">
                                                        <h4>เปลี่ยนการจำกัดช่วงอายุที่จะเข้ามาอ่าน </h4>
                                                        <select id="AgeRestrict" onChange={(e) => SetNewAge(e.target.value)} required>
                                                            <option value="">-เลือกช่วงอายุของผู้ที่เข้ามาอ่าน-</option>
                                                            <option value="0">อ่านได้ทุกวัย</option>
                                                            <option value="6">ตั้งแต่ 6 ปีขึ้นไป</option>
                                                            <option value="12">ตั้งแต่ 12 ปีขึ้นไป</option>
                                                            <option value="18">ตั้งแต่ 18 ปีขึ้นไป</option>
                                                        </select>
                                                        <button type="submit" className="submit"><Icon4.GiCheckMark /></button>
                                                        <button type="button" className="cancel" onClick={CancelAge}><Icon3.MdClose /></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div> :
                                        <div className="editbook-group">
                                            <div className="text-group detail">
                                                <p>ช่วงอายุของผู้ที่เข้ามาอ่าน : {age}</p>
                                                <button type="button" onClick={() => SetEditAge(true)}><Icon.TbEdit /> แก้ไข</button>
                                            </div>
                                        </div>
                                    }
                                    {editPrice ?
                                        <div className="editbook-group">
                                            <div className="editbook-detail price">
                                                <form onSubmit={ChangePrice}>
                                                    <div className="form-control">
                                                        <h4>เปลี่ยนราคาหนังสือใหม่ </h4>
                                                        <input type="number" value={newprice} onChange={(e) => SetNewPrice(e.target.value)} min="0" max="1000" pattern="[0-9]" title="กรุณาใส่เป็นตัวเลขเท่านั้นที่ไม่เกิด 1000" required />
                                                        <button type="submit" className="submit"><Icon4.GiCheckMark /></button>
                                                        <button type="button" className="cancel" onClick={CancelPrice}><Icon3.MdClose /></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div> :
                                        <div className="editbook-group">
                                            <div className="text-group detail">
                                                <p>ราคาหนังสือ : {price} บาท</p>
                                                <button type="button" onClick={() => SetEditPrice(true)}><Icon.TbEdit /> แก้ไข</button>
                                            </div>
                                        </div>
                                    }
                                    {message ? 
                                        <div className="editbook-group">
                                            <div className="text-group">
                                                <p className="view">สถานะ: <b>{statusTxt}</b></p>
                                                <button className="button-view" type="button" onClick={ViewMessage}><Icon2.IoIosAlert />ดูลายละเอียด</button>
                                            </div>        
                                        </div>
                                    : ''}
                                    <div className="btn-choice">
                                        <button className="del-book" type="button" onClick={() => SetDeleteBook(true)}><Icon3.MdDelete />ลบหนังสือออกจากระบบ</button>
                                        <button className="request-for-sell" type="button" onClick={() => SetSellRequest(true)}><Icon3.MdScheduleSend />ขอวางขายหนังสืออีกรอบ</button>
                                    </div>
                                </div>
                            </div>
                            <div className="prologue">
                                {editdesc ?
                                    <div className="edit-prologue">
                                        <div className="text-group prologue-edit">
                                            <h3>ใส่ข้อมูลแนะนำหนังสืออีบุ๊ก</h3>
                                            <button type="submit" className="submit" onClick={ChangeDesc}><Icon4.GiCheckMark /></button>
                                            <button type="button" className="cancel" onClick={CancelDesc}><Icon3.MdClose /></button>
                                        </div>
                                        <textarea id="BookDesc" value={newdesc} onChange={(e) => SetNewDesc(e.target.value)} rows="5" cols="33" pattern="[a-zA-Zก-๏0-9]{1,501}" title="กรุณาใส่ข้อความที่เป็นตัวอักษรหรือตัวเลขเท่านั้นที่ไม่เกิด 500 ตัว" required></textarea>
                                    </div> :
                                    <div className="text-group prologue">
                                        <h3>บทนำ</h3>
                                        <button type="button" onClick={() => SetEditDesc(true)}><Icon.TbEdit /> แก้ไข</button>
                                    </div>
                                }
                                {!editdesc && desc !== 'null' ?
                                    <>
                                        <p className="cut-off-text">{desc}</p>
                                        <input className="expand-btn" type="checkbox" id="expand-text"/>
                                        <div className="seperate-line" />
                                    </>
                                    : <p className="cut-off-text">ไม่มีเนื้อหาบทนำ</p> 
                                }
                            </div>
                            <div className="chapter">
                                <button className="up-book" type="button" onClick={() => SetUploadChapter(true)}>อัปโหลดตอนเพิ่ม <span><Icon3.MdOutlineFileUpload /></span></button>
                                {chapter.length ?
                                    chapter.map((item, index) => (
                                        <div className="book-chapter" key={index}>
                                            <button type="button" onClick={() => navigate("/readercontent")}>
                                                <div className="ep">ตอนที่ {item.chapter}</div>
                                                <div className="ep-name">{item.title}</div>
                                                <div className="ep-date">{item.date}</div>
                                            </button>
                                            <div className="btn">
                                                <button className="btn-edit" type="button" onClick={() => { SetEditChapter(true); SetChapterName(item.title); SetOldChapterName(item.title); SetChID(item.chID); SetFile(item.file); }}><Icon.TbEdit /> แก้ไข</button>
                                                <button className="btn-del" type="button" onClick={() => { SetDeleteChapter(true); SetDeleteThisChapter(item.chapter); SetChID(item.chID); SetFile(item.file); }}><Icon3.MdDelete /> ลบ</button>
                                            </div>
                                        </div>
                                    ))
                                    : <h2>ยังไม่มีเนื้อหาที่อัปโหลด</h2>}
                            </div>
                        </div>
                    </div>
                </>
                :
                <>
                    {cancelSellApprove ?
                        <div className="approve-decide-box-bg">
                            <div className="approve-decide-confirm">
                                <div className="massage-alert">
                                    <h5>ยกเลิกการขอวางขายหนังสือ</h5>
                                    <p>คุณต้องการที่จะยกเลิกการขอวางขายหนังสือใช่หรือไม่?</p>
                                </div>
                                <div className="pwd">
                                    <label htmlFor="checkpassword">*ใส่รหัสผ่านเพื่อยืนยัน</label>
                                    <input type="password" id="checkpassword" value={password} placeholder="ใส่รหัสผ่าน" onChange={(e) => SetPassword(e.target.value)} pattern="[A-Za-zก-๏0-9]\S+" required />
                                </div>
                                <div className="pwd-alert">
                                    {pwdWrong ? <p>รหัสผ่านผิดกรุณาลองใหม่อีกครั้ง</p> : ''}
                                </div>
                                <div className="box-btn accept">
                                    <button type="button" className="submit" onClick={CancelRequestForSell}>ยืนยัน</button>
                                    <button type="button" className="cancel" onClick={CancelBookApprove}>ยกเลิก</button>
                                </div>
                            </div>
                        </div>
                    : ''}
                    <div className="ViewBookSell">
                        <h1>ตรวจสอบข้อมูลหนังสือ</h1>
                        <div className="ViewBookSell-card">
                            <div className="book-profile">
                                <div className="bookimg">
                                    <img src={bookPicture} alt="book cover demo" />
                                </div>
                                <div className="detail-text">
                                    <div className="book-group">
                                        <h2>{bookname}</h2>
                                    </div>
                                    <div className="book-group">
                                        <p>หมวดหมู่ : {bookType}</p>
                                    </div>
                                    <div className="book-group">
                                        <p>ผู้เขียน : {writer}</p>
                                    </div>
                                    <div className="book-group">
                                        <p>นักวาด : {artist !== 'null' ? artist : 'ไม่มีชื่อนักวาด'}</p>
                                    </div>
                                    <div className="book-group">
                                        <p>ผู้แปล : {translator !== 'null' ? translator : 'ไม่มีชื่อผู้แปล'}</p>
                                    </div>
                                    <div className="book-group">
                                        <p>สถานะ : {statusTxt}</p>
                                    </div>
                                    <div className="book-group">
                                        <p>ช่วงอายุของผู้ที่เข้ามาอ่าน : {age}</p>
                                    </div>
                                    <div className="book-group">
                                        <p>ราคาหนังสือ : {price}</p>
                                    </div>
                                    {status === 4 ? <button className="del-book" type="button" onClick={() => SetCancelSellApprove(true)}><Icon3.MdCancelScheduleSend />ยกเลิกขอวางขายหนังสือ</button> : ''}
                                    {status === 5 ? <button className="promotion-book" type="button"><Icon5.BiSolidDiscount /> ตั้งส่วนลดราคาหนังสือ</button> : ''}
                                </div>
                            </div>
                            <div className="prologue">
                                <h3>บทนำ</h3>
                                {desc !== 'null' ?
                                    <>
                                        <p className="cut-off-text">{desc}</p>
                                        <input className="expand-btn" type="checkbox" id="expand-text"/>
                                        <div className="seperate-line" />
                                    </>
                                    : <p className="cut-off-text">ไม่มีเนื้อหาบทนำ</p> 
                                }
                            </div>
                            <div className="chapter">
                                {chapter.map((item, index) => (
                                    <div className="book-chapter" key={index}>
                                        <button type="button" onClick={() => navigate("/readercontent")}>
                                            <div className="ep">ตอนที่ {item.chapter}</div>
                                            <div className="ep-name">{item.title}</div>
                                            <div className="ep-date">{item.date}</div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    );
}


