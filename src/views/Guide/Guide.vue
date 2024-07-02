<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { getGuideApi } from '@/api'
const { t } = useI18n()

const guideStart = () => {
    console.log('开始')
}

import { onMounted, ref } from 'vue'
import { MdPreview, MdCatalog } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const id = 'guide'
const text = ref('')
const scrollElement = document.documentElement

onMounted(async () => {
    let data = (await getGuideApi()).data
    text.value = data
})
</script>

<template>
    <ContentWrap :title="t('guideDemo.guide')" :message="t('guideDemo.message')">
        <MdPreview :editorId="id" :modelValue="text" />
    </ContentWrap>
</template>
