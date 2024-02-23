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
    }),
    actions: {
        setInfo(info) {
            this.id = info.id;
            this.name = info.name;
            this.nickname = info.nickname;
            this.avatar_url = info.avatar_url;
            this.access_level = info.access_level;
            this.token = localStorage.getItem("token");
        },

        setNick(nick) {
            this.nickname = nick;
        }
    },
});