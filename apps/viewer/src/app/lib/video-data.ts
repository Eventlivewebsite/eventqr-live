export type VideoItem = {
  id: number;
  title: string;
  type: string; // Drawer Category
  category: string; // Wedding / Haldi / Mehendi etc.
  thumbnail: string;
  video: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  favorite: boolean;
};

export const videos: VideoItem[] = [
  {
    id: 1,
    title: "Wedding Stage Highlights",
    type: "Wedding Stage",
    category: "Wedding",
    thumbnail:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    video:
      "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "04:32",
    views: 2456,
    likes: 421,
    comments: 35,
    favorite: true,
  },

  {
    id: 2,
    title: "Wedding Stage Haldi",
    type: "Wedding Stage",
    category: "Haldi",
    thumbnail:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200",
    video:
      "https://www.w3schools.com/html/movie.mp4",
    duration: "03:18",
    views: 1804,
    likes: 276,
    comments: 22,
    favorite: false,
  },

  {
    id: 3,
    title: "Floral Decoration",
    type: "Floral Decoration",
    category: "Wedding",
    thumbnail:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200",
    video:
      "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "05:10",
    views: 3120,
    likes: 540,
    comments: 61,
    favorite: true,
  },

  {
    id: 4,
    title: "Reception Floral",
    type: "Floral Decoration",
    category: "Reception",
    thumbnail:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200",
    video:
      "https://www.w3schools.com/html/movie.mp4",
    duration: "06:45",
    views: 4521,
    likes: 812,
    comments: 94,
    favorite: false,
  },

  {
    id: 5,
    title: "Lighting Ceremony",
    type: "Lighting",
    category: "Wedding",
    thumbnail:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200",
    video:
      "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "02:59",
    views: 2780,
    likes: 468,
    comments: 42,
    favorite: false,
  },

  {
    id: 6,
    title: "Lighting Reception",
    type: "Lighting",
    category: "Reception",
    thumbnail:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200",
    video:
      "https://www.w3schools.com/html/movie.mp4",
    duration: "07:12",
    views: 5211,
    likes: 963,
    comments: 118,
    favorite: true,
  },

  {
    id: 7,
    title: "Entrance Decoration",
    type: "Entrance",
    category: "Wedding",
    thumbnail:
      "https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21f?w=1200",
    video:
      "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "03:40",
    views: 1821,
    likes: 318,
    comments: 28,
    favorite: false,
  },

  {
    id: 8,
    title: "Dining Area",
    type: "Dining",
    category: "Reception",
    thumbnail:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
    video:
      "https://www.w3schools.com/html/movie.mp4",
    duration: "05:02",
    views: 2100,
    likes: 376,
    comments: 31,
    favorite: false,
  },

  {
    id: 9,
    title: "Selfie Booth Fun",
    type: "Selfie Booth",
    category: "Party",
    thumbnail:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200",
    video:
      "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "04:55",
    views: 2985,
    likes: 522,
    comments: 55,
    favorite: true,
  },

  {
    id: 10,
    title: "Reception Hall View",
    type: "Reception Hall",
    category: "Reception",
    thumbnail:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200",
    video:
      "https://www.w3schools.com/html/movie.mp4",
    duration: "05:48",
    views: 4052,
    likes: 740,
    comments: 68,
    favorite: true,
  },
];