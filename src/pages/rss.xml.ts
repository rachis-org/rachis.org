import { getRssString } from '@astrojs/rss';

import { SITE, METADATA } from 'astrowind:config';
import { fetchPosts, isBlogEnabled } from '~/utils/blog';
import { getPermalink } from '~/utils/permalinks';
import { getPostExcerpt } from '~/utils/post-excerpt';
import stylesheet from '../assets/rss-style.xsl';

export const GET = async () => {
  if (!isBlogEnabled) {
    return new Response(null, {
      status: 404,
      statusText: 'Not found',
    });
  }

  const posts = await fetchPosts();

  const rss = await getRssString({
    title: `${SITE.name} News`,
    description: METADATA?.description || '',
    site: import.meta.env.SITE,
    stylesheet,

    items: posts.map((post) => ({
      link: getPermalink(post.permalink, 'post'),
      title: post.title,
      description: getPostExcerpt(post),
      pubDate: post.publishDate,
    })),

    trailingSlash: SITE.trailingSlash,
  });

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
