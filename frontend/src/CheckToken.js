import { useContext } from "react";
import { apiContext } from ".";
import axios from "axios";

export async function CheckToken() {

    const backend = useContext(apiContext);

    const token = JSON.parse(localStorage.getItem("token"));

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const bodyParameters = {
            key: "value"
        };

        const res = await axios.post(`${backend}CheckToken`, bodyParameters, config);

        if (res.data.status === 'ok') {
            return {
                status: 'ok',
                email: res.data.decoded.email,
            };
        } else {
            return {status: 'error'}; 
        }

}