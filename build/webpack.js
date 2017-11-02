const { join, resolve } = require('path')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
const utils = require('./utils')

var entries = utils.getEntries('./src/pug/pages/', 'js') // Obtain entry js file
var chunks = Object.keys(entries)

// define path
const buildPath = path.join(__dirname, '../dist')
const buildStylePath = path.join(__dirname, '../dist/assets/style')
const buildImgPath = path.join(__dirname, '../dist/assets/images')
const imgPath = path.join(__dirname, '../src/images')


const config = {
    entry: entries,
    output: {
        path: resolve(__dirname, buildPath),
        filename: 'assets/js/[name].js',
        publicPath: '/',
        chunkFilename: '[id].js'
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            Images: join(__dirname, '../src/images/'),
            Pages: join(__dirname, '../src/pug/pages'),
            Source: join(__dirname, '../src'),
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        'postcss-loader'
                    ]
                })
            },
            {
                test: /\.pug/,
                use: [
                    { loader: 'html-loader' },
                    { loader: 'pug-html-loader', options: { pretty: true }}
                ]
            },
            {
                test: /\.(png|gif|jpg|svg)$/,
                include: imgPath,
                use: [
                    { loader: 'url-loader?limit=51200&name=assets/images/[name].[ext]' },
                    { loader: 'image-webpack-loader?{optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}, mozjpeg: {quality: 70}}' }
                ]
            }
        ]
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        // Extraction vendor icnludes 3d libraries from node_modules
        new CommonsChunkPlugin({
            name: 'vendor',
            filename: 'assets/js/vendor.js',
            minChunks (module, count) {
                var context = module.context
                return context && context.indexOf('node_modules') >= 0
            }
        }),
        // Extraction common module
        new CommonsChunkPlugin({
            name: 'common', // The name of the common module
            filename: 'assets/js/common.js',
            chunks: chunks,  // chunks need to extract module
            minChunks: chunks.length
        }),
        new ExtractTextPlugin({
            filename: 'assets/css/styles.min.css',
            allChunks: true
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                safe: true,
            },
        })

    ],
    devtool: '#eval-source-map'
}

module.exports = config


// Add webpack-hot-middleware/client
Object.keys(config.entry).forEach(key => {
    config.entry[key] = [
        path.join(__dirname, 'dev-client.js'),
        config.entry[key]
    ]
})

if (process.env.NODE_ENV === 'production') {
    // minimize webpack output
    module.exports.stats = {
        // Add children information
        children: false,
        // Add chunk information (setting this to `false` allows for a less verbose output)
        chunks: false,
        // Add built modules information to chunk information
        chunkModules: false,
        chunkOrigins: false,
        modules: false,
        maxModules: 0
    }
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ])
}

var pages = utils.getEntries('./src/pug/pages/', 'pug')
for (var pathname in pages) {
    // Configured to generate the html file, define paths, etc.
    var conf = {
        filename: pathname + '.html', // html output pathname
        template: pages[pathname], // Template path
        inject: false,              // js insertion
        // minify: {
        //     removeComments: true,
        //     minifyJS: true,
        // },
    };
    if (pathname in config.entry) {
        conf.favicon = imgPath + '/favicon.png';
        conf.chunks = ['common', 'vendor', pathname];
        conf.inject = true;
        conf.hash = true;
    }
    config.plugins.push(new HtmlWebpackPlugin(conf))
}
