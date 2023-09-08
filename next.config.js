const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    /**
     * Copying the whole npm package of shiki to static/shiki because it
     * loads some files from a "cdn" in the browser
     * @see https://github.com/shikijs/shiki#specify-a-custom-root-directory
     * @see https://github.com/shikijs/shiki/issues/22#issuecomment-1364264634
     */
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(path.dirname(require.resolve("shiki")), ".."),
            to: "static/shiki/",
          },
        ],
      })
    );

    return config;
  },
};

module.exports = nextConfig;
