<template>
    <transition name="modal-fade">
        <div v-if="visible" class="context-menu" :style="{ top: `${position.y}px`, left: `${position.x}px` }" ref="ctxMenu">
            <ul>
                <template v-for="(item, index) in items">
                    <li
                        v-if="item.name"
                        :class="{ 'li-critical': item.critical }"
                        @click="handleItemClick(item.id || index)"
                    >
                        <i
                            class="fa"
                            :class="item.icon || ''"
                        />
                        
                        {{ item.name || item }}
                    </li>
                    
                    <hr v-else/>
                </template>
            </ul>
        </div>
    </transition>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            position: {x: 0, y: 0},
        }
    },
    props: {
      items: {
          type: Array,
          default: [],
      }
    },
    methods: {
        openAtMouse(event) {
            event.preventDefault();
            this.position = { x: event.clientX, y: event.clientY };
            this.visible = true;
            window.addEventListener('click', this.hideContextMenu);
            window.addEventListener('resize', this.hideContextMenu);
            window.addEventListener('scroll', this.hideContextMenu);

            this.$nextTick(() => {
                console.log(this.$refs.ctxMenu.clientHeight);

                if (event.clientY + this.$refs.ctxMenu.clientHeight > window.innerHeight) {
                    this.position.y -= this.$refs.ctxMenu.clientHeight;
                }


                if (event.clientX + this.$refs.ctxMenu.clientWidth > window.innerWidth) {
                    this.position.x -= this.$refs.ctxMenu.clientWidth;
                }
            });
        },

        handleItemClick(itemIndex) {
            this.$emit('itemClick', itemIndex);
        },

        hideContextMenu() {
            this.visible = false;
            window.removeEventListener('click', this.hideContextMenu);
        },
    },
};
</script>

<style scoped>
.context-menu {
    position: fixed;
    z-index: 1000;
    
    margin: 0;
    padding: 0;
    
    background-color: var(--bg6);
    
    border: 1px solid var(--bg4);
    border-radius: 5px;
    
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
}

.context-menu ul {
    padding: 0;
}

.context-menu li {
    padding: 8px 40px 8px 4px;
    margin: 0;
}

.li-critical {
    color: var(--fg-critical);
}

.context-menu i {
    width: 30px;
    text-align: center;
    color: inherit;
    opacity: 0.5;
}

.context-menu hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid var(--bg3);
    
    margin: 0;
    padding: 0;
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