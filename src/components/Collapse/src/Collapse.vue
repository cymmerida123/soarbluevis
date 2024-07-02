<script setup lang="ts">
import { computed, unref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('collapse')

defineProps({
    color: propTypes.string.def('')
})

const appStore = useAppStore()

const collapse = computed(() => appStore.getCollapse)

const toggleCollapse = () => {
    const collapsed = unref(collapse)
    appStore.setCollapse(!collapsed)
}
</script>

<template>
    <div :class="prefixCls" @click="toggleCollapse">
        <Icon
            :size="18"
            :icon="collapse ? 'svg-icon:menu-unfold-outlined' : 'svg-icon:menu-fold-outlined'"
            :color="color"
            class="cursor-pointer"
        />
    </div>
</template>
