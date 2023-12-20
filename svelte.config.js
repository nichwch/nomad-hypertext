import adapter from "@ptkdev/sveltekit-electron-adapter";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      fallback: "index.html",
    }),

    paths: {
      base: "",
    },
    // prerender: {
    //   entries: ["/", "/note", "/about", "/pagenotfound", "/appsettings"],
    // },
  },
};

export default config;
