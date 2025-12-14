import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Adamo SDK',
  tagline: 'Low-latency robot teleoperation over WebRTC',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.adamohq.com',
  baseUrl: '/',

  organizationName: 'adamohq',  // Your GitHub org/username
  projectName: 'adamo-monorepo', // Your repo name

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../packages/core/src/index.ts'],
        tsconfig: '../packages/core/tsconfig.json',
        out: 'docs/api',
        readme: 'none',
        excludePrivate: true,
        excludeProtected: true,
        excludeInternal: true,
      },
    ],
    [
      'docusaurus-plugin-llms',
      {
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        title: 'Adamo SDK Documentation',
        description: 'Low-latency robot teleoperation SDK',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Docs at root
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/adamohq/adamo-monorepo/tree/main/website/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/adamo-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Adamo',
      items: [
        {
          href: 'https://github.com/adamohq/adamo-monorepo',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/getting-started',
            },
            {
              label: 'Guides',
              to: '/guides/video-streaming',
            },
          ],
        },
        {
          title: 'Packages',
          items: [
            {
              label: '@adamo-tech/core',
              to: '/',
            },
            {
              label: '@adamo-tech/react',
              to: '/react/overview',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/adamohq/adamo-monorepo',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Adamo.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['bash', 'typescript', 'tsx'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
