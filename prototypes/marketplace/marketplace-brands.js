/* Shared brand data (homepage cards, "All brands" list and the brand detail page). */
window.MP_BRANDS = (function () {
  // [name, category, min order, rating, reviews, call-out ('' = none), location]
  const tiles = [
    ['Wren & Willow',   "Women's Fashion",     2000, 4.5, 21, 'New items!',    'North Vancouver, BC'],
    ['Marlow & Finch',  "Women's Fashion",     1500, 4.7, 38, 'Free shipping', 'Portland, OR'],
    ['Northfield',      "Women's Fashion",     2500, 4.4, 12, '',              'Toronto, ON'],
    ['Juniper Row',     "Women's Footwear",    1800, 4.6, 54, '20% off',       'Brooklyn, NY'],
    ['Harbour Lane',    "Women's Denim",       1200, 4.3, 17, 'Free shipping', 'Vancouver, BC'],
    ['Atelier Verne',   "Women's Accessories", 3000, 4.8, 29, '',              'Montréal, QC'],
    ['Sable Studio',    "Women's Fashion",     1000, 4.5, 63, '20% off',       'Los Angeles, CA'],
    ['Ashby & Hide',    'Leather goods',       2200, 4.2, 9,  'New items!',    'Leeds, UK']
  ];
  // Five more brands: shown only on the "All brands" list page (the homepage carousel keeps the first eight)
  const more = [
    ['Copper & Cedar',  "Men's Fashion",    1800, 4.6, 26, 'Free shipping', 'Calgary, AB'],
    ['Fairbank & Co.',  "Men's Tailoring",  2800, 4.4, 14, '',              'London, UK'],
    ['Thistle & Tweed', "Men's Outerwear",  2200, 4.7, 33, 'New items!',    'Edinburgh, UK'],
    ['Saffron & Sage',  "Women's Footwear",  900, 4.3, 48, '20% off',       'Austin, TX'],
    ['Dune Denim Co.',  'Denim',            1400, 4.5, 22, '',              'Mexico City, MX']
  ];
  // one photo per brand: [file, object-position]
  const imgs = [['brand-1.webp', 'center 62%'], ['brand-2.webp', 'center 50%'], ['brand-3.webp', 'center 30%'], ['brand-4.webp', 'center 50%'],
                ['brand-5.webp', 'center 40%'], ['brand-6.webp', 'center 50%'], ['brand-7.webp', 'center 50%'], ['brand-8.webp', 'center 50%'],
                ['brand-9.webp', 'center 60%'], ['brand-10.webp', 'center 50%'], ['brand-11.webp', 'center 35%'], ['brand-12.webp', 'center 50%'], ['brand-13.webp', 'center 65%']];
  const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Brand values (shown as chips on the brand's About page and used by the All brands filter). Stable per brand.
  const VALUES = ['Canadian made', 'Eco-friendly', 'Handmade', 'LGBTQ+ owner', 'Organic', 'Women owned'];
  const values = (name) => {
    let h = 3; for (const ch of name) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    const n = 2 + (h % 2), start = h % VALUES.length, step = h % 2 ? 1 : 5;   // step 1 or 5 never repeats within 6 values
    return Array.from({ length: n }, (_, k) => VALUES[(start + k * step) % VALUES.length]).sort();
  };
  return { tiles, more, all: tiles.concat(more), imgs, slug, VALUES, values };
})();
