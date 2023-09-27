import React,{useContext, useEffect, useState, useRef} from "react";
import { useNavigate,useLocation } from "react-router-dom";
//import {Document,Page,pdfjs} from "react-pdf";
import axios from "axios";
/*import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';*/
import "../Styles/ReaderContent.css";
import * as Icon1 from "react-icons/md";
import * as Icon2 from "react-icons/ai";
//import demofile from "../pdf/sample.pdf";
import { apiContext } from "../..";


export default function ReaderContent() {

    const navigate = useNavigate();

    const backend = useContext(apiContext);

    const alreadyCount = useRef(false);
    const chapterSelect = useRef([]);
    const bookID = useRef(0);

    const [bookname,SetBookname] = useState('');
    const [bookStatus,SetBookStatus] = useState('');
    const [checkID,SetCheckID] = useState(0);
    const [chapter,SetChapter] = useState();
    const [chaptername,SetChaptername] = useState('');
    const [nextChapter,SetNextChapter] = useState('');
    const [previousChapter,SetPreviousChapter] = useState('');
    const [preventReload,SetPreventReload] = useState(false);

    /*pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url,
    ).toString();*/

    //const [numPages, SetNumPages] = useState(null);
    const [pdfFile,SetPdfFile] = useState('');

    const location = useLocation();

    useEffect(()=>{

        //Get value in navigate link that send from previous page
        let chID = location.state?.chid;
        const valuename = location.state?.bookname;
        const status = location.state?.status;
        SetCheckID(chID);
        SetBookname(valuename);
        SetBookStatus(status);

        let bookid = location.state?.bookid;

        if(bookid!==undefined) {
            bookID.current = bookid;
        }

        //Get book episode value from navigate link then stack into new array 
        let chArray = location.state?.chapter;
        let chapter = [];
        SetChapter(chArray);

        let pointer = 0;

        if(chArray!==undefined) {
            for(let i=0; i<chArray.length; i++) {
                
                //Check current chapter id value that match to chapter array id value or not then store index array
                if(parseInt(chID) === parseInt(chArray[i].chID)) {
                    pointer = i; 
                };

                //Store specific column value into new array
                chapter.push({id: chArray[i].chID, ch: chArray[i].chapter, title: chArray[i].title});
            };

            //Check pointer then set value for next and previous button reader
            if(pointer===0 && chArray.length===1) {
                SetNextChapter('');
                SetPreviousChapter('');
            } else if(pointer===0) {
                SetNextChapter(chArray[pointer+1].chID);
            } else if((pointer+1)===chArray.length) {
                SetPreviousChapter(chArray[pointer-1].chID);
            } else {
                SetNextChapter(chArray[pointer+1].chID);
                SetPreviousChapter(chArray[pointer-1].chID);
            }

        }

        chapterSelect.current = chapter;

        if(!preventReload && chArray!==undefined) {

            let pdfLocate = [];

            pdfLocate.push(chArray[pointer].file);
            SetChaptername(chArray[pointer].title);
            
            //Get pdf file from node js
            axios.post(`${backend}GetStorageFile`, {imageURL: pdfLocate}).then((response)=>{
                if(response.data.status==='ok') {
                    SetPdfFile(response.data.imageURL[0]);
                    SetPreventReload(true);
                } else {
                    console.log('Can not get pdf file');
                }
            });
            
        }

        if(status!=='วางขาย' && !alreadyCount.current) {
            //Update view count by add one view per click
            axios.post(`${backend}UpdateViewCount`, {chID: chArray[pointer].chID, bookID: bookID.current});
            alreadyCount.current = true;
        }

    },[preventReload,backend,location.state]);

    const SelectChapter =(event)=> {
        navigate("/readercontent",{state: {status: bookStatus, chid: event, bookid: bookID.current, bookname: bookname, chapter:chapter}});
        window.location.reload(false);
    }

    return(
        <>
            {window.scrollTo(0, 0)}
            <div className="name-chapter">
                <h1>{bookname}</h1>
                <h3>{chaptername}</h3>
                <div className="select-ep top">
                    <div className="select-ch">
                        {previousChapter ? <button className="previous" onClick={()=>SelectChapter(previousChapter)}><span><Icon1.MdArrowBackIosNew/></span>ตอนที่แล้ว</button> : ''}
                        <select id="chapter-select-top" value={checkID} onChange={(e)=>SelectChapter(e.target.value)}>
                            {chapterSelect.current.map((value,index)=>{
                                return(
                                    <option key={index} value={value.id}>ตอนที่ {value.ch} {value.title}</option> 
                                )
                            })}
                        </select>
                        {nextChapter ? 
                            <button className="next" onClick={()=>SelectChapter(nextChapter)}>ตอนต่อไป<span><Icon1.MdArrowForwardIos /></span></button> : 
                            <button className="back-to-book" onClick={()=>{navigate("/bookdetail",{state : {bookID : bookID.current}})}}><span><Icon2.AiOutlineQuestionCircle /></span>กลับไปที่หน้าหนังสือ</button>
                        }
                    </div>
                </div>
            </div>
            <div className="content">
                <embed
                    src={`${pdfFile}#toolbar=0&navpanes=0&scrollbar=0`}
                    width="425" />   
            </div>
            <div className="select-ep bottom">
                <div className="select-ch">
                    {previousChapter ? <button className="previous" onClick={()=>SelectChapter(previousChapter)}><span><Icon1.MdArrowBackIosNew/></span>ตอนที่แล้ว</button> : ''}
                    <select id="chapter-select-bottom" value={checkID} onChange={(e)=>SelectChapter(e.target.value)}>
                        {chapterSelect.current.map((value,index)=>{
                            return(
                                <option key={index} value={value.id}>ตอนที่ {value.ch} {value.title}</option> 
                            )
                        })}
                    </select>
                    {nextChapter ? 
                        <button className="next" onClick={()=>SelectChapter(nextChapter)}>ตอนต่อไป<span><Icon1.MdArrowForwardIos /></span></button> : 
                        <button className="back-to-book" onClick={()=>{navigate("/bookdetail",{state : {bookID : bookID.current}})}}><span><Icon2.AiOutlineQuestionCircle /></span>กลับไปที่หน้าหนังสือ</button>
                    }
                </div>
            </div>
        </>
    );
}
