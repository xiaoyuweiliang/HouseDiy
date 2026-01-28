module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@/components": "./src/components",
            "@/config": "./src/config",
            "@/services": "./src/services",
            "@/utils": "./src/utils",
            "@/styles": "./src/styles",
            "@/hooks": "./src/hooks",
            "@/data": "./src/data",
            "@/types": "./src/types",
          },
        },
      ],
      'react-native-reanimated/plugin'
    ],
  };
};
