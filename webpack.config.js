
module.exports = {
  // ... other configurations (if you have them, otherwise this can be minimal)
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      // ... other rules (if needed)
    ],
  },
  // Ensure you have other necessary Webpack configurations if this file is to be used standalone
  // For example, entry, output, mode, etc.
  // If this is just for Next.js, Next.js handles these.
};
