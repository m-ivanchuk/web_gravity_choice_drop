module.exports = {
  darkMode: "class",
  content: ["./index.html", "./app.js"],
  theme: {
      extend: {
          colors: {
              "primary": "#a90097", // Neon Pink
              "on-primary": "#ffffff",
              "primary-container": "#d300bd",
              "on-primary-container": "#fffbff",
              "secondary": "#5400c3", // Electric Purple
              "on-secondary": "#ffffff",
              "secondary-container": "#7000ff",
              "on-secondary-container": "#ddcdff",
              "tertiary": "#00666d", // Cyan
              "on-tertiary": "#ffffff",
              "tertiary-container": "#00818a",
              "on-tertiary-container": "#f5feff",
              "error": "#ba1a1a",
              "error-container": "#ffdad6",
              "on-error-container": "#93000a",
              "surface": "#fcf9f8",
              "on-surface": "#1c1b1b",
              "on-surface-variant": "#574050",
              "outline": "#8a6f81",
              "outline-variant": "#ddbed1",
              "background": "#fcf9f8",
              "on-background": "#1c1b1b",
              "surface-dim": "#dcd9d9",
              "surface-bright": "#fcf9f8",
              "surface-container": "#f0eded",
              "surface-container-low": "#f6f3f2",
              "surface-container-high": "#eae7e7",
              "surface-container-highest": "#e5e2e1",
              "primary-fixed": "#ffd7f0",
              "secondary-fixed": "#e9ddff",
              "tertiary-fixed": "#7df4ff",
              "on-tertiary-fixed": "#002022",
              "on-primary-fixed": "#3a0033",
              "on-secondary-fixed": "#23005b",
              "line-dark": "#1c1b1b"
          },
          fontFamily: {
              "headline": ["Bricolage Grotesque", "sans-serif"],
              "body": ["Plus Jakarta Sans", "sans-serif"],
              "label": ["Space Grotesk", "sans-serif"]
          },
          borderWidth: {
              "3": "3px",
              "2.5": "2.5px"
          }
      }
  }
}
