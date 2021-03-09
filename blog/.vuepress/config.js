module.exports = {
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