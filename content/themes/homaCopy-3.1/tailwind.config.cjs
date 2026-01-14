/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.hbs", "./partials/**/*.hbs", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        0: "var(--bg-color-0)",
        1: "var(--bg-color-1)",
        b0: "var(--border-color-0)",
        accent: "var(--accent-color)",
        muted: "var(--text-muted)",
      },
      fontSize: {
        h1: "var(--font-size-h1)",
        h2: "var(--font-size-h2)",
        h3: "var(--font-size-h3)",
        h4: "var(--font-size-h4)",
        h5: "var(--font-size-h5)",
        h6: "var(--font-size-h6)",
        base: "var(--font-size-base)",
        sm: "var(--font-size-s)",
        xs: "var(--font-size-xs)",
      },
      spacing: {
        header: "var(--site-header-height)",
        "page-x": "var(--content-padding-x)",
        "grid-x": "var(--content-grid-gap-x)",
        "grid-y": "var(--content-grid-gap-y)",
      },
      maxWidth: {
        content: "var(--content-max-width)",
        post: "var(--post-content-max-width)",
      },
      borderRadius: {
        sm: "var(--border-radius-0)",
        md: "var(--border-radius-1)",
        lg: "var(--border-radius-2)",
      },
      lineHeight: {
        h1: "var(--line-height-h1)",
        h2: "var(--line-height-h2)",
        h3: "var(--line-height-h3)",
        h4: "var(--line-height-h4)",
        h5: "var(--line-height-h5)",
        h6: "var(--line-height-h6)",
        base: "var(--line-height-base)",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--text-color-0)",
            "--tw-prose-headings": "var(--text-color-0)",
            "--tw-prose-lead": "var(--text-color-1)",
            "--tw-prose-links": "var(--accent-color)",
            "--tw-prose-bold": "var(--text-color-0)",
            "--tw-prose-counters": "var(--text-color-1)",
            "--tw-prose-bullets": "var(--text-color-1)",
            "--tw-prose-hr": "var(--border-color-0)",
            "--tw-prose-quotes": "var(--text-color-0)",
            "--tw-prose-quote-borders": "var(--border-color-0)",
            "--tw-prose-captions": "var(--text-muted)",
            "--tw-prose-code": "var(--text-color-0)",
            "--tw-prose-pre-code": "var(--text-color-0)",
            "--tw-prose-pre-bg": "var(--pre-background-color)",
            "--tw-prose-th-borders": "var(--border-color-0)",
            "--tw-prose-td-borders": "var(--border-color-0)",
            maxWidth: null,
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")]
};
