export type FoodItem = {
  id: number;

  category: string;

  name: string;

  description: string;

  image: string;

  type: "Veg" | "Non Veg";

  popular: boolean;

  chefSpecial: boolean;

  available: boolean;

  likes: number;

  rating: number;

  spicyLevel: 0 | 1 | 2 | 3;

  calories: number;
};

export const foodData: FoodItem[] = [

  // Welcome Drinks

  {
    id: 1,
    category: "Welcome Drinks",
    name: "Fresh Lime Mojito",
    description: "Refreshing mint, lime & soda.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900",
    type: "Veg",
    popular: true,
    chefSpecial: false,
    available: true,
    likes: 348,
    rating: 4.9,
    spicyLevel: 0,
    calories: 110,
  },

  {
    id: 2,
    category: "Welcome Drinks",
    name: "Orange Mocktail",
    description: "Fresh orange with tropical flavours.",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=900",
    type: "Veg",
    popular: false,
    chefSpecial: false,
    available: true,
    likes: 201,
    rating: 4.7,
    spicyLevel: 0,
    calories: 140,
  },

  // Starters

  {
    id: 3,
    category: "Starters",
    name: "Paneer Tikka",
    description: "Grilled cottage cheese with Indian spices.",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=900",
    type: "Veg",
    popular: true,
    chefSpecial: true,
    available: true,
    likes: 692,
    rating: 5,
    spicyLevel: 2,
    calories: 290,
  },

  {
    id: 4,
    category: "Starters",
    name: "Crispy Spring Roll",
    description: "Golden fried vegetable rolls.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900",
    type: "Veg",
    popular: false,
    chefSpecial: false,
    available: true,
    likes: 281,
    rating: 4.6,
    spicyLevel: 1,
    calories: 220,
  },

  // Main Course

  {
    id: 5,
    category: "Main Course",
    name: "Shahi Paneer",
    description: "Royal creamy paneer curry.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900",
    type: "Veg",
    popular: true,
    chefSpecial: true,
    available: true,
    likes: 921,
    rating: 5,
    spicyLevel: 1,
    calories: 410,
  },

  {
    id: 6,
    category: "Main Course",
    name: "Dal Makhani",
    description: "Slow cooked buttery black lentils.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=900",
    type: "Veg",
    popular: true,
    chefSpecial: false,
    available: true,
    likes: 514,
    rating: 4.8,
    spicyLevel: 1,
    calories: 340,
  },

  // Indian Bread

  {
    id: 7,
    category: "Indian Bread",
    name: "Butter Naan",
    description: "Soft tandoor baked naan.",
    image: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=900",
    type: "Veg",
    popular: false,
    chefSpecial: false,
    available: true,
    likes: 188,
    rating: 4.5,
    spicyLevel: 0,
    calories: 180,
  },

  // Rice

  {
    id: 8,
    category: "Rice",
    name: "Veg Biryani",
    description: "Aromatic basmati rice with vegetables.",
    image: "https://images.unsplash.com/photo-1633945274309-2c16c9682a8b?w=900",
    type: "Veg",
    popular: true,
    chefSpecial: false,
    available: true,
    likes: 630,
    rating: 4.9,
    spicyLevel: 2,
    calories: 420,
  },

  // Desserts

  {
    id: 9,
    category: "Desserts",
    name: "Gulab Jamun",
    description: "Soft milk dumplings in sugar syrup.",
    image: "https://images.unsplash.com/photo-1601050690117-64b6d3f2b8d0?w=900",
    type: "Veg",
    popular: true,
    chefSpecial: false,
    available: true,
    likes: 804,
    rating: 5,
    spicyLevel: 0,
    calories: 280,
  },

  {
    id: 10,
    category: "Desserts",
    name: "Rasmalai",
    description: "Traditional Bengali sweet delight.",
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=900",
    type: "Veg",
    popular: false,
    chefSpecial: true,
    available: true,
    likes: 441,
    rating: 4.8,
    spicyLevel: 0,
    calories: 260,
  },

  // Ice Cream

  {
    id: 11,
    category: "Ice Cream",
    name: "Kulfi",
    description: "Classic Indian frozen dessert.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900",
    type: "Veg",
    popular: true,
    chefSpecial: false,
    available: true,
    likes: 391,
    rating: 4.7,
    spicyLevel: 0,
    calories: 230,
  },

  // Beverages

  {
    id: 12,
    category: "Beverages",
    name: "Masala Tea",
    description: "Traditional Indian tea.",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=900",
    type: "Veg",
    popular: false,
    chefSpecial: false,
    available: true,
    likes: 164,
    rating: 4.6,
    spicyLevel: 0,
    calories: 90,
  },

];