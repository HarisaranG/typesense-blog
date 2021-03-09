module.exports = {
    // base: 'typesense-blog',
    title: 'Typesense Blog',
    description: 'Mini Blog Website',
    themeConfig: {
    },
    configureWebpack: {
    resolve: {
            alias: {
            '@alias': './.vuepress/public/images'
            }
        }
    }
}