// 사이트 전체에서 쓰는 이름·주소·카테고리. 방문자는 외국인 관광객이라 문구는 영어가 기본이다.
export const site = {
  name: "Shy Kind Korean Couple",
  url: "https://shykindkoreancouple.com",
  tagline: "Quiet recommendations from a local couple in Korea.",
  description:
    "Food, things to buy and hidden places in Korea, shyly recommended by a real local couple. No sponsored lists, just where we actually go.",
};

export const categories = [
  {
    slug: "eat",
    label: "Eat",
    emoji: "🍜",
    title: "Where we actually eat",
    blurb: "The everyday food we line up for, and how to order it without panicking.",
  },
  {
    slug: "shop",
    label: "Shop",
    emoji: "🛍️",
    title: "Things we'd put in your basket",
    blurb: "Snacks, skincare and small souvenirs we buy for ourselves.",
  },
  {
    slug: "hidden",
    label: "Hidden places",
    emoji: "🌿",
    title: "Places we keep a little secret",
    blurb: "Quiet corners and local habits that guidebooks skip.",
  },
] as const;

export type Category = (typeof categories)[number];
export type CategorySlug = Category["slug"];
