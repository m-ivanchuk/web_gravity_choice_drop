module.exports = {
  darkMode: "class",
  content: ["./index.html", "./app.js"],
  theme: {
      extend: {
          colors: {
              "primary-container": "#ffdbe0", // pastel pink
              "on-primary-container": "#2f2d29",
              "primary": "#cbeee4", // pastel mint
              "on-primary": "#2f2d29",
              "secondary": "#cbe6f6", // pastel blue
              "tertiary": "#fef0be", // pastel yellow
              "error": "#ffb3b8", // soft red
              "surface": "#ffffff",
              "surface-container": "#faf7f2",
              "surface-container-low": "#f5f0e6",
              "surface-container-highest": "#ffffff",
              "on-surface": "#2f2d29",
              "on-surface-variant": "#615e58",
              "outline-variant": "#2f2d29",
              "background": "#faf7f2",
              "on-background": "#2f2d29",
              "line-dark": "#2f2d29",
              "pastel-mint": "#cbeee4",
              "pastel-pink": "#ffdbe0",
              "pastel-blue": "#cbe6f6",
              "pastel-yellow": "#fef0be"
          },
          fontFamily: {
              "headline": ["Fredoka", "sans-serif"],
              "body": ["Nunito", "sans-serif"],
              "label": ["Nunito", "sans-serif"]
          },
          borderWidth: {
              "3": "3px",
              "2.5": "2.5px"
          }
      }
  }
}
