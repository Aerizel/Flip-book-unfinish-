import { useContext, useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../Style/BookDetailApprove.css";
import { apiContext } from "../..";
import * as Icon from "react-icons/md";
import * as Icon2 from "react-icons/gi";

export default function BookDetailApprove() {

    const backend = useContext(apiContext);

    const navigate = useNavigate();

    //Display value
    const [bookID, SetBookID] = useState(0);
    const [bookname, SetBookname] = useState('');
    const [bookType, SetBookType] = useState('');
    const [writer, SetWriter] = useState('');
    const [artist, SetAritst] = useState('');
    const [translator, SetTraslator] = useState('');
    const [desc, SetDesc] = useState('');
    const [bookPicture, SetBookPicture] = useState('');
    const [status, SetStatus] = useState('');
    const [age, SetAge] = useState('');
    const [price,SetPrice] = useState(0);
    /*const [chID, SetChID] = useState(0);
    const [file, SetFile] = useState('');*/
    const [chapter, SetChapter] = useState([]);

    const [acceptBook,SetAcceptBook] = useState(false);
    const [notAcceptBook,SetNotAcceptBook] = useState(false);
    const [notAcceptReason,SetNotAcceptReason] = useState('');

    const preventReload = useRef(false);
    const toastId = useRef(null);

    //Receive book id value from main page
    const location = useLocation();

    useEffect(() => {

        if (preventReload.current !== true) {

            let bookID = 0;
            bookID = location.state?.bookID;
            SetBookID(bookID);

            axios.post(`${backend}GetBookDetailApprove`, { bookID: bookID }).then((response) => {
                
                if (response.data.status === 'ok') {

                    const bookProfileTxt = response.data.bookProfile;

                    SetBookname(bookProfileTxt.bookname);
                    SetBookType(bookProfileTxt.typename);
                    SetWriter(bookProfileTxt.writer);
                    SetAritst(bookProfileTxt.artist);
                    SetTraslator(bookProfileTxt.translator);
                    SetDesc(bookProfileTxt.description);
                    SetPrice(bookProfileTxt.price);
                    SetBookPicture(response.data.picURL);
                    SetStatus(response.data.bookStatus);
                    SetAge(response.data.ageTxt);
                    SetChapter(response.data.bookContent);
                } else {
                    console.log('Can not get book detail approve');
                }

            });
        }

    }, [backend, SetBookID, location.state?.bookID, location.state?.userEmail]);

    function SellApprove() {

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}SellApprove`, { bookID: bookID }).then((response) => {
            if(response.data.status === 'ok') {
                toast.update(toastId.current, {
                    render: "อนุมัติให้วางขายหนังสือสำเร็จแล้ว",
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

                SetAcceptBook(false);
                navigate('/admin/BookSellApprove');
            } else {
                toast.update(toastId.current, {
                    render: "ไม่สามารถอนุมัติให้วางขายหนังสือได้",
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
            }
        });
    }

    function SellNotApprove() {

        toastId.current = toast.loading("กำลังดำเนินการ", {
            position: "bottom-center",
            autoClose: false,
            closeButton: false,
        });

        axios.post(`${backend}SellNotApprove`, { bookID: bookID, reason: notAcceptReason }).then((response) => {
            if(response.data.status === 'ok') {

                toast.update(toastId.current, {
                    render: "ไม่อนุมัติให้วางขายหนังสือสำเร็จแล้ว",
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

                SetNotAcceptReason('');
                SetNotAcceptBook(false);
                navigate('/admin/BookSellApprove');
            } else {
                toast.update(toastId.current, {
                    render: "ไม่สามารถไม่อนุมัติให้วางขายหนังสือได้",
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
            }
        });
    }

    return (
        <>
            {acceptBook ? 
                <div className="booksellapprove-box-bg">
                    <div className="booksellapprove-confirm accept">
                        <div className="booksellapprove-massage-alert">
                            <h5>อนุมัติให้วางขายหนังสือ</h5>
                            <p>คุณต้องการที่จะอนุมัติการขายหนังสือเรื่อง "{bookname}" ใช่หรือไม่</p>
                        </div>
                        <div className="box-btn accept">
                            <button type="button" className="submit" onClick={SellApprove}>ยืนยัน</button>
                            <button type="button" className="cancel" onClick={()=>SetAcceptBook(false)}>ยกเลิก</button>  
                        </div>
                    </div>
                </div> 
            : ''}
            {notAcceptBook ? 
                <div className="booksellapprove-box-bg">
                    <div className="booksellapprove-confirm notaccept">
                        <div className="booksellapprove-massage-alert">
                            <h5>ไม่อนุมัติให้วางขายหนังสือ</h5>
                            <p>กรุณาให้เหตุผลว่าทำไมถึงไม่ให้วางขายหนังสือเรื่อง "{bookname}"</p>
                        </div>
                        <div className="form-control">
                            <label htmlFor="notapprovereason">*ใส่เหตุผล</label>
                            <textarea id="notapprovereason" value={notAcceptReason} onChange={(e)=>SetNotAcceptReason(e.target.value)} rows="3" cols="33" pattern="[a-zA-Zก-๏0-9]{1,501}" title="กรุณาใส่ข้อความที่เป็นตัวอักษรหรือตัวเลขเท่านั้นที่ไม่เกิด 500 ตัว"></textarea>
                        </div>
                        <div className="box-btn notaccept">
                            <button type="button" className="submit" onClick={SellNotApprove}>ยืนยัน</button>
                            <button type="button" className="cancel" onClick={()=>{SetNotAcceptBook(false); SetNotAcceptReason('');}}>ยกเลิก</button>  
                        </div>
                    </div>
                </div> 
            : ''}
            <div className="BookDetail-sell-approve">
                <h1>ตรวจสอบข้อมูลหนังสือ</h1>
                <div className="BookDetail-sell-approve-card">
                    <div className="admin-choice">
                        <h2>เลือกสิทธิในการขายหนังสือเล่มนี้</h2>
                        <button className="accept" onClick={()=>SetAcceptBook(true)}><span><Icon2.GiCheckMark /></span> อนุมัติให้วางขาย</button>
                        <button className="notaccept" onClick={()=>SetNotAcceptBook(true)}><span><Icon.MdClose /></span> ไม่อนุมัติให้วางขาย</button>
                    </div>
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
                                <p>สถานะ : {status}</p>
                            </div>
                            <div className="book-group">
                                <p>ช่วงอายุของผู้ที่เข้ามาอ่าน : {age}</p>
                            </div>
                            <div className="book-group">
                                <p>ราคาหนังสือ : {price}</p>
                            </div>
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
                        : <p className="cut-off-text">ไม่มีเนื้อหาบทนำ</p> }
                    </div>
                    <div className="chapter">
                        {chapter.map((item, index) => (
                            <div className="book-chapter" key={index}>
                                <button type="button" onClick={() => { navigate("/admin/BookContent", { state: { status: status, chid: item.chID, bookid: bookID, bookname: bookname, chapter: chapter }})}}>
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
    );
}


