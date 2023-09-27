import {React,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/CardItem.css";
import * as Icon from "react-icons/vsc";
import * as Icon2 from "react-icons/tb";

const CardItem = ({element}) => {

    let navigate = useNavigate();

    useEffect(()=>{
        //Set score to progress bar
        const ProgressBar = document.querySelectorAll(`.progress-percent`);
        ProgressBar.forEach(ProgressBar=> {
            const value = ProgressBar.dataset.progress;
            ProgressBar.style.width = `${value}%`;
        });
    },[]);

    return(
        <div className="card">
            <div className="card-body">
                <img src={element.image} alt="bookcover"/>
                <div className="card-detail">
                    <h1>{element.bookname}</h1>
                    <h3>{element.writer}</h3>
                    {element.review_percent ? <p>คะแนนอยู่ในระดับที่{element.review_text}</p> : <p>ยังไม่มีคะแนนรีวิว</p>}
                    <div className={`progress-bar ${element.review_percent ? 'active' : 'not-active' }`}>
                        <div className="progress-percent" data-progress={element.review_percent}/>
                    </div>
                    {element.review ? <p>จากผู้รีวิวทั้งหมด {element.review} คน</p> : <p>ยังไม่มีผู้รีวิว</p>}
                    <div className="btn-detail">
                        {element.price ?
                            <div className="btn-detail sell">
                                <button className="view-detail" onClick={()=>{navigate("/bookdetail",{state : {bookID : element.id}})}}><Icon.VscOpenPreview /> <p>ดูลายละเอียด</p></button>
                                <button type="button" className="buy-book" onClick={()=>{navigate("/buybook",{state : {bookID : element.id}})}}><span><Icon2.TbDeviceIpadDollar/></span> <p>ซื้อ {element.price} บาท</p></button> 
                            </div> :
                            <button type="button" className="view-detail" onClick={()=>{navigate("/bookdetail",{state : {bookID : element.id}})}}><Icon.VscOpenPreview /> <p>อ่านตอนนี้เลย</p></button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardItem