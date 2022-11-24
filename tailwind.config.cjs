const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			sans: ['"Nunito Sans"', ...fontFamily.sans],
			display: ["'Concert One'", ...fontFamily.sans],
			pixel: ["'Press Start 2P'"],
		},
		extend: {},
	},
	plugins: [],
};
