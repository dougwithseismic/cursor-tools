module.exports = {
  source: ["package.json", "apps/*/package.json"],
  versionGroups: [
    {
      label: "Use workspace TypeScript version",
      packages: ["**"],
      dependencies: ["typescript"],
      isIgnored: false,
    },
    {
      label: "Use workspace React version",
      packages: ["**"],
      dependencies: ["react", "react-dom", "@types/react", "@types/react-dom"],
      isIgnored: false,
    },
  ],
  semverGroups: [
    {
      range: "",
      dependencies: ["@cursor-tools/**"],
      packages: ["**"],
    },
  ],
};
