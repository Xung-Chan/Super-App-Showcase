module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@navigation': './src/core/navigation',
          '@api': './src/core/api',
          '@post': './src/features/post',
        },
      },
    ],
  ],
};
