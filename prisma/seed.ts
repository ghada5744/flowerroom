import { PrismaClient } from "@prisma/client";

/**
 * Catalogue seed — ONLY items from the client's Flower Room NG brief.
 * No invented add-ons, wrappers, cards, or prices she did not provide.
 */
const prisma = new PrismaClient();
const VIDEO =
  "Once arranged, your florist will send a video via WhatsApp or email for your approval before delivery.";

function kobo(naira: number) {
  return Math.round(naira * 100);
}

/** Local product photos in /public/images — replace later with her real images via Admin */
const IMG = {
  pink: "/images/pink.jpg",
  lilac: "/images/lilac.jpg",
  tropical: "/images/tropical.jpg",
  ivory: "/images/ivory.jpg",
  bleu: "/images/bleu.jpg",
  roses: "/images/roses.jpg",
  rosesPink: "/images/roses-pink.jpg",
  rosesWhite: "/images/roses-white.jpg",
  hatbox: "/images/hatbox.jpg",
  basket: "/images/basket.jpg",
  red: "/images/red.jpg",
  cake: "/images/cake.jpg",
  plant: "/images/plant.jpg",
  balloon: "/images/balloon.jpg",
  hero: "/images/hero.jpg",
};

async function main() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.review.deleteMany();
  await prisma.addon.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.siteSetting.deleteMany();

  const categories = await Promise.all(
    [
      {
        name: "Hand Tied Bouquets",
        slug: "hand-tied-bouquets",
        description: "Hand tied bouquets for every special moment.",
        sortOrder: 1,
      },
      {
        name: "Birthday, Anniversary, Congratulation & Apology Sets",
        slug: "gift-sets",
        description: "Gift sets with arrangement, cake, card and balloons.",
        sortOrder: 2,
      },
      {
        name: "Signature Arrangements",
        slug: "signature-arrangements",
        description: "Baskets, hat boxes and grand arrangements.",
        sortOrder: 3,
      },
      {
        name: "Events & Bridal",
        slug: "events-bridal",
        description: "Events and bridal — enquire for a custom quote.",
        sortOrder: 4,
      },
      {
        name: "Sweet & Savoury Treats",
        slug: "sweet-savoury",
        description: "Treats — enquire for current prices.",
        sortOrder: 5,
      },
      {
        name: "Plants & Decorative Flowers",
        slug: "plants",
        description: "Plants and decorative flowers — enquire for stock.",
        sortOrder: 6,
      },
    ].map((c) => prisma.category.create({ data: c })),
  );

  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // --- Hand tied: standard size tiers ---
  const sizeTiers = [
    { name: "Small", price: 99000 },
    { name: "Medium", price: 150000 },
    { name: "Large", price: 280000 },
    { name: "Giant (VIP)", price: 450000 },
  ];

  const royalBleuTiers = [
    { name: "Small", price: 150000 },
    { name: "Medium", price: 200000 },
    { name: "Large", price: 350000 },
    { name: "Giant (VIP)", price: 650000 },
  ];

  const handTied = [
    {
      name: "Pink Bouquet",
      slug: "pink-bouquet",
      description:
        "Pink roses, hydrangeas, chrysanthemums, spray roses, and statice arranged with eucalyptus and other fillers in a pink wrapping paper. Chic, soft, and graceful.",
      image: IMG.pink,
      tiers: sizeTiers,
    },
    {
      name: "Lilac Bouquet",
      slug: "lilac-bouquet",
      description:
        "Luxurious harmony of frilled purple flowers, roses, white carnations or spray roses, white chrysanthemum, and touches of purple statice presented in our signature wrap. Perfect for thoughtful gifting and heartfelt celebrations.",
      image: IMG.lilac,
      tiers: sizeTiers,
    },
    {
      name: "Tropical Bouquet",
      slug: "tropical-bouquet",
      description:
        "A joyful burst of yellow roses, orange roses, fuchsia roses, chrysanthemums, purple statice, and eucalyptus in a chic pastel box. The vibrant colours make it the perfect gift to brighten any occasion.",
      image: IMG.tropical,
      tiers: sizeTiers,
    },
    {
      name: "Ivory Bouquet",
      slug: "ivory-bouquet",
      description:
        "An enchanting white arrangement presented in a stylish hatbox, overflowing with roses, hydrangeas, chrysanthemums, and delicate gypsophila. Soft greens add texture, making it a graceful and sophisticated gift for any occasion.",
      image: IMG.ivory,
      tiers: sizeTiers,
    },
    {
      name: "Royal Bleu Bouquet",
      slug: "royal-bleu-bouquet",
      description:
        "An enchanting bleu and white arrangement, overflowing with roses, hydrangeas, chrysanthemums, and fillers — making it a graceful and sophisticated gift for any occasion.",
      image: IMG.bleu,
      tiers: royalBleuTiers,
    },
  ];

  for (const p of handTied) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        imageUrl: p.image,
        featured: true,
        videoNote: VIDEO,
        categoryId: bySlug["hand-tied-bouquets"].id,
        variants: {
          create: p.tiers.map((t, i) => ({
            name: t.name,
            priceKobo: kobo(t.price),
            sortOrder: i,
          })),
        },
      },
    });
  }

  // Roses by count (from her list)
  const roseCounts = [
    [12, 75000],
    [20, 120000],
    [30, 180000],
    [50, 299000],
    [70, 420000],
    [80, 480000],
    [101, 599000],
    [150, 900000],
    [200, 1200000],
    [300, 1800000],
    [365, 2190000],
    [500, 3000000],
  ] as const;

  await prisma.product.create({
    data: {
      name: "Roses",
      slug: "roses",
      description: "Classic roses — choose your count.",
      imageUrl: IMG.roses,
      featured: true,
      videoNote: VIDEO,
      categoryId: bySlug["hand-tied-bouquets"].id,
      variants: {
        create: roseCounts.map(([count, price], i) => ({
          name: `${count} Roses`,
          priceKobo: kobo(price),
          sortOrder: i,
        })),
      },
    },
  });

  // Gift sets — all 295,000 N from her list
  const giftSets = [
    {
      name: "Pink Gift Set",
      slug: "pink-gift-set",
      description:
        "Mixture of pink roses, hydrangeas, chrysanthemums, spray roses, and statice with eucalyptus and fillers in a pink wrap. Chic, soft, and graceful with a bento pink cake, a card and two pink helium balloons.",
      image: IMG.pink,
    },
    {
      name: "Lilac Gift Set",
      slug: "lilac-gift-set",
      description:
        "Luxurious harmony of frilled purple flowers, roses, white carnations or spray roses, white chrysanthemum, and touches of purple statice. Perfect for thoughtful gifting with a bento lilac cake and balloon.",
      image: IMG.lilac,
    },
    {
      name: "Tropical Gift Set",
      slug: "tropical-gift-set",
      description:
        "Joyful burst of yellow, orange and fuchsia roses, chrysanthemums, purple statice, and eucalyptus in a chic pastel box with a card, a bento yellow cake and 2 helium balloons.",
      image: IMG.tropical,
    },
    {
      name: "Ivory Gift Set",
      slug: "ivory-gift-set",
      description:
        "An enchanting white arrangement in a stylish hatbox with roses, hydrangeas, chrysanthemums and gypsophila, with a bento white cake and balloon.",
      image: IMG.ivory,
    },
    {
      name: "Bleu Royalty Set",
      slug: "bleu-royalty-set",
      description:
        "Premium blue hydrangeas, white roses and spray roses complimented with eucalyptus leaves, elegantly arranged with a bento cake and two helium balloons.",
      image: IMG.bleu,
    },
  ];

  for (const g of giftSets) {
    await prisma.product.create({
      data: {
        name: g.name,
        slug: g.slug,
        description: g.description,
        imageUrl: g.image,
        featured: true,
        videoNote: VIDEO,
        // Cake + card + balloons are INCLUDED in the set price (not extra add-ons)
        specs:
          "What's included in this set (already in the price):\n• Flower arrangement\n• Bento cake\n• Card\n• Helium balloon(s)\n\nThese are not sold separately with this set — they come together.",
        categoryId: bySlug["gift-sets"].id,
        variants: {
          create: [{ name: "Standard Set", priceKobo: kobo(295000), sortOrder: 0 }],
        },
      },
    });
  }

  // Mixed flowers basket — Large / XL × colours she listed
  const basketColors = ["Pink", "Lilac", "Tropical", "Ivory", "Bleu", "Peach"];
  await prisma.product.create({
    data: {
      name: "Mixed Flowers Basket",
      slug: "mixed-flowers-basket",
      description:
        "Pink roses, hydrangeas, chrysanthemums, spray roses, and statice arranged with eucalyptus and other fillers in a pink and white basket. Chic, soft, and graceful. Choose your colour.",
      imageUrl: IMG.basket,
      featured: true,
      videoNote: VIDEO,
      categoryId: bySlug["signature-arrangements"].id,
      variants: {
        create: [
          ...basketColors.map((color, i) => ({
            name: `Large — ${color}`,
            priceKobo: kobo(299000),
            color,
            sortOrder: i,
          })),
          ...basketColors.map((color, i) => ({
            name: `XL — ${color}`,
            priceKobo: kobo(600000),
            color,
            sortOrder: 10 + i,
          })),
        ],
      },
    },
  });

  // Roses basket
  const roseBasket = [
    [100, 650000],
    [200, 1300000],
    [300, 2000000],
    [500, 3250000],
    [1000, 6500000],
  ] as const;
  const roseBasketColors = ["White", "Red", "Pink", "Purple", "Mixed"];

  await prisma.product.create({
    data: {
      name: "Roses Basket",
      slug: "roses-basket",
      description:
        "A stunning basket of roses — rich, romantic and impossible to ignore. Choose colour and count.",
      imageUrl: IMG.roses,
      featured: false,
      videoNote: VIDEO,
      categoryId: bySlug["signature-arrangements"].id,
      variants: {
        create: roseBasket.flatMap(([count, price], i) =>
          roseBasketColors.map((color, j) => ({
            name: `${count} Roses — ${color}`,
            priceKobo: kobo(price),
            color,
            sortOrder: i * roseBasketColors.length + j,
          })),
        ),
      },
    },
  });

  // Signature boxes — Large 499k / XXL 1.5M
  const boxes = [
    {
      name: "Juliette Ivory Box",
      slug: "juliette-ivory-box",
      description:
        "Luxurious giant box flower arrangement in our signature tall hatbox. Featuring layers of white roses, lush hydrangeas, and elegant orchids, finished with eucalyptus. Colours and varieties shown online will be used whenever possible; substitutes of equal or greater value may be used.",
      image: IMG.rosesWhite,
    },
    {
      name: "Pink Lady Anastasia Box",
      slug: "pink-lady-anastasia-box",
      description:
        "Spray rose, purple statice, pink and purple carnations, purple spray rose, fuchsia rose and deep purple rose in our signature tall white hatbox. Substitutes of equal or greater value may be used when needed.",
      image: IMG.rosesPink,
    },
    {
      name: "Bleu Elegance Box",
      slug: "bleu-elegance-box",
      description:
        "Delicate blue hydrangeas, purple roses, red and white spray roses, complimented with eucalyptus leaves in our signature tall white hatbox. Substitutes of equal or greater value may be used when needed.",
      image: IMG.bleu,
    },
    {
      name: "Tropical Royal Statement Box",
      slug: "tropical-royal-statement-box",
      description:
        "Radiance and extravagance in our signature tall white hatbox — yellow, orange, red and green mix with baby's breath. Substitutes of equal or greater value may be used when needed.",
      image: IMG.hatbox,
    },
    {
      name: "Red Dramatic Box",
      slug: "red-dramatic-box",
      description:
        "Deep red roses, red spray roses and full hydrangeas layered with rich seasonal blooms and fillers in our signature hatbox. Substitutes of equal or greater value may be used when needed.",
      image: IMG.red,
    },
  ];

  for (const b of boxes) {
    await prisma.product.create({
      data: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        imageUrl: b.image,
        featured: true,
        videoNote: VIDEO,
        categoryId: bySlug["signature-arrangements"].id,
        variants: {
          create: [
            { name: "Large Box", priceKobo: kobo(499000), sortOrder: 0 },
            { name: "XXL Box", priceKobo: kobo(1500000), sortOrder: 1 },
          ],
        },
      },
    });
  }

  // Events — names only, no prices in her brief → enquire
  const events = [
    "Simi Royal",
    "Monica Fancy",
    "Zoussi Soft",
    "Wedding Centrepieces",
    "Home Flowers",
    "Funeral Wreath",
    "Funeral Church",
    "Hotel Reception Arrangement",
  ];

  for (const name of events) {
    await prisma.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description: `${name} — custom event / bridal arrangement. Price on request. Contact Flower Room NG via WhatsApp for a quote.`,
        imageUrl: PLACEHOLDER_SAFE(),
        featured: false,
        videoNote: VIDEO,
        categoryId: bySlug["events-bridal"].id,
        variants: {
          create: [{ name: "Enquire for price", priceKobo: 0, sortOrder: 0 }],
        },
      },
    });
  }

  // Plants — enquire only (not an add-on)
  await prisma.product.create({
    data: {
      name: "Plants & Decorative Flowers",
      slug: "plants-decorative",
      description:
        "Plants and decorative flowers. Price and stock on request — contact us via WhatsApp.",
      imageUrl: IMG.plant,
      featured: false,
      videoNote: VIDEO,
      categoryId: bySlug["plants"].id,
      variants: {
        create: [{ name: "Enquire for price", priceKobo: 0, sortOrder: 0 }],
      },
    },
  });

  // Cards / treats / balloons — separate types (client brief: sweet & savoury ≠ balloons)
  // Gift SETS already include cake+card+balloons; these extras are for bouquets/boxes only.
  await prisma.addon.createMany({
    data: [
      {
        name: "Message Complimentary",
        slug: "card-message-free",
        type: "card",
        priceKobo: 0,
        sortOrder: 0,
        imageUrl: IMG.ivory,
      },
      {
        name: "Happy Birthday",
        slug: "card-birthday",
        type: "card",
        priceKobo: 0,
        sortOrder: 1,
        imageUrl: IMG.ivory,
      },
      {
        name: "Happy Anniversary",
        slug: "card-anniversary",
        type: "card",
        priceKobo: 0,
        sortOrder: 2,
        imageUrl: IMG.ivory,
      },
      {
        name: "Congratulations",
        slug: "card-congrats",
        type: "card",
        priceKobo: 0,
        sortOrder: 3,
        imageUrl: IMG.ivory,
      },
      {
        name: "Bento Cake",
        slug: "treat-bento-cake",
        type: "treat",
        priceKobo: 0,
        sortOrder: 0,
        imageUrl: IMG.cake,
      },
      {
        name: "Birthday Cake",
        slug: "treat-birthday-cake",
        type: "treat",
        priceKobo: 0,
        sortOrder: 1,
        imageUrl: IMG.cake,
      },
      {
        name: "Floral Cupcakes",
        slug: "treat-floral-cupcakes",
        type: "treat",
        priceKobo: 0,
        sortOrder: 2,
        imageUrl: IMG.cake,
      },
      {
        name: "Treat Tray",
        slug: "treat-tray",
        type: "treat",
        priceKobo: 0,
        sortOrder: 3,
        imageUrl: IMG.cake,
      },
      {
        name: "Brunch Tray",
        slug: "treat-brunch-tray",
        type: "treat",
        priceKobo: 0,
        sortOrder: 4,
        imageUrl: IMG.cake,
      },
      {
        name: "1 Helium Balloon",
        slug: "balloon-1",
        type: "balloon",
        priceKobo: 0,
        sortOrder: 0,
        imageUrl: IMG.balloon,
      },
      {
        name: "2 Helium Balloons",
        slug: "balloon-2",
        type: "balloon",
        priceKobo: 0,
        sortOrder: 1,
        imageUrl: IMG.balloon,
      },
    ],
  });

  await prisma.siteSetting.create({
    data: {
      id: "main",
      brandName: "FLOWER ROOM",
      tagline: "THE ART OF GIFTING",
      phone: "+234 915 535 3128",
      email: "info@flowerroom.ng",
      whatsapp: "2349155353128",
      facebookUrl: "https://www.facebook.com/p/Flower-Room-Nigeria-61581423721745/",
      instagramUrl: "https://www.instagram.com/flower_room_ng",
      tiktokUrl: "https://www.tiktok.com/@flowerroomng",
      bannerLeft: "8,000 + 5 Star reviews",
      bannerCenter: "Same-day delivery across Lagos",
      bannerRight: "Video Approval on all orders",
      heroTitle: "A Month in Pink",
      heroSubtitle:
        "At Flower Room NG we have the best fresh flowers in Nigeria — wholesale and retail. Same-day delivery to all Lagos.",
      heroImageUrl: IMG.hero,
    },
  });

  const googleReviewsUrl =
    "https://www.google.com/maps/place/Flower+Room/@6.4282894,3.4374746,17z/data=!4m8!3m7!1s0x103bf5b554fb5f9f:0x485bb4c7ef888b04!8m2!3d6.4282894!4d3.4374746!9m1!1b1!16s%2Fg%2F11xrk_np_7";

  // Real Google Maps 5★ reviews (names from Google). Cards open Google Maps.
  await prisma.review.createMany({
    data: [
      { authorName: "Jovita Joseph", title: "5 stars for this beautiful flower shop", body: "5 stars for this beautiful flower shop! Itsy is incredibly talented. The flowers are fresh, beautiful and carefully arranged.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 1 },
      { authorName: "Mary-Esther Anele", title: "Amazing team", body: "The team here is amazing. Very polite, responsive, and attentive to detail. They helped me choose the perfect flowers and even customized the arrangement to fit my budget. Five stars for service!", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 2 },
      { authorName: "Muhammed Sofiat", title: "Exactly what I ordered", body: "I received exactly what I ordered and I am delighted. The quality is on point, everything matched my expectations and I loved it. Fully satisfied — I recommend without hesitation. ❤️", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 3 },
      { authorName: "Sunny Obi", title: "Incredible variety", body: "They offer an incredible variety of flowers and their products are a real treat. I have never regretted buying from them.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 4 },
      { authorName: "Ajogwu Emeka", title: "Absolutely magnificent", body: "Absolutely magnificent! Splendid flowers, impeccable service and the bouquets last a very long time. I recommend 100%!", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 5 },
      { authorName: "Elijah Akindele", title: "Fresh flowers, excellent service", body: "I received beautiful fresh flowers from them, their customer service is excellent, they are very transparent and trustworthy.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 6 },
      { authorName: "Holystar official", title: "Best place for flowers", body: "The best place to order flowers so far. I've ordered from them about 4 times and always received exactly what I ordered — and no complaints from friends I've recommended them to.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 7 },
      { authorName: "Lindarcu Evelin", title: "Honest and stress-free", body: "A very pleasant, sincere and honest place to get flowers of all kinds. The transaction was smooth and stress-free. Thank you for the helpful advice!", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 8 },
      { authorName: "Bamidele Ademola", title: "Nice place, beautiful flowers", body: "The place is nice, the customer service is excellent and the flowers are beautiful.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 9 },
      { authorName: "Ayogu Anthonia Chiwendu", title: "Impeccable customer service", body: "Impeccable customer service and high quality flowers 🥰 I highly recommend.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 10 },
      { authorName: "Deon", title: "Pretty gift flower", body: "I really like the flower I bought from them — it was a gift and it looked lovely.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 11 },
      { authorName: "Arvin Jay Mamuri", title: "Magnificent flowers", body: "Beautiful flowers and impeccable service! Highly recommended 💐", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 12 },
      { authorName: "Mabudin Ilimi Tv", title: "Captivating designs", body: "Super! Beautiful and captivating designs — you really do great work. Keep it up! 👍", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 13 },
      { authorName: "AYOBAMI Omoloyegbe", title: "Excellent service", body: "Beautiful flowers and excellent service, I highly recommend.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 14 },
      { authorName: "Elizabeth Abu", title: "Bigger than expected", body: "I was pleasantly surprised by my bouquet — it was bigger than expected and the staff were so kind. I give them 10 stars!", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 15 },
      { authorName: "ABDURAUF AUWAL", title: "Timeless elegance", body: "Beautifully adorned flowers, designed with care to reflect elegance, refinement and timeless beauty 💕💕💕", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 16 },
      { authorName: "Jennifer Felix", title: "Exceptional quality", body: "The quality of the flowers I received was exceptional.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 17 },
      { authorName: "Oluwaranti Akinyelure", title: "Pretty and attractive", body: "Pretty and attractive 🤩 Hope to get mine soon 🥰❤️", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 18 },
      { authorName: "Cyrus TD", title: "Incredible customer service", body: "Their customer service is incredible! I took the full package and found the best. 👍", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 19 },
      { authorName: "Ayokunle Imisioluwa", title: "Beautiful flowers", body: "Beautiful flowers! I love them! 💓", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 20 },
      { authorName: "Hikmah Eniola", title: "Healthy petals", body: "Beautiful experience — healthy petals.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 21 },
      { authorName: "Raheedmat Alaga", title: "Flowers and thoughtful gifts", body: "They have everything when it comes to flowers and thoughtful gifts! Also you can get add-ons like cakes etc.", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 22 },
      { authorName: "Ameni Said", title: "Perfect team", body: "Nice job perfect team ❤️❤️❤️❤️", rating: 5, sourceUrl: googleReviewsUrl, sortOrder: 23 },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        question: "Where do you deliver?",
        answer: "Same-day delivery to all Lagos.",
        sortOrder: 1,
      },
      {
        question: "Can I see the flowers before you send them?",
        answer: VIDEO,
        sortOrder: 2,
      },
      {
        question: "Do you do events and weddings?",
        answer:
          "Yes — Simi Royal, Monica Fancy, Zoussi Soft, centrepieces, funerals, hotel receptions and more. Contact us on WhatsApp for a custom quote.",
        sortOrder: 3,
      },
      {
        question: "How fast is same-day delivery?",
        answer:
          "Order early and we deliver across Lagos the same day. Cut-off times can vary by area — message us on WhatsApp to confirm for your location.",
        sortOrder: 4,
      },
      {
        question: "Do you offer wholesale as well as retail?",
        answer:
          "Yes. Flower Room NG supplies fresh flowers wholesale and retail across Nigeria. Contact us for wholesale quantities and pricing.",
        sortOrder: 5,
      },
      {
        question: "Can I add a cake, card or balloons?",
        answer:
          "Gift sets already include arrangement, bento cake, card and helium balloon(s). For bouquets and boxes, you can request add-ons — we’ll confirm options and pricing on WhatsApp.",
        sortOrder: 6,
      },
      {
        question: "How do I place an order?",
        answer:
          "Browse the shop, add priced items to cart and checkout online, or message us on WhatsApp for custom / enquire-only items (events, plants, special add-ons).",
        sortOrder: 7,
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "Online checkout uses Paystack (cards and supported local methods). For custom quotes, we will guide you on payment after confirming your order on WhatsApp.",
        sortOrder: 8,
      },
      {
        question: "What if I need a last-minute gift?",
        answer:
          "Message us on WhatsApp with the area, preferred flowers and delivery time. We’ll confirm what we can prepare same day.",
        sortOrder: 9,
      },
      {
        question: "Do you substitute flowers?",
        answer:
          "We use the colours and varieties shown whenever possible. If something is unavailable, we may use substitutes of equal or greater value so the arrangement stays beautiful.",
        sortOrder: 10,
      },
      {
        question: "How do I care for my flowers?",
        answer:
          "Trim stems, change water daily, keep away from direct sun and ripening fruit. See our Flower Care page for more tips.",
        sortOrder: 11,
      },
      {
        question: "Can I order for someone else in Lagos?",
        answer:
          "Yes. Enter the recipient’s name, phone and delivery address at checkout (or send them on WhatsApp) and we’ll deliver with your message card.",
        sortOrder: 12,
      },
    ],
  });

  console.log("Seed complete — flowers as products; treats / cards / balloons as separate extras.");
}

function PLACEHOLDER_SAFE() {
  return IMG.lilac;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
