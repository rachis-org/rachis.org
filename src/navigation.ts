// Shared destinations for the thin network bar. A distribution site can render
// <NavBanner currentSite="qiime2" /> to use the breadcrumb and sibling switcher.
export const networkSites = [
  { id: 'rachis', text: 'Rachis', href: 'https://rachis.org' },
  { id: 'qiime2', text: 'QIIME 2', href: 'https://qiime2.org' },
  { id: 'moshpit', text: 'MOSHPIT', href: 'https://moshpit.qiime2.org' },
] as const;

// Shared utilities stay visible on both the framework and distribution sites.
export const networkUtilityLinks = [
  { text: 'Library', href: 'https://library.qiime2.org' },
  { text: 'View', href: 'https://view.qiime2.org' },
  { text: 'Forum', href: 'https://forum.qiime2.org' },
] as const;

// Shared learning and community destinations.
const learnLinks = [
  { text: 'Developer Docs', href: 'https://develop.qiime2.org/en/stable/', external: true },
  { text: 'Marker Gene (Amplicon) Analysis', href: 'https://amplicon-docs.qiime2.org', external: true },
  { text: 'Metagenome Analysis', href: 'https://moshpit.qiime2.org', external: true },
  { text: 'The Stacks: all documentation', href: 'https://library.qiime2.org/docs', external: true },
];

const communityLinks = [
  {
    text: 'Getting Involved',
    href: 'https://use.qiime2.org/en/stable/how-to-guides/get-involved.html',
    external: true,
  },
  { text: 'Library', href: 'https://library.qiime2.org', external: true },
  { text: 'Forum', href: 'https://forum.qiime2.org', external: true },
];

const codeOfConductLink = {
  text: 'Code of Conduct',
  href: 'https://github.com/qiime2/.github/blob/main/CODE-OF-CONDUCT.md',
  external: true,
};

export const headerData = {
  links: [
    { text: 'Why Rachis', href: '/#why-rachis' },
    { text: 'Build', href: '/#build' },
    { text: 'Impact', href: '/#impact' },
    { text: 'Learn', links: learnLinks },
    { text: 'Community', links: [...communityLinks, codeOfConductLink] },
  ],
  actions: [{ text: 'Developer docs', variant: 'primary' as const, href: 'https://develop.qiime2.org/en/stable/' }],
};

export const footerData = {
  links: [
    {
      title: 'For Developers',
      links: [
        { text: 'Developer documentation', href: 'https://develop.qiime2.org/en/stable/' },
        { text: 'Plugin tutorial', href: 'https://develop.qiime2.org/en/stable/plugins/tutorials/intro.html' },
        { text: 'Plugin API', href: 'https://develop.qiime2.org/en/stable/plugins/references/api/intro.html' },
        { text: 'Result archives', href: 'https://develop.qiime2.org/en/stable/framework/explanations/archives.html' },
        { text: 'Source code', href: 'https://github.com/rachis-org/rachis' },
      ],
    },
    {
      title: 'Learn',
      links: [
        ...learnLinks,
        { text: 'Videos', href: 'https://library.qiime2.org/videos' },
        { text: 'Data resources', href: 'https://library.qiime2.org/data-resources' },
        { text: 'Plugin library', href: 'https://library.qiime2.org/plugins' },
      ],
    },
    {
      title: 'Community',
      links: [
        ...communityLinks,
        { text: 'Announcements', href: 'https://forum.qiime2.org/c/announcements/8' },
        { text: 'User support', href: 'https://forum.qiime2.org/c/user-support/6' },
        { text: 'Developer discussion', href: 'https://forum.qiime2.org/c/dev-discussion/7' },
        { text: 'Community contributions', href: 'https://forum.qiime2.org/c/community-contributions/15' },
      ],
    },
    {
      title: 'Network',
      links: [
        { text: 'QIIME 2', href: 'https://qiime2.org' },
        { text: 'MOSHPIT', href: 'https://moshpit.qiime2.org' },
        { text: 'QIIME 2 View', href: 'https://view.qiime2.org' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Software license', href: 'https://github.com/rachis-org/rachis/blob/dev/LICENSE' },
    { text: 'Contributing', href: 'https://github.com/qiime2/.github/blob/main/CONTRIBUTING.md' },
    codeOfConductLink,
  ],
  socialLinks: [],
  footNote: `
    Site maintained by the <a class="underline" href="https://cap-lab.bio/">Caporaso Lab</a>.
    Original <a class="underline" href="https://github.com/onwidget/astrowind">template</a> by onWidget.
  `,
};
