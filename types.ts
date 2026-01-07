
export interface LinkData {
  text: string;
  title: string;
  href: string;
  status?: number;
  type: 'internal' | 'external' | 'anchor';
}

export interface ImageData {
  src: string;
  alt: string;
  title: string;
  width?: number;
  height?: number;
  fileName: string;
}

export interface HeaderData {
  level: number;
  text: string;
  id?: string;
}

export interface LandmarkData {
  role: 'main' | 'banner' | 'contentinfo';
  tag: string;
  label?: string;
}

export interface AccessibilityReport {
  headers: HeaderData[];
  ariaElements: Array<{ tag: string; attributes: Record<string, string> }>;
  landmarks: LandmarkData[];
  tables: Array<{ 
    index: number; 
    role?: string; 
    caption?: string;
    hasThead: boolean;
    rows: number;
  }>;
  score: number;
  errors: string[];
}

export interface CSSAnalysis {
  detectedColors: Array<{ hex: string; count: number; sampleElements: string[] }>;
  inlineStylesCount: number;
}

export interface PageAnalysis {
  url: string;
  title: string;
  metaDescription: string;
  html: string;
  links: LinkData[];
  images: ImageData[];
  accessibility: AccessibilityReport;
  css: CSSAnalysis;
  summary: {
    linkCount: number;
    imageCount: number;
    errorCount: number;
    warningCount: number;
  };
}

export enum TabType {
  SUMMARY = 'summary',
  LINKS = 'links',
  IMAGES = 'images',
  ACCESSIBILITY = 'accessibility',
  CSS = 'css',
  SOURCE = 'source'
}
