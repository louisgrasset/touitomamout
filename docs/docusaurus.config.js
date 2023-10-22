/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Touitomamout Docs',
    tagline: 'An easy way to synchronize your Twitter\'s tweets to Mastodon & Bluesky posts.',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://louisgrasset.github.io',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/touitomamout/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    projectName: 'louisgrasset.github.io', // Usually your repo name.
    organizationName: 'louisgrasset', // Usually your GitHub org name / username.

    trailingSlash: false,

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    plugins: [
        require.resolve('docusaurus-lunr-search')
    ],

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: 'https://github.com/louisgrasset/touitomamout/tree/main/docs/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        navbar: {
            title: 'Touitomamout Docs',
            logo: {
                alt: 'Touitomamout Logo',
                src: 'img/logo.svg',
            },
            items: [
                ...[
                    {
                        label: 'Introduction',
                        to: '/docs/discover'
                    },
                    {
                        label: 'Get Started',
                        to: '/docs/configuration'
                    },
                    {
                        label: 'Resources',
                        to: '/docs/category/resources',
                    },
                ].map(e => ({
                    ...e,
                    position: 'left',
                })),
                ...[
                    {
                        href: 'https://hub.docker.com/r/louisgrasset/touitomamout',
                        label: 'Docker Hub',
                    },
                    {
                        href: 'https://github.com/louisgrasset/touitomamout',
                        label: 'GitHub',
                    },
                    {
                        href: 'https://github.com/sponsors/louisgrasset',
                        label: 'Sponsor',
                    },].map(e => ({
                    ...e,
                    position: 'right',
                })),
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Introduction',
                            to: '/docs/discover',
                        },
                        {
                            label: 'Configuration',
                            to: '/docs/category/configuration',
                        },
                        {
                            label: 'Resources',
                            to: '/docs/category/resources',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'GitHub',
                            href: 'https://github.com/facebook/docusaurus',
                        },
                        {
                            label: 'Docker Hub',
                            href: 'https://hub.docker.com/r/louisgrasset/touitomamout',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Touitomamout. Built with Docusaurus.`,
        },
        prism: {
            theme: lightCodeTheme,
            darkTheme: darkCodeTheme,
        },
        docs: {
            sidebar: {
                hideable: true,
            }
        }
    }),
};

module.exports = config;
