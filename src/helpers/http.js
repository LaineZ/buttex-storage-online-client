import {ACCESS_LEVEL_MODERATOR, ENDPOINT} from "./consts.js";
import {useAuthStore} from "../store/auth.js";


export async function RequestGETText(path) {
    const response = await fetch(path);
    const text = await response.text();
    return text;
}

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
        let responseText = await response.text();

        if (responseText.length == 0) {
            return true;
        }
        return JSON.parse(responseText);
    } else {
        let json = await response.json();
        let text = (await response).statusText;
        if (json.error) {
            throw new Error(json.error);
        }
        throw new Error(text);
    }
}

export async function getUserInfo() {
    const authStore = useAuthStore();

    if (localStorage.getItem("token")) {
        try {
            await RequestGET("/api/users/validate_token");
        } catch (e) {
            console.log(e);
            localStorage.setItem("token", "");
            localStorage.setItem("user_id", "");
            window.location.reload();
        }
    }

    try {
        let response = await RequestGET("/api/users/get_profile_info", {
            user_id: localStorage.getItem("user_id")
        });

        authStore.setInfo(response.data);
    } catch (e) {}
}

export function canEdit(ownerId) {
    // resolve permissions
    // https://storage.buttex.ru/api/docs/methods/storage/set_file_name.html

    const authStore = useAuthStore();


    if (ownerId == 0) {
        return authStore.access_level >= ACCESS_LEVEL_MODERATOR;
    } else {
        return authStore.access_level >= ACCESS_LEVEL_MODERATOR || authStore.id == ownerId;
    }
}


export async function login(username, password) {
    let response = await RequestGET("/api/users/get_token", {
        user_name: username,
        user_password: password,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user_id", response.data.user_id);
    await getUserInfo();
}