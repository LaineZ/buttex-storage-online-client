import {RequestGET} from "./http.js";

export async function deleteDirectory(componentContext, directoryId) {
    try {
        await RequestGET("/api/storage/delete_directory", {
            directory_id: directoryId
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

