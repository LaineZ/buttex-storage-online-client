<template>
    <transition name="modal-fade">
        <div class="modal" v-if="show" @click="close">
            <div class="modal-content" @click.stop>
                <div class="modal-top">
                    <div class="close-button" @click="close" v-if="closebtn">
                        <i style="vertical-align: top;" class="fa fa-remove"></i>
                    </div>
                </div>
                <div style="padding: 20px">
                    <div v-if="text.length === 0">
                        <slot></slot>
                    </div>
                    <div v-else style="display: flex; min-width: 15vw;">
                        <div style="margin-right: 20px">
                            <i class="fa fa-4x" :class="icon"></i>
                        </div>
                        <p>{{ text }}</p>
                    </div>
                </div>
                <div class="modal-bottom" v-if="buttons.length > 0">
                    <button v-for="(button, index) in buttons" @click="response(index)">{{ button }}</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    data() {
        return {
            show: false,
            text: "",
            icon: "fa-exclamation-triangle"
        };
    },
    props: {
        buttons: {
            type: Array,
            default: ["Ok"]
        },
        closebtn: {
            type: Boolean,
            default: true
        }
    },
    emits: ["response", "close", "open"],
    methods: {
        open(text = "", icon = "fa-exclamation-triangle") {
            this.text = text;
            this.icon = icon;
            this.show = true;
            this.$emit("open");
            console.log(this.show);
        },
        close() {
            this.show = false;
            this.$emit("close");
        },
        response(index) {
            this.$emit("response", index);
            this.close();
        }
    },
};
</script>

<style scoped>




.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(83, 83, 115, 0.6);
    backdrop-filter: blur(5px);
    z-index: 1000;
    display: flex;
    place-items: center;
    transition: opacity 0.2s ease-in-out;
}

.modal-bottom {
    background-color: var(--bg2);
    padding: 10px;
}

.modal-bottom button {
    margin-right: 10px;
}

.modal-content {
    background-color: var(--bg);
    margin: 20px auto;
    max-width: 95vw;
    box-shadow: 0 0 30px rgba(14, 14, 18, 0.7);
}

.close-button {
    width: 16px;
    height: 16px;
    padding: 2px;
    text-align: center;
    margin: 4px 4px 4px auto;
    color: var(--fg);
}

.close-button:hover {
    background-color: var(--fg2);
}

.modal-top {
    display: flex;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>
