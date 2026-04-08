<script setup lang="ts">
import 'animate.css';
import { defineAsyncComponent } from 'vue';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue';

import ObserveIntersection from '@/components/ObserveIntersection.vue';
import AppNav from '@/components/AppNav.vue';
import StorySlide from '@/components/StorySlide.vue';

import ViteSvg from '@/assets/vite.svg';
import VueSvg from '@/assets/vue.svg';
import TailwindSvg from '@/assets/tailwind.svg';
import { scrollToId } from '@/helpers';

const introLinks = [
  { link: 'https://vite.dev', label: 'Vite', icon: ViteSvg },
  { link: 'https://vuejs.org', label: 'Vue.js', icon: VueSvg },
  { link: 'https://tailwindcss.com', label: 'Tailwind CSS', icon: TailwindSvg },
];

const stack = [
  { title: 'Framework', description: 'Vue 3 (Options & Composition API)' },
  { title: 'Languages', description: 'JavaScript, TypeScript, HTML, CSS' },
  { title: 'UI & Styling', description: 'Tailwind CSS, PrimeVue, HeadlessUI' },
  { title: 'State Management', description: 'Pinia' },
  { title: 'Data / APIs', description: 'Axios, Apollo (GraphQL)' },
  { title: 'IDEs', description: 'PhpStorm, VS Code' },
  { title: 'Version Control', description: 'Git, GitHub, GitLab, Bitbucket' },
  { title: 'Package Managers', description: 'npm, pnpm, yarn' },
  { title: 'Code Quality & Tooling', description: 'Prettier, ESLint, Vitest' },
  { title: 'Project Management Tools', description: 'Jira, Monday, Toggl' },
  { title: 'Additional Experience', description: 'Occasional React projects' },
  { title: 'Backend (occasional exposure)', description: 'Node.js, MongoDB, MySQL, Laravel' },
];

const swiperOptions = {
  navigation: true,
  pagination: true,
  'pagination-type': 'fraction',
  'space-between': 20,
  'slides-per-view': 1,
};

const swiperBreakPoints = { 768: { slidesPerView: 1.5 }, 1500: { slidesPerView: 2.3 } };

const loadSwiper = async () => {
  const swiper = await import('swiper/element/bundle');
  swiper.register();
};

const AsyncDataIntegration = defineAsyncComponent(() => import('@/components/DataIntegration.vue'));
</script>

<template>
  <AppNav />

  <header
    class="bg-indigo-50 bg-[url('@/assets/bg-pattern.png')] bg-size-[60px] md:flex items-center px-8 md:px-20 pb-3 md:pb-14 pt-16 md:pt-28">
    <div class="w-1/3 mx-auto">
      <img
        class="mx-auto rounded-full aspect-square object-cover"
        src="@/assets/me.jpg"
        alt="Image of Hadas Ben Mordechai"
        width="400"
        height="400" />
    </div>
    <ObserveIntersection v-slot="{ visible }" class="md:flex-1 max-md:text-center py-5 md:ps-20">
      <h1
        class="font-bold text-2xl lg:text-4xl 2xl:text-5xl text-indigo-950"
        :class="{ 'animate__animated animate__fadeIn': visible }">
        Hadas Ben Mordechai
      </h1>
      <h2
        class="text-lg lg:text-3xl py-2 lg:py-5"
        :class="{ 'animate__animated animate__fadeIn animate__delay-1s': visible }">
        Frontend Developer
      </h2>
      <p
        class="text-sm lg:text-xl font-light"
        :class="{ 'animate__animated animate__fadeIn animate__delay-2s': visible }">
        JavaScript | TypeScript | Vue.js | Tailwind CSS
      </p>
      <div
        class="flex justify-center md:justify-start text-sm lg:text-base font-light pt-5 lg:pt-10">
        <a
          href="#stack"
          class="bg-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors rounded-lg lg:rounded-xl px-3 py-1 lg:px-5 lg:py-2.5 mx-2 md:mx-0"
          :class="{ 'animate__animated animate__fadeIn animate__delay-3s': visible }">
          Tech Stack
        </a>
        <a
          href="#contact"
          @click="scrollToId('contact')"
          class="bg-indigo-100 hover:bg-indigo-200 transition-colors rounded-lg lg:rounded-xl px-3 py-1 lg:px-5 lg:py-2.5 mx-2 md:ms-4"
          :class="{ 'animate__animated animate__fadeIn animate__delay-4s': visible }">
          Contact Me
        </a>
      </div>
    </ObserveIntersection>
  </header>

  <main>
    <section id="about">
      <h3>About me</h3>
      <h4>
        I am a <strong>Frontend Developer</strong> specializing in the
        <strong>Vue.js ecosystem</strong>.
      </h4>
      <div class="flex flex-wrap items-start">
        <div class="w-full md:w-2/3 md:pe-20 pb-5">
          <p class="pb-2">
            With a <strong>B.Sc. in Software Engineering (Graduated <i>Cum Laude</i>)</strong>,
            <br />
            I combine a strong theoretical foundation with 5 years of professional experience
            building scalable web applications.
          </p>
          <p>
            My expertise ranges from architecting high performance marketing sites to developing
            complex <strong>SaaS platforms</strong> and business portals.
            <br />
            I am dedicated to writing clean, maintainable code and building responsive, accessible
            interfaces that solve real world user problems.
          </p>
        </div>
        <ObserveIntersection
          v-slot="{ visible }"
          class="md:flex-1 grid grid-cols-3 gap-8 pb-5 max-w-2/3">
          <a
            v-for="(l, idx) in introLinks"
            :key="l.label"
            :class="[
              'aspect-square flex items-center justify-center bg-gray-100 hover:shadow-lg rounded-xl p-3 sm:p-5',
              visible ? `animate__animated animate__fadeIn animate__delay-${idx + 1}s` : '',
            ]"
            :href="l.link"
            :aria-label="l.label"
            target="_blank">
            <component :is="l.icon" class="block w-20 h-auto" aria-hidden="true" />
          </a>
        </ObserveIntersection>
      </div>

      <TabGroup>
        <TabList
          id="stack"
          class="flex justify-center text-center text-base/tight lg:text-xl pt-10 lg:pt-16">
          <template v-for="t in ['Tech Stack', 'The Story']" :key="t">
            <Tab as="template" v-slot="{ selected }">
              <button
                class="w-36 sm:w-52 md:w-72 mx-1.5 lg:mx-2 rounded-t-xl py-2 lg:py-3 transition-colors"
                :class="[
                  selected
                    ? 'bg-indigo-100'
                    : 'bg-gray-100/80 text-gray-700 hover:text-black cursor-pointer',
                ]">
                {{ t }}
              </button>
            </Tab>
          </template>
        </TabList>
        <TabPanels class="text-sm sm:text-base border-t-2 border-indigo-100 pt-4">
          <TabPanel>
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 text-center">
              <div
                v-for="t in stack"
                :key="t.title"
                class="bg-indigo-50/30 p-4 xl:py-10 rounded-xl shadow">
                <h5 class="mb-2">{{ t.title }}</h5>
                <p class="font-semibold">{{ t.description }}</p>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <ObserveIntersection once v-slot="{ visible }" @change="loadSwiper">
              <swiper-container
                v-if="visible"
                v-bind="swiperOptions"
                :breakpoints.prop="swiperBreakPoints">
                <StorySlide>
                  <template #title>The Reality</template>
                  <template #content>
                    <p>
                      Every developer eventually faces the same uncomfortable truth: your best work
                      lives behind an NDA.
                      <br />
                      Proprietary codebases, closed repos, confidential products - five years of
                      craft with nothing public to show for it.
                    </p>
                    <p>So I built this page.</p>
                    <p>
                      Not just as a placeholder, but as a deliberate exercise in using the same
                      tools I reach for every day at work, in a context I actually own.
                    </p>
                  </template>
                </StorySlide>

                <StorySlide>
                  <template #title>The Foundation</template>
                  <template #content>
                    <p>The foundation was never in question.</p>
                    <p>
                      <strong>Vue 3</strong> is where I live, I've worked across both the
                      <strong>Options API</strong> and the <strong>Composition API</strong>. This
                      page uses both intentionally, because that's the real world: you rarely get to
                      choose.
                    </p>
                    <p>
                      The languages on the page are the same ones I use daily:
                      <strong>TypeScript</strong> for anything that matters,
                      <strong>JavaScript</strong> for the occasional script or config, and of course
                      <strong>HTML</strong> and <strong>CSS</strong> as the foundation that no
                      framework fully replaces.
                    </p>
                    <p>
                      I type-checked the entire project with <strong>vue-tsc</strong> - if it
                      compiles clean, it ships clean.
                    </p>
                  </template>
                </StorySlide>

                <StorySlide>
                  <template #title>The UI/UX</template>
                  <template #content>
                    <p>For UI and styling, I made the same decisions I would on a real product:</p>
                    <ul class="list-disc ps-5">
                      <li>
                        <strong>Tailwind CSS</strong> handles layout and design tokens with speed
                        and consistency.
                      </li>
                      <li>
                        <strong>Headless UI</strong> provides fully accessible, and unopinionated
                        complex components.
                      </li>
                      <li>
                        <strong>PrimeVue</strong> steps in where a utility-first approach reaches
                        its limits: data table, multi-select filters, dialogs, and tooltips - all
                        themed with a custom indigo preset.
                      </li>
                      <li>
                        <strong>SwiperJS</strong> - a fully featured carousel, accessible and
                        touch-ready effortlessly.
                      </li>
                    </ul>
                    <p>
                      I also created a <code>ObserveIntersection</code> component around
                      <strong>VueUse</strong>'s IntersectionObserver to make easy work of my
                      animations and lazy loaded components.
                    </p>
                  </template>
                </StorySlide>

                <StorySlide>
                  <template #title>The Data</template>
                  <template #content>
                    <p>
                      Data usually is delivered from the backend via a <strong>REST</strong> of
                      <strong>GraphQL</strong> API.
                    </p>
                    <p>
                      Demonstrating real data handling on a static page is challenging, so I chose
                      to integrate the <strong>OpenRouter</strong> models endpoint, which returns a
                      live, up-to-date list of AI models.
                      <br />
                      The endpoint is publicly accessible and requires no authentication.
                    </p>
                    <p>
                      Data fetching and state management are handled through a
                      <strong>Pinia</strong> store, while PrimeVue's DataTable is used to present
                      and interact with the data.
                    </p>
                    <p>
                      Because the live API occasionally proved unreliable, I implemented a locally
                      cached fallback to ensure consistent behavior.
                    </p>
                  </template>
                </StorySlide>

                <StorySlide>
                  <template #title>The Environment</template>
                  <template #content>
                    <p>
                      I typically work with <strong>PhpStorm</strong>, whose deep framework
                      integration and refactoring capabilities make it my preferred full-featured
                      IDE in professional environments.
                    </p>
                    <p>
                      For this home project, I used <strong>VS Code</strong>.
                      <br />
                      Its lightweight setup and strong extension ecosystem made it a practical and
                      efficient alternative for independent development.
                    </p>
                    <p>
                      The project is managed with <strong>pnpm</strong>, chosen for its fast
                      installs and efficient disk space usage.
                    </p>
                  </template>
                </StorySlide>

                <StorySlide>
                  <template #title>The Tooling</template>
                  <template #content>
                    <p>Good tooling quietly enforces good habits.</p>
                    <p>
                      <strong>Vite</strong> powers the development experience with instant startup,
                      fast HMR, and a build process that stays out of the way while you focus on the
                      code itself.
                    </p>
                    <p>
                      Code quality is maintained through <strong>ESLint</strong> and
                      <strong>Prettier</strong>.
                    </p>
                    <p>
                      The project follows a standard <strong>Git</strong>-based workflow.
                      <br />
                      <strong>Husky</strong> and <strong>lint-staged</strong> run checks before
                      every commit, ensuring that only clean, formatted, and valid code reaches the
                      repository - the same guardrails I rely on in production teams.
                    </p>
                  </template>
                </StorySlide>
              </swiper-container>
            </ObserveIntersection>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>

    <section id="hobbies" class="bg-indigo-50 md:text-center">
      <h3>Outside of code</h3>
      <h4>💖 My favorite things when I'm not coding:</h4>
      <ObserveIntersection
        is="ul"
        v-slot="{ visible }"
        class="grid grid-cols-3 gap-3 sm:gap-8 max-w-180 md:mx-auto text-center">
        <li
          class="flex flex-col items-center justify-start bg-white/60 rounded-xl py-2 sm:p-5"
          :class="{ 'animate__animated animate__fadeIn': visible }">
          <svg
            class="text-indigo-500 block w-9 sm:w-14 lg:w-20 h-auto p-1.5 sm:p-2 lg:p-3"
            role="none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
          <span class="block font-normal text-sm lg:text-base pt-1 sm:pt-2">Singing</span>
          <span class="block text-[0.7rem]/tight md:text-sm px-3 pt-0.5">my #1 passion!</span>
        </li>
        <li
          class="flex flex-col items-center justify-start bg-white/60 rounded-xl py-2 sm:p-5"
          :class="{ 'animate__animated animate__fadeIn animate__delay-1s': visible }">
          <svg
            class="text-indigo-500 block w-9 sm:w-14 lg:w-20 h-auto mt-1 -mb-1 lg:mt-2 lg:-mb-2"
            role="none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 17c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1m-9-5V5.75a1.75 1.75 0 013.5 0V12m0 0V5.75a1.75 1.75 0 013.5 0V12m-12 0h15" />
          </svg>

          <span class="block font-normal text-sm lg:text-base pt-1 sm:pt-2">Swimming</span>
          <span class="block text-[0.7rem]/tight md:text-sm px-3 pt-0.5">my newest obsession</span>
        </li>
        <li
          class="flex flex-col items-center justify-start bg-white/60 rounded-xl py-2 sm:p-5"
          :class="{ 'animate__animated animate__fadeIn animate__delay-2s': visible }">
          <svg
            class="text-indigo-500 block w-9 sm:w-14 lg:w-20 h-auto p-1.5 sm:p-2 lg:p-3"
            role="none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>

          <span class="block font-normal text-sm lg:text-base pt-1 sm:pt-2">Writing</span>
          <span class="block text-[0.7rem]/tight md:text-sm px-3 pt-0.5">thoughts to paper</span>
        </li>
      </ObserveIntersection>
    </section>

    <section id="integration">
      <div class="flex flex-wrap">
        <div class="pe-[6%]">
          <h3>Data Integration & Orchestration</h3>
          <h4>A comparison of modern AI models</h4>
        </div>
        <div>
          <p class="pb-2">
            My curiosity about AI started with my college research on anomaly detection long before
            the recent hype.
            <br />
            This section serves as a technical demonstration of how I handle data orchestration on
            the frontend.
          </p>
          <p class="max-w-204 mb-6">
            Using the <strong>OpenRouter API</strong>, I built a dynamic data table to manage and
            visualize AI model metadata. To showcase enterprise level patterns within a static
            environment, I implemented <strong>reactive state management</strong> and a
            <strong>simulated server-side filtering architecture</strong>.
          </p>
        </div>
      </div>
      <ObserveIntersection once v-slot="{ visible }" class="min-h-325 md:min-h-234">
        <AsyncDataIntegration v-if="visible" />
      </ObserveIntersection>
    </section>

    <section id="contact" class="bg-indigo-50/50">
      <h3>Get in touch</h3>
      <h4>I'd love to hear from you!</h4>
      <p>
        Feel free to connect me on
        <a
          href="https://www.linkedin.com/in/hadas-ben-mordechai/"
          target="_blank"
          class="inline-block underline hover:text-blue-950">
          LinkedIn
        </a>
        or send me an email to hadasi135 at gmail.com.
      </p>
    </section>
  </main>

  <footer class="p-5 text-center text-xs lg:text-sm font-light">
    Copyright © {{ new Date().getFullYear() }} All rights reserved
    <span class="max-sm:hidden">|</span>
    <br class="sm:hidden" />
    Hadas Ben Mordechai
  </footer>
</template>

<style scoped>
swiper-container {
  --swiper-navigation-color: #808080;
  --swiper-navigation-size: 25px;
  --swiper-navigation-top-offset: 15px;
  height: auto;
}

swiper-container::part(pagination) {
  top: 4px;
  left: 0;
  right: auto;
  bottom: auto;
  display: flex;
  justify-content: flex-start;
  width: auto;
}

swiper-container::part(button-prev) {
  left: auto;
  right: 45px;
}

swiper-container::part(button-next) {
  left: auto;
  right: 0;
}
</style>
