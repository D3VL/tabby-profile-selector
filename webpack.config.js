const path = require('path')

module.exports = {
    target: 'node',
    entry: 'src/index.ts',
    // devtool: 'source-map',
    context: __dirname,
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        pathinfo: true,
        libraryTarget: 'umd',
        devtoolModuleFilenameTemplate: 'webpack-tabby-profile-selector:///[resource-path]',
    },
    resolve: {
        modules: ['.', 'src', 'node_modules'].map(x => path.join(__dirname, x)),
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    configFile: path.resolve(__dirname, 'tsconfig.json'),
                },
            },
            {
                test: /\.scss/,
                use: ["to-string-loader", "style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        esModule: false,
                    },
                }],
            }
        ]
    },
    externals: [
        'fs',
        'ngx-toastr',
        /^rxjs/,
        /^@angular/,
        /^@ng-bootstrap/,
        /^tabby-/,
    ]
}