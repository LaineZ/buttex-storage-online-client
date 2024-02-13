import {ENDPOINT} from "./consts.js";
import {useAuthStore} from "../store/auth.js";

export async function RequestGET(path, getOptions = null) {
    let response;

    const init = {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    };

    if (getOptions) {
        let params = new URLSearchParams();

        for (let key in getOptions) {
            params.append(key, getOptions[key]);
        }

        response = await fetch(ENDPOINT + path + "?" + params.toString(), init);
    } else {
        response = await fetch(ENDPOINT + path, init);
    }

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error((await response).statusText);
    }
}


export async function getUserInfo() {
    const authStore = useAuthStore();

    try {
        let response = await RequestGET("/api/users/get_profile_info", {
            user_id: localStorage.getItem("user_id")
        });

        authStore.setInfo(response.data);
    } catch (e) {}
}