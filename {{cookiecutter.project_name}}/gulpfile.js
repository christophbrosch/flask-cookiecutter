'use strict';

const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const spawn = require('child_process').spawn;
const sass = require('gulp-sass')(require('sass'));
const webpack = require('webpack-stream');
const mode = require('gulp-mode')({
    modes: ['production', 'development'],
    default: 'development',
});
const reload = browserSync.reload;

const APP_NAME = '{{cookiecutter.project_name_us}}'

const isProduction = mode.production();

/* Builds minified css from scss source files */
function scss() {
    return gulp.src(`${APP_NAME}/static/scss/style.scss`)
        .pipe(mode.production(sass({outputStyle: `compressed`}).on(`error`, sass.logError)))
        .pipe(mode.development(sass().on(`error`, sass.logError)))
        .pipe(gulp.dest(`${APP_NAME}/static/css/`));
  };

/* Builds bundled, uglified and minified js from js source files */
function javascript() {
        return gulp.src(`${APP_NAME}/static/js/index.js`)
        .pipe(
            webpack({
                mode: isProduction ? 'production' : 'development',
                output: {
                    filename:'index.bundle.js',
                    library: 'EntryPoint',
                },

                resolve: {
                    // see below for an explanation
                    // alias: {
                    //   svelte: path.resolve('node_modules', 'svelte')
                    // },
                    extensions: ['.mjs', '.js', '.svelte'],
                    mainFields: ['svelte', 'browser', 'module', 'main']
                },
                
                module: {
                    rules: [
                      {
                        test: /\.(html|svelte)$/,
                        use: 'svelte-loader'
                      },
                      {
                        // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
                        test: /node_modules\/svelte\/.*\.mjs$/,
                      }
                    ]
                  }
                })
            )
            // .pipe(uglify())
            .pipe(gulp.dest(`${APP_NAME}/static/js/dist/`))
}

/* Runs development server */
function runServer(callback) {
    const cmd = spawn('flask', ['run', '--reload'], {stdio: 'inherit', env: {...process.env, 'FLASK_APP': `${APP_NAME}/app.py`}});

    cmd.on('error', (err) => {
        console.log(err);
    });
    cmd.on('close', (code) => {
        console.log('runServer exited with code ' + code);
        callback(code);
    });
}

/* Initializes the BrowserSync development server which proxies the django development server 
   to watch for changing files and automaticly reloading the page */
function initBrowserSync() {
    setTimeout(() => {
        browserSync.init(
            [
                `${APP_NAME}/static/css/*.css`,
                `${APP_NAME}/static/js/*.js`,
                `${APP_NAME}/static/**/templates/*.html`,
            ], {
                proxy: 'localhost:5000',
            }
        )
    }, 2000);
}

/* Watch function contains files which on change trigger the browsersync page reload */
function watch() {
    gulp.watch([`${APP_NAME}/static/scss/*.scss`, `${APP_NAME}/static/scss/**/*.scss`], gulp.series(`scss`)).on(`change`, reload);
    gulp.watch([`${APP_NAME}/static/js/*.js`, 
                `${APP_NAME}/static/js/*.js`,
                `${APP_NAME}/static/js/*.svelte`,
                `!${APP_NAME}/static/js/dist/*`], gulp.series(`javascript`)).on(`change`, reload);
    gulp.watch([`${APP_NAME}/templates/*.html`, `${APP_NAME}/templates/**/*.html`]).on('change', reload);
};

const build = gulp.parallel(
    scss,
    javascript,
);

const dev = gulp.parallel(
    runServer,
    initBrowserSync,
    watch,
);

exports.javascript = javascript;
exports.scss = scss;
exports.build = build;
exports.dev = dev;
exports.run = runServer;