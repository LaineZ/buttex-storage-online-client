import {RequestGET} from "./http.js";
import {useAuthStore} from "../store/auth.js";

export async function deleteDirectory(componentContext, directoryId) {
    try {
        await RequestGET("/api/storage/delete_directory", {
            directory_id: directoryId
        });
    } catch (error) {
        componentContext.$show(error.toString());
    }
}

export async function setDirectoryHiddenStatus(componentContext, directoryId, hidden) {
    try {
        await RequestGET("/api/storage/set_directory_hidden", {
            directory_id: directoryId,
            hidden: hidden ? 1 : 0
        });
    } catch (error) {
        componentContext.$show(error.toString());
    }
}

export async function deleteFile(componentContext, fileId) {
    try {
        await RequestGET("/api/storage/delete_file", {
            file_id: fileId
        });
    } catch (error) {
        componentContext.$show(error.toString());
    }
}

export async function setUserAvatar(url) {
    const authStore = useAuthStore();

    await RequestGET("/api/users/set_avatar_url", {
        new_avatar_url: url
    });

    authStore.setAvatar(url);
}