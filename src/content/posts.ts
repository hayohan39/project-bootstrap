import type { CategorySlug } from "@/lib/site";

export type Post = {
  category: CategorySlug;
  slug: string;
  title: string;
  summary: string;
  /** 동네·지역. 정확한 주소는 쓰지 않는다. */
  area?: string;
  /** YYYY-MM-DD */
  updated: string;
  body: string[];
  /** "Our shy tips" 상자에 들어갈 짧은 팁 */
  tips?: string[];
};

// 프로토타입용 초안 글이다. 부부가 직접 다녀온 곳과 경험으로 다시 쓴다.
// 특정 가게 이름·가격·주소처럼 확인이 필요한 정보는 일부러 넣지 않았다.
export const posts: Post[] = [
  {
    category: "eat",
    slug: "korean-bbq-like-the-next-table",
    title: "How to eat Korean BBQ like the people at the next table",
    summary: "Scissors, lettuce, and the cold noodles nobody tells you to order at the end.",
    area: "Anywhere with a grill on the table",
    updated: "2026-10-18",
    body: [
      "We were nervous writing this one, because everyone already loves Korean BBQ. But we keep seeing visitors doing it a little bit the hard way, so here is how we quietly do it.",
      "Order meat for the table, not per person. Two portions for two people is normal, and you can always add one more. The staff will often come and cook the first round for you. Let them. Watch how they cut it with the scissors, and then it's your turn.",
      "Make a small wrap: a lettuce or perilla leaf, a piece of meat, a little ssamjang, maybe garlic that has been on the grill. One bite. It is okay if it is a big bite.",
      "When the meat is almost gone, ask for naengmyeon (cold noodles) or doenjang-jjigae with rice. This is the part locals look forward to, and it's what turns a snack into dinner.",
    ],
    tips: [
      "Most places want at least two portions. Going alone? Look for a sign that says 1인분 (one portion) is okay.",
      "Put your bag in the bench seat or under the plastic cover the staff gives you. Your clothes will smell like a happy grill.",
    ],
  },
  {
    category: "eat",
    slug: "weekday-gimbap-tteokbokki-lunch",
    title: "The gimbap and tteokbokki lunch we have on boring weekdays",
    summary: "Bunsik shops are where office workers actually eat. Cheap, fast, and very comforting.",
    area: "Near any subway exit",
    updated: "2026-10-18",
    body: [
      "If you want to eat like a local on a normal day, skip the famous restaurant and look for a small bunsik shop. Bunsik means flour-based food, but the menu is really everything: gimbap, tteokbokki, ramyeon, fried dumplings.",
      "Our usual order is one roll of gimbap and one tteokbokki to share. If it's cold outside, add eomuk (fish cake) soup. That's lunch for two.",
      "Many shops have a kiosk now. If the kiosk is only in Korean, don't worry, point at the picture and pay at the counter. They have seen it all before.",
    ],
    tips: ["Tteokbokki can be spicier than it looks. Ask for less spicy: 덜 맵게 해주세요 (deol maepge haejuseyo)."],
  },
  {
    category: "eat",
    slug: "pojangmacha-can-i-just-walk-in",
    title: "Late-night pojangmacha: can you just walk in?",
    summary: "Yes. Here is what to order and how not to feel awkward under the orange tent.",
    area: "Busy streets after 9 pm",
    updated: "2026-10-18",
    body: [
      "Pojangmacha are the little tent bars you see in dramas. In real life they are a bit smaller, a bit louder, and a lot friendlier than you might expect.",
      "Sit down, and someone will bring you a menu or just tell you what they have. Order one anju (a dish to go with drinks) per two people, and a bottle of soju or beer.",
      "Pour drinks for each other, not for yourself. It's a small thing, but people notice and smile.",
    ],
    tips: ["Bring cash just in case, even though most places take cards now."],
  },
  {
    category: "shop",
    slug: "convenience-store-snacks-we-keep-buying",
    title: "Convenience store snacks we keep buying (and one we're a bit embarrassed about)",
    summary: "Banana milk, triangle gimbap, and a 10 pm ramyeon ritual.",
    updated: "2026-10-18",
    body: [
      "Korean convenience stores are on every corner and they are honestly very good. Here is what ends up in our basket.",
      "Banana-flavored milk in the little round bottle. Everyone tries it once. We still buy it.",
      "Triangle gimbap (samgak gimbap). Pull tab 1, then pull the sides. If you get it right the seaweed stays crispy. If you don't, nobody is watching.",
      "The embarrassing one: cup ramyeon cooked with the hot water machine, eaten at the window counter at 10 pm. It is not fancy. It is perfect.",
    ],
    tips: ["Look for 1+1 or 2+1 stickers. Buy one, get one free is everywhere."],
  },
  {
    category: "shop",
    slug: "sunscreen-aisle-what-we-would-pick",
    title: "Standing in the sunscreen aisle: how we would choose",
    summary: "Sticks, creams, tone-up... a simple way to pick without reading every label.",
    updated: "2026-10-18",
    body: [
      "Korean beauty stores have a whole wall of sunscreen and it can feel like a test. We don't have one magic product, but we do have a simple way of choosing.",
      "For walking around all day, a light cream you can put on in the morning. For re-applying on top of makeup, a stick is easier. Tone-up sunscreens add a little brightness, which some people love and some don't.",
      "Use the testers on the back of your hand. If it feels sticky after a minute, it will feel sticky all day.",
    ],
    tips: ["Shops often have tax refund at the counter for visitors. Bring your passport."],
  },
  {
    category: "shop",
    slug: "small-souvenirs-that-feel-local",
    title: "Small souvenirs that don't feel like airport souvenirs",
    summary: "Things we'd actually give our own friends: snacks, stationery, kitchen bits.",
    updated: "2026-10-18",
    body: [
      "Our favorite gifts are the boring, useful things Koreans have at home. A pair of flat metal chopsticks and a long spoon. A pack of good seaweed snacks. A cute pen from a stationery shop.",
      "Supermarkets are great for this. The snack and tea aisles have nicer packaging than you would think, and it's a lot cheaper than tourist streets.",
    ],
  },
  {
    category: "hidden",
    slug: "quiet-morning-in-seochon",
    title: "A quiet morning in Seochon, before the crowds",
    summary: "The side of Gyeongbokgung where people actually live. Go early, walk slowly.",
    area: "Seochon, Seoul",
    updated: "2026-10-18",
    body: [
      "Everyone goes to the palace. Fewer people wander the small streets on its west side, where old houses, tiny cafes and neighborhood shops are mixed together.",
      "We like it best on a weekday morning, before the shops open. It is quiet enough to hear people sweeping in front of their doors.",
      "Please remember people live here. Speak softly, and don't take photos into open doors or windows.",
    ],
    tips: ["Come after breakfast, leave before lunch. That's the quiet window."],
  },
  {
    category: "hidden",
    slug: "ride-a-city-bus-to-nowhere",
    title: "Riding a city bus to nowhere, on purpose",
    summary: "Our favorite free-ish tour: sit by the window and get off when something looks nice.",
    updated: "2026-10-18",
    body: [
      "The subway is fast, but you only see tunnels. On days off, we sometimes take a bus we've never taken before, just to look out the window.",
      "Tap your transit card when you get on and again when you get off, so the transfer discount works. Press the red button before your stop.",
      "Get off somewhere that looks ordinary. Find a bakery. Walk around. Take another bus back. That's the whole plan.",
    ],
    tips: ["Avoid rush hour (around 8 am and 6 pm). The window seat is the whole point."],
  },
  {
    category: "hidden",
    slug: "jjimjilbang-for-first-timers",
    title: "Your first jjimjilbang, explained gently",
    summary: "The Korean bathhouse is less scary than it sounds. Here is what happens, step by step.",
    updated: "2026-10-18",
    body: [
      "A jjimjilbang is a public bathhouse with hot rooms, a shared lounge and snacks. Families go together. People nap there. It is very relaxing once you know the order of things.",
      "You get a locker key and a set of clothes at the front desk. The bath areas are separated by gender, and yes, everyone is naked there. Shower before you go into the pools.",
      "Then put on the clothes they gave you and go to the shared area. Try a hot room, drink sikhye (sweet rice drink), and eat a baked egg. That's the classic set.",
    ],
    tips: ["Tattoo rules differ by place. If you have visible tattoos, check before you pay."],
  },
];
