import { defineStore } from 'pinia';
import {ACCESS_LEVEL_ANY} from "../helpers/consts.js";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        id: 0,
        name: "Anonymous",
        nickname: "anonymous",
        avatar_url: null,
        access_level: ACCESS_LEVEL_ANY,
        token: "",
        width: 100,
        mobility: false,
    }),

    actions: {
        setInfo(info) {
            this.id = info.id;
            this.name = info.name;
            this.nickname = info.nickname;
            this.avatar_url = info.avatar_url;
            this.access_level = info.access_level;
            this.token = localStorage.getItem("token");
            this.width = localStorage.getItem("width");
        },

        setNick(nick) {
            this.nickname = nick;
        },

        setWidth(scale) {
            this.width = scale;
            localStorage.setItem("width", scale);
        },

        checkSize() {
            // мобильность
            if (window.innerWidth <= 1500) {
                this.width = 100;
                this.mobility = true;
            } else {
                this.mobility = false;
            }
        },
        
        setAvatar(url) {
            this.avatar_url = url;
        }
    },
});