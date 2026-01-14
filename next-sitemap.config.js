/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://hongbao.elvinn.wiki',
  generateRobotsTxt: true,
  // 排除不需要被搜索引擎收录的页面
  exclude: ['/api/*', '/sign-in/*', '/sign-up/*', '/pricing/success'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/sign-in/', '/sign-up/', '/pricing/success'],
      },
    ],
  },
}
