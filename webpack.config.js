var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = [
    {
        entry: './src/renderer/ts/app.ts',
        output: {
            filename: './dist/renderer/js/app.js'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        plugins: [
            // new webpack.optimize.UglifyJsPlugin()
        ],
        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader'
                }
            ]
        },
        target: "atom"
    },
    {
        entry: {
            style: './src/renderer/scss/style.scss'
        },
        output: {
            path: path.resolve('./dist/renderer/css'),
            filename: 'style.css'
        },
        module: {
            loaders: [
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?minimize!sass-loader' })
                }
            ]
        },
        plugins: [
            new ExtractTextPlugin('style.css')
        ]
    },
    {
        entry: './src/renderer/ts/font-awesome.ts',
        output: {
            path: path.resolve('./dist/renderer/css'),
            filename: 'font-awesome.css'
        },
        module: {
            loaders: [{
                test: /\.css$/,
                //      loader: 'style-loader!css-loader?sourceMap',
                loader: ExtractTextPlugin.extract({ /*fallback: 'style-loader',*/ use: 'css-loader' })
            }, {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            }, {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=application/octet-stream"
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file-loader"
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url-loader?limit=10000&mimetype=image/svg+xml"
            }]
        },
        plugins: [
            new ExtractTextPlugin('font-awesome.css')
        ]
    }


];