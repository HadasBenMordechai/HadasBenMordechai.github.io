<template>
  <swiper-slide class="mt-12 bg-indigo-50/30 shadow px-2 py-3 lg:px-5 lg:py-8 rounded-xl h-auto">
    <div class="lg:text-lg font-normal pb-2">
      <slot name="title" />
    </div>
    <div class="space-y-2">
      <slot name="content" />
    </div>
  </swiper-slide>
</template>
