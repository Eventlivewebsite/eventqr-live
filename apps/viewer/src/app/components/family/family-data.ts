export type FamilyMember = {
  id: number;
  side: "Bride" | "Groom";
  priority: number;

  name: string;
  relation: string;

  image: string;

  description: string;

  phone?: string;
  instagram?: string;

  visible: boolean;
};

const familyData: FamilyMember[] = [
  // ===========================
  // Bride Family
  // ===========================

  {
    id: 1,
    side: "Bride",
    priority: 1,

    name: "Mr. Rajesh Sharma",
    relation: "Bride's Father",

    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43b?w=900",

    description:
      "Loving father of the bride. A pillar of strength, wisdom and unconditional love.",

    phone: "",
    instagram: "",

    visible: true,
  },

  {
    id: 2,
    side: "Bride",
    priority: 2,

    name: "Mrs. Sunita Sharma",
    relation: "Bride's Mother",

    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900",

    description:
      "The heart of the family whose blessings and love make every celebration complete.",

    phone: "",
    instagram: "",

    visible: true,
  },

  {
    id: 3,
    side: "Bride",
    priority: 3,

    name: "Rahul Sharma",
    relation: "Bride's Brother",

    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900",

    description:
      "Always standing beside the bride with endless support and happiness.",

    visible: true,
  },

  // ===========================
  // Groom Family
  // ===========================

  {
    id: 4,
    side: "Groom",
    priority: 1,

    name: "Mr. Imran Khan",
    relation: "Groom's Father",

    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=900",

    description:
      "Respected father of the groom and the guiding force behind the family.",

    visible: true,
  },

  {
    id: 5,
    side: "Groom",
    priority: 2,

    name: "Mrs. Nazma Khan",
    relation: "Groom's Mother",

    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900",

    description:
      "Her love, kindness and blessings make every moment unforgettable.",

    visible: true,
  },

  {
    id: 6,
    side: "Groom",
    priority: 3,

    name: "Aamir Khan",
    relation: "Groom's Brother",

    image:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=900",

    description:
      "Sharing every joyful memory and making the celebration even more special.",

    visible: true,
  },
];

export default familyData;