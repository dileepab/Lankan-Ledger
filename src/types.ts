export interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: 'Politics' | 'Economy' | 'World' | 'Sports' | 'Tech' | 'Culture' | 'Agri-Business' | 'Energy';
  tags: string[];
  publishedAt: string;
  author: string;
  image: string;
  imageCaption?: string;
  sinhalaMapping?: string;
  tamilMapping?: string;
  status: 'Draft' | 'Scheduled' | 'Published';
  views: number;
  readTime: string;
}

export type ViewMode = 'public' | 'cms';
