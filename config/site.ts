import { SiteConfig } from '@/types/siteConfig'
import { BsGithub, BsTwitterX } from 'react-icons/bs'
import { MdEmail } from 'react-icons/md'

const baseSiteConfig = {
  name: '字节在线文转图',
  description: '字节在线文转图',
  url: 'https://starter.weijunext.com',
  ogImage: 'https://starter.weijunext.com/og.png',
  metadataBase: '/',
  keywords: ['文转图', '图片生成'],
  authors: [
    {
      name: 'Junexus',
      url: 'https://byte.ink',
      twitter: 'https://twitter.com/shadow06368306',
    },
  ],
  creator: '@weijunext',
  themeColors: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  defaultNextTheme: 'light', // next-theme option: system | dark | light
  icons: {
    icon: '/favicon.ico',
    shortcut: '/logo.png',
    apple: '/logo.png', // apple-touch-icon.png
  },
  headerLinks: [
    { name: 'twitter', href: 'https://twitter.com/shadow06368306', icon: BsTwitterX },
    // { name: 'buyMeCoffee', href: 'https://www.buymeacoffee.com/weijunext', icon: SiBuymeacoffee },
  ],
  footerLinks: [
    { name: 'email', href: 'mailto:shadowdragon4399@gmail.com', icon: MdEmail },
    { name: 'twitter', href: 'https://twitter.com/shadow06368306', icon: BsTwitterX },
    { name: 'github', href: 'https://github.com/shadowDragons', icon: BsGithub },
    // { name: 'buyMeCoffee', href: 'https://www.buymeacoffee.com/weijunext', icon: SiBuymeacoffee },
    // { name: 'juejin', href: 'https://juejin.cn/user/26044008768029', icon: SiJuejin },
    // { name: 'weChat', href: 'https://weijunext.com/make-a-friend', icon: BsWechat },
  ],
  footerProducts: [
    // { url: 'https://landingpage.weijunext.com/', name: 'Landing Page Boilerplate' },
    // { url: 'https://nextjscn.org/', name: 'Next.js 中文文档' },
    // { url: 'https://nextjs.weijunext.com/', name: 'Next.js Practice' },
    // { url: 'https://starter.weijunext.com/', name: 'Next.js Starter' },
    // { url: 'https://github.com/weijunext/indie-hacker-tools', name: 'Indie Hacker Tools' },
    // { url: 'https://weijunext.com/', name: 'J实验室' },
  ],
}

export const siteConfig: SiteConfig = {
  ...baseSiteConfig,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseSiteConfig.url,
    title: baseSiteConfig.name,
    description: baseSiteConfig.description,
    siteName: baseSiteConfig.name,
    images: [`${baseSiteConfig.url}/og.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: baseSiteConfig.name,
    description: baseSiteConfig.description,
    images: [`${baseSiteConfig.url}/og.png`],
    creator: baseSiteConfig.creator,
  },
}
