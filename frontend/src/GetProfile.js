import { useContext } from "react";
import { apiContext } from ".";
import axios from "axios";

export async function GetProfile() {

    const backend = useContext(apiContext);

    const token = localStorage.getItem("token");

    if(token) {

        const token = JSON.parse(localStorage.getItem("token"));

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const bodyParameters = {
            key: "value"
        };

        const res = await axios.post(`${backend}NevSideProfile`, bodyParameters, config);

        if (res.data.status === 'ok') {
            return {
                status: 'ok',
                username: res.data.username,
                real_name: res.data.real_name,
                url: res.data.url,
                user_status: res.data.user_status,
            };
        } else {
            return {status: 'error'}; 
        }

    } else {
        return {status: 'tokenFail'}; 
    }

}