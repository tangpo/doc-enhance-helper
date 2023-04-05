// vue.config.js
module.exports = {
  configureWebpack: {
    // externals: {
    //   vue: "Vue"
    // },
    module: {
      rules: [
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 4096,
                fallback: {
                  loader: 'file-loader',
                  options: {
                    name: './assets/fonts/[name].[hash:8].[ext]'
                  }
                }
              }
            }
          ]
        }
      ]
    }
  }
};
