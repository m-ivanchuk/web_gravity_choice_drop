module.exports = {
  darkMode: "class",
  content: ["./index.html", "./app.js"],
  theme: {
      extend: {
          colors: {
              "primary-container": "#bdfc00",
              "on-primary-container": "#445d00",
              "primary": "#eaffb8",
              "on-primary": "#4b6600",
              "secondary": "#00cffc",
              "tertiary": "#ff8342",
              "error": "#ff7351",
              "surface": "#0c0e17",
              "surface-container": "#171924",
              "surface-container-low": "#11131d",
              "surface-container-highest": "#222532",
              "on-surface": "#f0f0fd",
              "on-surface-variant": "#aaaab7",
              "outline-variant": "#464752",
              "background": "#0c0e17",
              "on-background": "#f0f0fd"
          },
          fontFamily: {
              "headline": ["Space Grotesk"],
              "body": ["Plus Jakarta Sans"],
              "label": ["Plus Jakarta Sans"]
          }
      }
  }
}
