<template>
    <transition name="loading-fade">
        <div class="loading" v-if="loading" :style="dimming ? 'background-color: rgba(83, 83, 115, 0.6)' : ''">
            <i class="fa fa-circle-o-notch fa-spin fa-4x"></i>
        </div>
    </transition>
</template>
<script>
export default {
    name: 'LoadingOverlay',
    props: {
        loading: Boolean,
        dimming: {
            type: Boolean,
            default: true,
        },
    }
}
</script>
<style scoped>
    .loading-fade-enter-active,
    .loading-fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .loading-fade-enter-from,
    .loading-fade-leave-to {
        opacity: 0;
    }

    .loading {
        position: absolute;
        width: 100%;
        height: 100%;
        text-align: center;
        display: flex;
        place-items: center;
    }

    .loading i {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }
</style>