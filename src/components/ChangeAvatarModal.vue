<template>
    <modal ref="modalAvatarUrl" :buttons="['Confirm', 'Cancel']" @response="response">
        <div style="display: flex; place-items: center;">
            <div class="avatar" :style="{'background-image': `url('${newAvatarUrl}')`}"></div>
            <div style="margin-left: 10px">
                <h3>Change avatar</h3>
                <input type="text" v-model="newAvatarUrl" placeholder="New avatar url" style="width: 350px">
                <small v-if="error">{{ error }}</small>
            </div>
        </div>
    </modal>
</template>

<script>
import Modal from "./Modal.vue";
import { RequestGET   } from "../helpers/http.js";
import { useAuthStore } from "../store/auth.js";

export default {
    name: "ChangeAvatarModal",
    components: {Modal},
    data() {
        return {
            error: "",
            newAvatarUrl: "",
        }
    },
    props: {
    },
    emits: ["updated"],
    methods: {
        async response(index) {
            if (index == 0) {
                try {
                    const authStore = useAuthStore();

                    await RequestGET("/api/users/set_avatar_url", {
                        new_avatar_url: this.newAvatarUrl
                    });

                    authStore.setAvatar(this.newAvatarUrl);
                    this.$emit("updated");
                } catch (e) {
                    this.$refs.modalAvatarUrl.open();
                    this.error = e.toString();
                }
            }
        },

        open(avatarUrl) {
            this.newAvatarUrl = avatarUrl;
            this.error = null;
            this.$refs.modalAvatarUrl.open();
        }
    }
}
</script>

<style scoped>
    small {
        color: #d38585;
    }
</style>