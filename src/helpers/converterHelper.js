import {
    EXTENSION_MAPPING_ICONS,
    NO_PREVIEW,
    PREVIEW_AUDIO,
    PREVIEW_IMAGE,
    PREVIEW_TEXT,
    PREVIEW_VIDEO
} from "./consts.js";

export function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function fmtDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}
            ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}

export function mapIcon(mime) {
    for (const key in EXTENSION_MAPPING_ICONS) {
        if (mime.startsWith(key)) {
            return EXTENSION_MAPPING_ICONS[key];
        }
    }

    return "fa-file-o";
}


export function canShowPreview(mime) {
    if (mime.startsWith('image/')) {
        return PREVIEW_IMAGE;
    }

    if (mime.startsWith('video/')) {
        return PREVIEW_VIDEO;
    }

    if (mime.startsWith('audio/')) {
        return PREVIEW_AUDIO;
    }

    if (mime.startsWith('text/') || mime.startsWith('application/javascript') || mime.startsWith('application/json')) {
        return PREVIEW_TEXT;
    }

    return NO_PREVIEW;
}