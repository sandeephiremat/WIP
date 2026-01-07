
import { PageAnalysis, LinkData, ImageData, HeaderData, AccessibilityReport, CSSAnalysis, LandmarkData } from '../types';

export const analyzeUrl = async (inputUrl: string): Promise<PageAnalysis> => {
  // 1. Normalize URL
  let url = inputUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  let html = '';

  // Helper to fetch with timeout
  const fetchWithTimeout = async (resource: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000); // 10s timeout
    try {
      const response = await fetch(resource, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  // 2. Fetch Logic with Multiple Fallbacks
  const strategies = [
    // Strategy 1: AllOrigins (JSONP-like) - reliable for text
    async () => {
      const response = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}&disableCache=true`);
      if (!response.ok) throw new Error(`AllOrigins status: ${response.status}`);
      const data = await response.json();
      if (!data.contents) throw new Error('AllOrigins returned no content');
      return data.contents;
    },
    // Strategy 2: CodeTabs - good raw proxy
    async () => {
      const response = await fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(`CodeTabs status: ${response.status}`);
      return await response.text();
    },
    // Strategy 3: CorsProxy - fallback
    async () => {
      const response = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(`CorsProxy status: ${response.status}`);
      return await response.text();
    }
  ];

  let lastError;
  for (const strategy of strategies) {
    try {
      html = await strategy();
      if (html && html.trim().length > 0) break;
    } catch (e) {
      console.warn('Proxy strategy failed, trying next...', e);
      lastError = e;
    }
  }

  if (!html || html.trim().length === 0) {
    throw new Error('Unable to access this URL. The site may be blocking automated access or proxies. Please check the URL and try again.');
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Basic Info
    const title = doc.title || 'No Title Found';
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'No meta description found.';

    // Extract Links
    const rawLinks = Array.from(doc.querySelectorAll('a'));
    const links: LinkData[] = rawLinks.map(a => {
      const href = a.getAttribute('href') || '';
      let type: 'internal' | 'external' | 'anchor' = 'external';
      if (href.startsWith('#')) type = 'anchor';
      else if (href.startsWith('/') || href.includes(url)) type = 'internal';

      return {
        text: a.innerText.trim() || '(Empty Text)',
        title: a.getAttribute('title') || '',
        href: href,
        type: type,
        status: 200 // Default, would need server-side HEAD requests for real status
      };
    });

    // Extract Images
    const rawImages = Array.from(doc.querySelectorAll('img'));
    const images: ImageData[] = rawImages.map(img => {
      const src = img.getAttribute('src') || '';
      let fullSrc = src;
      try {
        // Handle relative URLs
        fullSrc = src.startsWith('http') ? src : new URL(src, url).href;
      } catch (e) {
        // fallback if URL construction fails
        fullSrc = src; 
      }
      
      return {
        src: fullSrc,
        alt: img.getAttribute('alt') || '',
        title: img.getAttribute('title') || '',
        fileName: src.split('/').pop()?.split('?')[0] || 'unknown',
      };
    });

    // Accessibility & Headers
    const rawHeaders = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const headers: HeaderData[] = rawHeaders.map(h => ({
      level: parseInt(h.tagName.substring(1)),
      text: h.textContent?.trim() || ''
    }));

    // Landmarks Detection
    const landmarks: LandmarkData[] = [];
    const landmarkConfigs = [
      { role: 'main', selector: '[role="main"], main' },
      { role: 'banner', selector: '[role="banner"], header' },
      { role: 'contentinfo', selector: '[role="contentinfo"], footer' }
    ] as const;

    const processedLandmarks = new Set<Element>();

    landmarkConfigs.forEach(({ role, selector }) => {
      const found = doc.querySelectorAll(selector);
      found.forEach(el => {
        if (!processedLandmarks.has(el)) {
          landmarks.push({
            role,
            tag: el.tagName.toLowerCase(),
            label: el.getAttribute('aria-label') || undefined
          });
          processedLandmarks.add(el);
        }
      });
    });

    const ariaElements = Array.from(doc.querySelectorAll('*'))
      .filter(el => Array.from(el.attributes).some(attr => attr.name.startsWith('aria-') || attr.name === 'role'))
      .map(el => {
        const attrs: Record<string, string> = {};
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('aria-') || attr.name === 'role') {
            attrs[attr.name] = attr.value;
          }
        });
        return { tag: el.tagName.toLowerCase(), attributes: attrs };
      });

    const tables = Array.from(doc.querySelectorAll('table')).map((table, idx) => ({
      index: idx + 1,
      role: table.getAttribute('role') || undefined,
      caption: table.querySelector('caption')?.textContent || undefined,
      hasThead: !!table.querySelector('thead'),
      rows: table.querySelectorAll('tr').length
    }));

    // Header Logic Check
    const errors: string[] = [];
    if (headers.filter(h => h.level === 1).length > 1) errors.push('Multiple H1 tags found.');
    if (headers.length > 0 && headers[0].level !== 1) errors.push('Page does not start with an H1.');
    
    for (let i = 1; i < headers.length; i++) {
      if (headers[i].level > headers[i - 1].level + 1) {
        errors.push(`Header skip detected: H${headers[i-1].level} followed by H${headers[i].level}`);
      }
    }
    
    if (landmarks.filter(l => l.role === 'main').length === 0) errors.push('No "main" landmark detected.');
    if (landmarks.filter(l => l.role === 'main').length > 1) errors.push('Multiple "main" landmarks detected.');

    // Check for empty aria-labels
    const emptyAriaLabels = ariaElements.filter(el => 
      Object.keys(el.attributes).includes('aria-label') && 
      (!el.attributes['aria-label'] || el.attributes['aria-label'].trim() === '')
    );
    
    if (emptyAriaLabels.length > 0) {
      errors.push(`Critical: Found ${emptyAriaLabels.length} element(s) with empty 'aria-label' attribute.`);
    }

    const accessibility: AccessibilityReport = {
      headers,
      ariaElements,
      landmarks,
      tables,
      score: Math.max(0, 100 - (errors.length * 10)),
      errors
    };

    // CSS Analysis (Simulated for internal/inline)
    const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const styleTags = Array.from(doc.querySelectorAll('style'));
    const allCSS = styleTags.map(s => s.textContent).join(' ') + 
                   Array.from(doc.querySelectorAll('[style]')).map(el => el.getAttribute('style')).join(' ');
    
    const colorMatches = allCSS.match(colorRegex) || [];
    const colorMap: Record<string, number> = {};
    colorMatches.forEach(c => {
      const color = c.toUpperCase();
      colorMap[color] = (colorMap[color] || 0) + 1;
    });

    const css: CSSAnalysis = {
      detectedColors: Object.entries(colorMap).map(([hex, count]) => ({
        hex, count, sampleElements: []
      })).sort((a, b) => b.count - a.count).slice(0, 15),
      inlineStylesCount: doc.querySelectorAll('[style]').length
    };

    return {
      url,
      title,
      metaDescription: metaDesc,
      html: html,
      links,
      images,
      accessibility,
      css,
      summary: {
        linkCount: links.length,
        imageCount: images.length,
        errorCount: errors.length,
        warningCount: images.filter(i => !i.alt).length + links.filter(l => !l.text).length
      }
    };
  } catch (error) {
    console.error('Crawl Error:', error);
    throw error;
  }
};
