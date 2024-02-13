import {ENDPOINT} from "./consts.js";

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