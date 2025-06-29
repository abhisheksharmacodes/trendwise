"use client";
import { useEffect, useRef, useState } from 'react';

interface ArticleContentProps {
  content: string;
  media?: {
    images?: Array<{ url: string; alt?: string; caption?: string }>;
    videos?: Array<{ url: string; title?: string; platform?: string }>;
    tweets?: Array<{ url: string; content?: string; author?: string }>;
  };
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content, media }) => {
  const [processedContent, setProcessedContent] = useState(content);

  // Helper to trim first <h1> and first <img>
  function trimHeadingAndCoverImage(html: string): string {
    // Remove the first <h1>...</h1>
    html = html.replace(/<h1[^>]*>.*?<\/h1>/i, '');
    // Remove the first <img ...>
    html = html.replace(/<img[^>]*>/i, '');
    return html.trim();
  }

  useEffect(() => {
    if (!media) {
      setProcessedContent(trimHeadingAndCoverImage(content));
      return;
    }

    // Create a single replacement map to avoid infinite loops
    const replacements: { [key: string]: string } = {};

    // Prepare image replacements
    if (media.images && media.images.length > 0) {
      media.images.forEach((image, index) => {
        const placeholders = [
          `[IMAGE_${index}]`,
          `[IMG_${index}]`,
          `{{IMAGE_${index}}}`,
          `{{IMG_${index}}}`,
          `<!--IMAGE_${index}-->`,
          `<!--IMG_${index}-->`
        ];

        const imageHTML = `
          <div class="my-6">
            <img src="${image.url}" alt="${image.alt || ''}" class="w-full h-auto rounded-lg" />
            ${image.caption ? `<p class="text-sm text-gray-600 text-center mt-2">${image.caption}</p>` : ''}
          </div>
        `;

        placeholders.forEach(placeholder => {
          replacements[placeholder] = imageHTML;
        });
      });
    }

    // Prepare video replacements
    if (media.videos && media.videos.length > 0) {
      media.videos.forEach((video, index) => {
        const placeholders = [
          `[VIDEO_${index}]`,
          `{{VIDEO_${index}}}`,
          `<!--VIDEO_${index}-->`
        ];

        let videoHTML = '';

        if (video.platform === 'youtube') {
          const videoId = extractYouTubeId(video.url);
          if (videoId) {
            videoHTML = `
              <div class="my-6">
                <div class="relative w-full h-0 pb-[56.25%]">
                  <iframe 
                    src="https://www.youtube.com/embed/${videoId}" 
                    class="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameborder="0" 
                    allowfullscreen>
                  </iframe>
                </div>
                ${video.title ? `<p class="text-sm font-medium text-gray-900 mt-2">${video.title}</p>` : ''}
              </div>
            `;
          }
        } else if (video.platform === 'vimeo') {
          const videoId = extractVimeoId(video.url);
          if (videoId) {
            videoHTML = `
              <div class="my-6">
                <div class="relative w-full h-0 pb-[56.25%]">
                  <iframe 
                    src="https://player.vimeo.com/video/${videoId}" 
                    class="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameborder="0" 
                    allowfullscreen>
                  </iframe>
                </div>
                ${video.title ? `<p class="text-sm font-medium text-gray-900 mt-2">${video.title}</p>` : ''}
              </div>
            `;
          }
        } else {
          videoHTML = `
            <div class="my-6">
              <video controls class="w-full rounded-lg">
                <source src="${video.url}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
              ${video.title ? `<p class="text-sm font-medium text-gray-900 mt-2">${video.title}</p>` : ''}
            </div>
          `;
        }

        placeholders.forEach(placeholder => {
          replacements[placeholder] = videoHTML;
        });
      });
    }

    // Prepare tweet replacements
    if (media.tweets && media.tweets.length > 0) {
      media.tweets.forEach((tweet, index) => {
        const placeholders = [
          `[TWEET_${index}]`,
          `{{TWEET_${index}}}`,
          `<!--TWEET_${index}-->`
        ];

        const tweetHTML = `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">${tweet.author || 'Twitter User'}</p>
                <p class="text-sm text-gray-700 mt-1">${tweet.content || ''}</p>
                <a href="${tweet.url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 text-sm hover:underline mt-2 inline-block">
                  View on Twitter →
                </a>
              </div>
            </div>
          </div>
        `;

        placeholders.forEach(placeholder => {
          replacements[placeholder] = tweetHTML;
        });
      });
    }

    // Perform all replacements in a single pass
    let result = trimHeadingAndCoverImage(content);
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      // Escape special regex characters in the placeholder
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedPlaceholder, 'g');
      result = result.replace(regex, replacement);
    });

    setProcessedContent(result);

  }, [content, media]);

  // Helper functions to extract video IDs
  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  };

  return (
    <div 
      className="prose prose-lg max-w-none mb-8"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default ArticleContent; 