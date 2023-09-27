import { React, useContext, useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import "../Styles/BookDetail.css";
import "../Styles/LogRegis.css"
import LogRegis from "./LogRegis";
import io from "socket.io-client";
import TimeAgo from 'react-timeago';
import thaiString from 'react-timeago/lib/language-strings/th';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import { apiContext } from "../..";
import * as Icon from "react-icons/fa";
import * as Icon2 from "react-icons/io";
import * as Icon3 from "react-icons/tb";
import * as Icon4 from "react-icons/bi";
import * as Icon5 from "react-icons/bs";
import * as Icon6 from "react-icons/tfi";
import * as Icon7 from "react-icons/ci";

const socket = io.connect('http://localhost:4000');
const formatter = buildFormatter(thaiString);

export default function BookDetail() {

    const backend = useContext(apiContext);

    const navigate = useNavigate();

    const OpenLogRegis = () => {
        const wrapper = document.querySelector('.wrapper');
        wrapper.classList.add('open');
    }

    const [IsToken, SetIsToken] = useState('');
    const [userID, SetUserID] = useState(null);
    const [username, SetUsername] = useState('');
    const [userPicture, SetUserPicture] = useState('');
    const [FollowBtn, SetFollowBtn] = useState(false);
    const [LikeStatus, SetLikeStatus] = useState(0);
    const [bookid, SetBookid] = useState(0);
    const [bookname, SetBookname] = useState('');
    const [bookType, SetBookType] = useState('');
    const [writer, SetWriter] = useState('');
    const [artist, SetAritst] = useState('');
    const [translator, SetTraslator] = useState('');
    const [desc, SetDesc] = useState('');
    const [price, SetPrice] = useState(0);
    const [sellPrice, SetSellPrice] = useState(0);
    const [dueSell, SetDueSell] = useState('');
    const [bookPicture, SetBookPicture] = useState('');
    const [uploadDate, SetUploadDate] = useState();
    const [status, SetStatus] = useState('');
    const [owner, SetOwner] = useState('');
    const [ownerUsername, SetOwnerUsername] = useState('');
    const [owverPicture, SetOwnerPicture] = useState('');
    const [chapter, SetChapter] = useState([]);
    const [blockMessage,SetBlockMessage] = useState(false);

    //Receive book id value from main page
    const location = useLocation();
    const bookID = location.state?.bookID;

    const [inputMessage, SetInputMessage] = useState("");
    const [messageList, SetMessageList] = useState([]);
    const comment_ch = useRef('');

    const [selectedOption, setSelectedOption] = useState(null);
    const handleCheckboxChange = (option) => {
        setSelectedOption(option);
    };

    //Use memo to prevent receive double message
    const handleReceiveMessage = useMemo(() => (data) => {
        SetMessageList((list) => [data, ...list]);
    }, []);

    const handleUpdateMessage = useMemo(() => (data) => {
        SetMessageList(data);
    }, []);

    const token = localStorage.getItem("token");

    useEffect(() => {

        let decode = '';
        SetBookid(bookID);

        //Check if token is null or not
        if (token) {
            const token = JSON.parse(localStorage.getItem("token"));
            SetIsToken(token);
        } else {
            localStorage.setItem('token', '');
        }

        //Check jwt if token is is not null
        if (IsToken !== '') {

            const config = {
                headers: { Authorization: `Bearer ${IsToken}` }
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

        }

        //Get user id from backend
        const Getiduser = async () => {
            axios.post(`${backend}GetProfileComment`, { email: decode }).then((response) => {
                if (response.data.status === 'ok') {
                    SetUserID(response.data.userID);
                    SetUserPicture(response.data.url);
                    SetUsername(response.data.username);
                } else {
                    console.log('authen fail.');
                }
            });
        }

        axios.post(`${backend}GetBookDetail`, { bookID: bookID, userID: userID }).then((response) => {
            if (response.data.status === 'ok') {
                const bookProfile = response.data.bookProfile;
                SetBookname(bookProfile.bookname);
                SetBookType(bookProfile.typename);
                SetWriter(bookProfile.writer);
                SetAritst(bookProfile.artist);
                SetTraslator(bookProfile.translator);
                SetDesc(bookProfile.description);
                SetPrice(bookProfile.price);
                SetSellPrice(bookProfile.sell_price);
                SetDueSell(bookProfile.due_sell);
                SetStatus(response.data.bookStatus);
                SetOwner(bookProfile.real_name);
                SetBookPicture(response.data.picBook);
                SetOwnerPicture(response.data.picOwner);
                SetUploadDate(response.data.upload_date);
                SetChapter(response.data.bookContent);
                SetBlockMessage(response.data.block_message);
                SetMessageList(response.data.bookComment);
                comment_ch.current = bookProfile.comment_ch;

                //Check if user activity value is null or not
                if (response.data.user_activity !== 'null') {

                    if (response.data.user_activity.follow_date) {
                        SetFollowBtn(true);
                    }

                    if (response.data.user_activity.score) {
                        SetLikeStatus(response.data.user_activity.score);
                    }
                }

                SetOwnerUsername(bookProfile.username);

                JoinChat();
            } else {
                console.log('Can not get bookdetail data');
            }
        });

    }, [bookID, userID, IsToken, token, backend]);

    useEffect(() => {

        //Recive message from other user via socket api
        socket.on("receive_book_comment", handleReceiveMessage);
        socket.on("receive_update_comment", handleUpdateMessage);

        return () => {
            socket.off("receive_book_comment", handleReceiveMessage);
            socket.off("receive_update_comment", handleUpdateMessage);
        };

    }, [handleReceiveMessage,handleUpdateMessage]);

    function JoinChat() {
        //console.log('chanel : '+commentCH);
        if (comment_ch.current !== '') {
            socket.emit("join_chat", comment_ch.current);
        }
    }

    //Add zero in front of one digit number
    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    //Format date to YYYY/MM/DD hh:mm:ss
    function formatDate(date) {
        return (
            [
                date.getFullYear(),
                padTo2Digits(date.getMonth() + 1),
                padTo2Digits(date.getDate()),
            ].join('-') +
            ' ' +
            [
                padTo2Digits(date.getHours()),
                padTo2Digits(date.getMinutes()),
                padTo2Digits(date.getSeconds()),
            ].join(':')
        );
    }

    async function sendMessage(event) {

        event.preventDefault();

        if(userID) {

            const messageData = {
                comment_ch: comment_ch.current,
                bookID: bookID,
                userID: userID,
                author: username,
                picture: userPicture,
                message: inputMessage,
                time: formatDate(new Date(Date.now()))
            };
    
            SetMessageList((list) => [messageData, ...list]);
            await socket.emit("send_book_comment", messageData);
            SetInputMessage('');

        } else {
            AlertLoginPopup();
        }
    }

    function AlertSuccess(text) {
        toast.success(text, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }

    function AlertFail(text) {
        toast.error(text, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }

    function AlertLoginPopup() {
        // Alert box popup
        Swal.fire({
            icon: 'warning',
            title: 'กรุณาล็อกอินเข้าสู่ระบบก่อน',
            showCloseButton: true,
            confirmButtonColor: '#1ec7fd',
            confirmButtonText: 'ตกลง'
        }).then((result) => {
            if (result.isConfirmed) {
                OpenLogRegis();
            }
        });
    }

    function SaveLikeStatus(num) {
        
        if(userID) {
            
            SetLikeStatus(num);

            axios.post(`${backend}SaveLikeStatus`, { userID: userID, bookID: bookID, likestatus: num }).then((response) => {
                if (response.data.status === 'ok') {
                    if(num===1) {
                        AlertSuccess("คุณได้กดชอบหนังสือเล่มนี้แล้ว");
                    } else if(num===2) {
                        AlertSuccess("คุณได้กดไม่ชอบหนังสือเล่มนี้");
                    } else if(num===0) {
                        AlertSuccess("คุณได้กดยกเลิกการให้คะแนน");
                    }
                    
                } else {
                    AlertFail("ไม่สามารถบันทึกรายการได้ในขณะนี้");
                }
            });
        } else {
            AlertLoginPopup();
        }
    };

    function SaveFollowStatus(status) {

        if(userID) {

            let currentDate = '';
            status ? currentDate = formatDate(new Date(Date.now())) : currentDate = 'null';

            SetFollowBtn(status);

            axios.post(`${backend}SaveFollowStatus`, { userID: userID, bookID: bookID, date: currentDate }).then((response) => {
                if (response.data.status === 'ok') {
                    if(status) {
                        AlertSuccess("คุณได้กดติดตามหนังสือเล่มนี้แล้ว");
                    } else {
                        AlertSuccess("คุณได้กดยกเลิกการติดตามหนังสือเล่มนี้แล้ว");
                    }
                } else {
                    AlertFail("ไม่สามารถบันทึกรายการได้ในขณะนี้");
                }
            });
        } else {
            AlertLoginPopup();
        }

    };

    function BuyBookNow() {
        if(userID) {
            navigate("/buybook", { state: {bookID: bookid }});
        } else {
            AlertLoginPopup();
        }
    };

    async function deleteMessage(message,author,index) {

        axios.post(`${backend}DeleteMessage`, { message: message, author: author }).then((response) => {
            if (response.data.status === 'ok') {

                //Delete old message in array
                messageList.splice(index, 1);
                update_everyone_message();

                AlertSuccess("ลบข้อความสำเร็จแล้ว");
                
            } else {
                AlertFail("ไม่สามารถลบข้อความได้");
            }
        });

        async function update_everyone_message() {
            await socket.emit("update_book_comment", {comment_ch:comment_ch.current, message: messageList});
        }
    }

    function blockUser(banUsername) {

        axios.post(`${backend}BlockUser`, { ownerName: ownerUsername, banUsername: banUsername}).then((response) => {
            if (response.data.status === 'ok') {

                //Delete old message of user that got ban
                for(let i=(messageList.length-1); i>=0; i--) {
                    if(messageList[i].author === banUsername) {
                        messageList.splice(i, 1);
                    }  
                };

                update_everyone_message();

                AlertSuccess("บล็อกผู้ใช้งานเรียบร้อยแล้ว");
                
            } else {
                AlertFail("ไม่สามารถบล็อกผู้ใช้งานได้");
            }
        });

        async function update_everyone_message() {
            //console.log(messageList);
            await socket.emit("update_book_comment", {comment_ch:comment_ch.current, message: messageList});
        }

    }

    return (
        <>
            <LogRegis />
            <div className="Book-detail">
                <div className="book-profile">
                    <div className="book-pic">
                        <img src={bookPicture} alt="book cover demo" />
                    </div>
                    <div className="Book-desc">
                        <div className="detail-text">
                            <h1>{bookname}</h1>
                            <p>หมวดหมู่ : {bookType}</p>
                            <p>ผู้เขียน : {writer}</p>
                            {artist !== 'null' ? <p>นักวาด : {artist}</p> : ''}
                            {artist !== 'null' ? <p>ผู้แปล : {translator}</p> : ''}
                            <p>วันที่อัปโหลด : {uploadDate}</p>
                            <p>สถานะ : {status}</p>
                        </div>
                        {ownerUsername === username ? '' :
                            <>
                                <div className="btn-like-book">
                                    <div className="switch-mode">
                                        <div className={`like ${LikeStatus === 1 ? 'active' : ''}`}>
                                            <button type="button" onClick={() => { LikeStatus === 1 ? SaveLikeStatus(0) : SaveLikeStatus(1) }}>
                                                <span><Icon4.BiSolidLike /></span> กดถูกใจ
                                            </button>
                                        </div>
                                        <div className={`dislike ${LikeStatus === 2 ? 'active' : ''}`}>
                                            <button type="button" onClick={() => { LikeStatus === 2 ? SaveLikeStatus(0) : SaveLikeStatus(2) }}>
                                                <span><Icon4.BiSolidDislike /></span> กดไม่ถูกใจ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="btn-buy-follow-share">
                                    {FollowBtn ?
                                        <>
                                            {price ? '' :
                                                <button type="button" className="follow" onClick={() => { SaveFollowStatus(false) }}>
                                                    <span><Icon2.IoMdCheckmarkCircleOutline /></span> ติดตามหนังสือแล้ว
                                                </button>
                                            }
                                        </> :
                                        <div className="notfollow-notbuy">
                                            {price ?
                                                <button type="button" className="buy-book" onClick={BuyBookNow}>
                                                    <span><Icon3.TbDeviceIpadDollar /></span> <p>ซื้อ {price} บาท</p>
                                                </button> :
                                                <button type="button" className="notfollow" onClick={() => (SaveFollowStatus(true))}><Icon5.BsBookmarkPlusFill /> กดติดตามหนังสือ</button>
                                            }
                                        </div>
                                    }
                                    <button type="button" className="share"><Icon5.BsFillShareFill /> แชร์</button>
                                </div>
                            </>
                        }
                    </div>
                </div>
                {ownerUsername === username ? '' :
                    <>
                        <h3 className="text-owner">เจ้าของผลงาน</h3>
                        <div className="book-owner">
                            <div className="profile-card">
                                <img src={owverPicture} alt="book owner" />
                                <div className="profile-detail">
                                    <p>{owner}</p>
                                    <button type="button">กดติดตาม</button>
                                </div>
                            </div>
                            <div className="seperate-line" />
                            <div className="donate">
                                <button type="button" className="btn-donate">
                                    <span><Icon.FaDonate /></span> สนับสนุนเจ้าของผลงาน
                                </button>
                            </div>
                        </div>
                    </>
                }
                {desc === null || desc === "null" ? <div className="none-prologue"/> : 
                    <div className="prologue">
                        <h3>บทนำ</h3>
                        <p className="cut-off-text">{desc}</p>
                        <input className="expand-btn" type="checkbox" id="expand-text" />
                        <div className="seperate-line" />
                    </div>
                }
                {chapter ?
                    <div className="chapter">
                        {chapter.map((item, index) => {
                            return (
                                <div className="book-chapter" key={index}>
                                    <button type="button" onClick={() => { navigate("/readercontent", { state: { status: status, chid: item.chID, bookid: bookid, bookname: bookname, chapter: chapter } }) }}>
                                        <div className="ep">Chapter {item.chapter}</div>
                                        <div className="ep-name">{item.title}</div>
                                        <div className="ep-view"><span><Icon2.IoIosEye /></span>{item.view}</div>
                                        <div className="ep-date">{item.date}</div>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    : ''}
                <div className="comment">
                    <h2><Icon6.TfiCommentAlt /> ช่องแสดงความคิดเห็น</h2>
                    {blockMessage ? <h3>ไม่สามารถแสดงความคิดเห็นได้เนื่องจากคุณถูกบล็อก</h3> :
                        <div className="send-message">
                            <form onSubmit={sendMessage}>
                                <input type="text" id="comment" value={inputMessage} onChange={(e) => SetInputMessage(e.target.value)} placeholder="ใส่ข้อความแสดงความคิดเห็น" pattern="[a-zA-Zก-๏0-9]+{1,501}" title="กรุณาใส่ข้อความที่เป็นตัวอักษรหรือตัวเลขเท่านั้นที่ไม่เกิด 500 ตัว" required />
                                <button type="submit">กดส่งข้อความ</button>
                            </form>
                        </div>
                    }
                    {messageList.map((data, index) => {
                        return (
                            <div className="show-message" key={index}>
                                <div className="user-info">
                                    <div className="profile-group">
                                        <img src={data.picture} alt="user profile" />
                                        <div className="name-date">
                                            <h4>{data.author} {ownerUsername === data.author ? '(เจ้าของหนังสือ)' : ''}</h4>
                                            <p>ส่งข้อความ <TimeAgo date={data.time} formatter={formatter} /></p>
                                        </div>
                                    </div>
                                    {ownerUsername===username || data.author===username ? 
                                        <div className="comment-option">
                                            <div className="dropdown">
                                                <label className="option" htmlFor={`option ${index}`}>
                                                    <span><Icon7.CiMenuKebab /></span>
                                                </label>
                                                <input className="clickbox" type="checkbox" id={`option ${index}`} checked={selectedOption === `${index}`} onChange={() => {selectedOption===`${index}` ? handleCheckboxChange(null) : handleCheckboxChange(`${index}`)}}/>
                                                <div className="dropdown-content">
                                                    <li onClick={()=>deleteMessage(data.message,data.author,index)}>ลบข้อความ</li> 
                                                    {ownerUsername===username && data.author!==ownerUsername ? <li onClick={()=>blockUser(data.author)}>บล็อกผู้ใช้งาน</li> : ''}
                                                </div>
                                            </div>
                                        </div>
                                    : ''}
                                </div>
                                <p className="message">{data.message}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

