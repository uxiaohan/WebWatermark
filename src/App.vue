<template>
  <!-- 顶部 -->
  <Header title="Web Watermark" desc="你的在线水印助手" />
  <main class="p-4">
    <!-- 公告 -->
    <Alert class="pt-0 pb-2 sm:py-4">
      <AlertTitle class="font-bold hidden sm:flex sm:gap-2">
        <RocketIcon class="h-4 w-4 hidden sm:flex" /> Heads up!
      </AlertTitle>
      <AlertDescription class="p-0 text-xs sm:text-sm">
        <p class="pt-2 text-slate-500">* 本站承诺不会上传、保存用户的任何图片信息，水印处理全部在浏览器中进行。</p>
        <p class="text-stone-600">* 本站支持网或开启飞行模式后离 线使用，无需担心隐私问题。</p>
        <p>水印样式多样调节,不限制文件大小,水印处理时间越长与文件大小有关</p>
        <p style="font-weight: bold;">· 开源地址: <a style="color: #0969da;" href="https://github.com/uxiaohan/WebWatermark"
            target="_blank">Web-Watermark</a>
        </p>
      </AlertDescription>
    </Alert>
    <!-- 主体 -->
    <div class="w-full h-max pt-4 flex flex-col gap-2">
      <Input v-model="WATERMARK_VAL" type="text" placeholder="请输入水印内容" @change="renderCanvas" />
      <section
        class="flex [&>div]:box-border [&>div]:p-2	[&>div]:w-[50%]	[&>div]:flex [&>div]:gap-2 [&>div]:flex-col	[&>div]:justify-between">
        <div>
          <span class="w-max text-sm">水印颜色</span>
          <Input v-model="COLOR_VAL" type="color" style="background-color: #EFEFEF;" @change="renderCanvas" />
        </div>
        <div style="padding-bottom: 1.4rem;">
          <span class="w-max text-sm">水印透明</span>
          <Slider v-model="SLIDER_VAL.OPACTY_VAL" :max="100" :min="1" />
        </div>
      </section>
      <section
        class="flex [&>div]:box-border [&>div]:p-2	[&>div]:w-[50%]	[&>div]:flex [&>div]:gap-4 [&>div]:flex-col	[&>div]:justify-between">
        <div>
          <span class="w-max text-sm">水印大小</span>
          <Slider v-model="SLIDER_VAL.SIZE_VAL" :max="10" :min="0.5" />
        </div>
        <div>
          <span class="w-max text-sm">水印间隔</span>
          <Slider v-model="SLIDER_VAL.GAP_VAL" :max="1666" :min="16" />
        </div>
      </section>
    </div>
    <!-- 功能按钮 -->
    <div class="watermark-button flex justify-between pt-4">
      <Button class="relative">更换图片<input class="absolute opacity-0 top-0 left-0 w-full h-full" type="file"
          accept="image/*" @change="imgChange"></Button>
      <Button @click="downLoadImg" :disabled="!IMG_NAME">保存图片</Button>
    </div>
    <!-- 图片展示 -->
    <div class="img-main w-full mt-4">
      <canvas class="w-full" ref="CANVAS_DOM"></canvas>
    </div>
  </main>

  <Footer />
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import vh from 'vh-plugin'
import Header from '@/components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
import { RocketIcon } from '@radix-icons/vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// 水印内容
const WATERMARK_VAL = ref<string>('Han水印助手')
// 水印颜色
const COLOR_VAL = ref<string>('#ffffff')
// 水印配置
const SLIDER_VAL = ref<any>({
  // 水印透明度
  OPACTY_VAL: [50],
  // 水印大小
  SIZE_VAL: [5],
  // 水印间隔
  GAP_VAL: [150],
})

// 图片切换
const imgChange = (v: Event) => {
  if (!v) return
  vh.showLoading()
  const FileTarget: any = v.target;
  const _File: any = FileTarget.files[0];
  IMG_NAME.value = _File.name
  IMG_TYPE.value = _File.type
  const IMG = document.createElement('img');
  IMG.src = URL.createObjectURL(_File);
  IMG.addEventListener('load', async () => {
    IMG_DOM.value = IMG
    renderCanvas()
    await new Promise((r) => setTimeout(r, 566));
    vh.hideLoading()
  });
}

// 渲染图片
const IMG_DOM = ref<any>(null)
const CANVAS_DOM = ref<any>(null)
const renderCanvas = async () => {
  if (!IMG_DOM.value) return;
  const ctx = CANVAS_DOM.value.getContext("2d")
  ctx.canvas.width = IMG_DOM.value.width;
  ctx.canvas.height = IMG_DOM.value.height;
  const maxSize = Math.max(IMG_DOM.value.height, IMG_DOM.value.width);
  ctx.canvas.style.height = (IMG_DOM.value.height / IMG_DOM.value.width) * 100 + '%';
  ctx.restore();
  ctx.drawImage(IMG_DOM.value, 0, 0);
  ctx.fillStyle = COLOR_VAL.value;
  ctx.globalAlpha = SLIDER_VAL.value.OPACTY_VAL[0] / 100;
  const size = (SLIDER_VAL.value.SIZE_VAL[0] * maxSize / 100);
  ctx.font = size + 'px "sans-serif"';
  ctx.textBaseline = 'middle';
  ctx.rotate(-45 * Math.PI / 180);
  const gap = size * SLIDER_VAL.value.GAP_VAL[0] / 100;
  const content = WATERMARK_VAL.value;
  if (!content.length) return;
  const limit = Math.sqrt(2 * (maxSize * maxSize));
  const breaker = ctx.measureText(content).width;
  for (let h = -maxSize, even = false; h <= limit; h += size + gap, even = !even) {
    for (let v = -maxSize - (even ? breaker / 2 : 0); v <= limit + (even ? breaker / 2 : 0); v += breaker + size) {
      ctx.fillText(content, v, h);
    }
  }
}

// 下载图片
const IMG_NAME = ref<string>('')
const IMG_TYPE = ref<string>('')
const downLoadImg = () => {
  if (!IMG_NAME.value) return
  vh.showLoading()
  CANVAS_DOM.value.toBlob(async (v: Blob) => {
    const BlobURL = URL.createObjectURL(v);
    // 重命名
    const lastDotIndex = IMG_NAME.value.lastIndexOf('.');
    const FileDownName = `${IMG_NAME.value.substring(0, lastDotIndex)}_complete.${v.type.split('/')[1]}`;
    // 创建a标签
    await new Promise((r) => setTimeout(r, 466));
    await vh.OpenURL(BlobURL, FileDownName)
    vh.hideLoading()
    // 卸载
    URL.revokeObjectURL(BlobURL);
  }, IMG_TYPE.value)
}

// 值变化事件
watch(SLIDER_VAL, () => {
  renderCanvas()
}, { deep: true })

</script>

<style scoped></style>
