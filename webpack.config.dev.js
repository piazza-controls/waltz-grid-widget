const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");

module.exports = {
    mode: "development",
    entry: './test/main.js',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(tsx?)$/,
                loader: 'awesome-typescript-loader'
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    // options: {
                    //     sourceMap: true
                    // }
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: /node_modules\/waltz_base/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
    devtool: "none",
    devServer: {
        proxy: {
            '/tango/*': {
                target: 'http://localhost:10001',
                changeOrigin: true,
            }
        }
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: "[file].map",
            exclude: ["vendor.js", "*@waltz-controls*"],
        }),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require("@piazza-controls/waltz-shared-libs/dist/vendor-manifest.json")
        }),
        new AddAssetHtmlPlugin({
            filepath: path.resolve(__dirname, "node_modules/@piazza-controls/waltz-shared-libs/dist/vendor.js")
        }),
        new HtmlWebpackPlugin({
            minify: false,
            headHtmlSnippet: '<style>div.app-spinner {position: fixed;top:50%;left:50%;}</style >',
        }),
    ],
};