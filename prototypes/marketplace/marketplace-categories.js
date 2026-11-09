/* Single source of truth for which products belong to a category / "View all" page.
   Used by marketplace.html (counts on tiles and links) and marketplace-category.html (the list itself),
   so the number on the homepage always equals the number of products on the page it opens. */
window.MP_CAT = (function () {
  const { market, arrivals, liked } = window.MP_PRODUCTS;
  const all = market.concat(arrivals, liked);
  // Supplementary catalogues: jewelry (Banana Republic) and Gap styles for men's, kids', shoes, bags and accessories
  const jewelry = window.MP_PRODUCTS.jewelry || [];
  const cat = window.MP_PRODUCTS.catData || {};
  const everything = all.concat(jewelry, ...Object.values(cat));
  const own = {
    "women's jewelry": jewelry,
    "women's accessories": jewelry.concat(cat['women-s-accessories'] || []),
    "women's footwear": cat['women-s-shoes'],
    "women's shoes": cat['women-s-shoes'],
    "women's handbags": cat['women-s-handbags'],
    "men's apparel": cat['men-s-apparel'],
    "men's bags": cat['men-s-bags'],
    "men's accessories": cat['men-s-accessories'],
    "kids' apparel": cat['kids-apparel'],
    "kids' shoes & accessories": cat['kids-shoes-accessories'],
  };
  // Recently viewed: 20 products, round-robin across men's, kids', shoes, bags and accessories (first 15 feed the homepage carousel)
  const groups = ['men-s-apparel', 'kids-apparel', 'women-s-shoes', 'women-s-handbags', 'men-s-accessories'].map((k) => cat[k] || []);
  const recent = [];
  for (let i = 0; recent.length < 20 && i < 8; i++) groups.forEach((g) => { if (g[i] && recent.length < 20) recent.push(g[i]); });
  // Live list: opening a product puts it first (max 20, oldest drops off). Stored in the browser so every page shares it.
  const RECENT_KEY = 'mp-recent-v1', RECENT_MAX = 20;
  // Everlane and Gap products alternate in lists, so neither brand's photos bunch together
  const isGap = (p) => !!(p.colors && p.colors[0] && /\/gap\//.test(p.colors[0].img));
  const weave = (a, b) => { const out = []; for (let i = 0; i < Math.max(a.length, b.length); i++) { if (i < a.length) out.push(a[i]); if (i < b.length) out.push(b[i]); } return out; };
  const mix = (list) => weave(list.filter((p) => !isGap(p)), list.filter(isGap));
  // Default list (before anything has been viewed): women's apparel from both brands, none of which sit in the other carousels
  const defaultRecent = () => mix(market.filter((p) => clothing.includes(p.type))
    .sort((a, b) => hash('recent|' + a.name) - hash('recent|' + b.name))).slice(0, RECENT_MAX);
  /* Swatch colours: some source swatches came through as flat grey (e.g. "Beige" as #d9d9d9). When a colour has a clear name but a
     neutral/placeholder hex, swap in a proper swatch for that colour family. Real hexes (slate blue, dark brown...) are left alone. */
  const SWATCH_RULES = [
    ['Black',  /black|onyx|\bjet\b|noir|moonless/, '#1f1f1f'], ['White', /\bwhite\b|ivory|off.?white|snow|chalk/, '#f2f1ed'],
    ['Grey',   /gr[ae]y|charcoal|zinc|slate|silver|meteorite|pewter|smoke|steel/, null],   // greys keep their real hex
    ['Beige',  /beige|bone|canvas|\boat|sand|cream|peyote|nude|stone|natural|ecru|linen|vanilla|parchment|khaki/, '#d8c9b3'],
    ['Brown',  /brown|cocoa|chocolate|coffee|espresso|mocha|taupe|toffee|\btan\b|camel|chestnut|walnut|cognac|saddle|bark/, '#7a5a45'],
    ['Red',    /\bred\b|cabernet|wine|burgundy|maroon|crimson|scarlet|ruby|brick|cherry|berry/, '#b8333a'],
    ['Pink',   /pink|rose|blush|peach|fuchsia|magenta|salmon|bubblegum/, '#e4a5b4'],
    ['Orange', /orange|rust|amber|burnt|terracotta|copper|coral|tangerine|pumpkin|apricot/, '#dd7a30'],
    ['Yellow', /yellow|mustard|gold|lemon|butter|canary|\bsun/, '#e0bb4a'],
    ['Green',  /green|olive|sage|forest|pine|eden|moss|emerald|fern|lime|mint|hunter|army|spruce/, '#5b7f5e'],
    ['Blue',   /blue|navy|denim|indigo|cobalt|sapphire|sodalite|klein|\bsky|\bice\b|teal|aqua|turquoise|cyan|chambray/, '#4a6fa5'],
    ['Purple', /purple|plum|lilac|lavender|violet|mauve|eggplant|grape|orchid/, '#6a4a9a'],
  ];
  const hexLS = (hex) => {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || ''); if (!m) return null;
    const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    return { l, sat: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)) };
  };
  const seenColor = new Set();
  everything.forEach((p) => (p.colors || []).forEach((c) => {
    if (seenColor.has(c)) return; seenColor.add(c);
    const first = String(c.name).toLowerCase().split('/')[0].trim();
    const rule = SWATCH_RULES.find(([, rx]) => rx.test(first)); const ls = hexLS(c.hex);
    if (!rule || !ls) return;
    const [fam, , good] = rule; if (!good) return;
    if (fam === 'Black' ? ls.l > 0.3 : fam === 'White' ? ls.l < 0.8 : (ls.sat < 0.08 && ls.l > 0.45)) c.hex = good;
  }));
  const byName = new Map(everything.map((p) => [p.name, p]));
  function getRecent() {
    try {
      const names = JSON.parse(localStorage.getItem(RECENT_KEY) || 'null');
      if (Array.isArray(names)) { const list = names.map((n) => byName.get(n)).filter(Boolean); if (list.length) return list.slice(0, RECENT_MAX); }
    } catch (e) { /* storage unavailable: fall back to the default list */ }
    return defaultRecent();
  }
  function pushRecent(p) {
    const names = getRecent().map((x) => x.name).filter((n) => n !== p.name);
    names.unshift(p.name);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(names.slice(0, RECENT_MAX))); } catch (e) { /* ignore */ }
  }
  const special = { 'new arrivals': arrivals, 'you might like': liked };
  const clothing = ['Knit Tops', 'Woven Tops', 'Sweaters', 'Bottoms', 'Dresses', 'Outerwear'];
  // Curated landing pages (the Popular searches chips). Each is a rule over the whole catalogue.
  const re = (r) => (p) => r.test(p.name);
  const LANDING = ['Cozy knitwear', 'Denim shop', 'Holiday party edit', 'Outerwear & coats', 'Everyday essentials', 'Workwear edit', 'Bags & totes', 'Footwear', 'Hats & scarves', 'Jewelry & gifts', "Kids' favourites", 'Top sellers'];   // display names of the landing pages
  const TRENDING = ['Winter warmers', 'Holiday gift guide', 'Rainy-day jackets', 'Canadian makers', 'Layering basics', 'Weekend travel edit'];
  const collections = {
    'cozy knitwear':       (p) => p.type === 'Sweaters' || /knit|cardigan|cashmere|alpaca|merino|sherpa|fleece/i.test(p.name),
    'denim shop':          re(/denim|jean/i),
    'holiday party edit':  (p) => p.type === 'Dresses' || /satin|velvet|sequin|bomber|skirt/i.test(p.name),
    'outerwear & coats':   (p) => p.type === 'Outerwear' || (/jacket|coat|parka|puffer|trench|vest/i.test(p.name) && !/hat/i.test(p.name)),
    'everyday essentials': re(/t-shirt|\btee\b|henley|tank|mockneck|crew neck|turtleneck/i),
    'workwear edit':       (p) => /shirt|trouser|pant\b|oxford|polo|blazer|cigarette/i.test(p.name) && !/t-shirt|sweatshirt/i.test(p.name),
    'bags & totes':        re(/bag|tote|satchel|pouchette|backpack|crossbody|clutch/i),
    'footwear':            re(/slipper|sandal|flat|shoe|boot|sneaker|mule|clog|loafer|wedge/i),
    'hats & scarves':      re(/\bhat\b|\bcap\b|beanie|scarf|sock|glove|belt/i),
    'jewelry & gifts':     (p) => p.type === 'Jewelry',
    "kids' favourites":    (p) => (cat['kids-apparel'] || []).includes(p) || (cat['kids-shoes-accessories'] || []).includes(p),
    'top sellers':        (p) => hash('best|' + p.name) % 3 === 0,
    // trending landing pages (search dropdown)
    'winter warmers':      re(/\bhat\b|beanie|scarf|sock|glove|fleece|sherpa|puffer|parka/i),
    'holiday gift guide':  (p) => p.type === 'Jewelry' || /scarf|bag|tote|pouchette|sock|belt|\bhat\b/i.test(p.name),
    'rainy-day jackets':   (p) => /jacket|coat|parka|trench|liner|puffer|bomber|windbreaker/i.test(p.name) && !/hat/i.test(p.name),
    'canadian makers':     (p) => hash('canada|' + p.name) % 5 < 2,
    'layering basics':     re(/henley|mockneck|turtleneck|\brib\b|t-shirt|\btee\b|long.sleeve|tank|cami/i),
    'weekend travel edit': re(/jogger|sweatpant|fleece|tote|backpack|hoodie|sweatshirt|cardigan|sneaker|slipper/i),
  };
  const types = {
    "women's tops": ['Knit Tops', 'Woven Tops', 'Sweaters'],
    "women's bottoms": ['Bottoms'],
    "women's outerwear": ['Outerwear'],
    "women's accessories": ['Accessories'],
    "women's jewelry": ['Accessories'],
    "women's footwear": ['Accessories'],
    "dresses": ['Dresses'],
    "women's apparel": clothing,
  };
  const hash = (k) => { let h = 5381; for (let i = 0; i < k.length; i++) h = ((h << 5) + h + k.charCodeAt(i)) >>> 0; return h; };
  // Not enough sample products? Cycle through them so each list reaches a believable size (36–95, always under 100).
  function fill(list, key) {
    const target = 36 + (hash(key) % 60);
    if (!list.length || list.length >= target) return list;
    const out = [];
    for (let i = 0; i < target; i++) out.push(list[i % list.length]);
    return out;
  }
  function productsFor(title) {
    const k = (title || '').toLowerCase();
    if (!k) return fill(all, 'all');
    let list;
    if (k === 'recently viewed') return getRecent();
    if (collections[k]) return fill(everything.filter(collections[k]).sort((a, b) => hash(k + '|' + a.name) - hash(k + '|' + b.name)).slice(0, 60), k);                         // live list, never padded
    if (special[k]) list = special[k];
    else if (own[k] && own[k].length) list = own[k];
    else if (types[k]) list = mix(all.filter((p) => types[k].includes(p.type)));
    else list = all.filter((p) => hash(k + '|' + p.name) % 5 < 3); // other categories: a stable ~60% slice of the catalogue
    return fill(list, k);
  }
  const isNew = (p) => hash('new|' + p.name) % 5 === 0;   // ~20% of products
  const isTop = (p) => hash('top|' + p.name) % 7 === 0 && !isNew(p);   // ~12%: "Top seller" badge (never on a New product)
  return { all, everything, productsFor, fill, getRecent, pushRecent, isNew, isTop, landing: LANDING, landingAll: LANDING.concat(TRENDING) };
})();
