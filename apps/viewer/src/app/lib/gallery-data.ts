export type GalleryItem = {
  id: number;
  image: string;
  views: string;
  likes: number;
  liked: boolean;
  comments: number;
  height: string;
  category: string;
};

export const galleryData: Record<string, GalleryItem[]> = {
  default: [],

  "wedding-stage": [],

  "floral-decoration": [],

  lighting: [],

  entrance: [],

  dining: [],

  "selfie-booth": [],

  "reception-hall": [],
};