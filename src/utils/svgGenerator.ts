// Helper to encode SVG string to Data URI
export const encodeSVG = (svgString: string): string => {
  // In React Native, we'll use a different approach
  // For now, return the SVG string directly
  return svgString;
};

// Generator for architectural room SVGs
export const createRoomSVG = (w: number, h: number, type: string): string => {
  const stroke = "#374151"; // gray-700
  const fill = "#F9FAFB";   // gray-50
  const furnitureStroke = "#9CA3AF"; // gray-400
  const furnitureFill = "#FFFFFF";
  
  let content = "";
  
  switch (type) {
    case 'living':
      content = `
        <!-- Sofa -->
        <rect x="20" y="20" width="${w-40}" height="40" rx="4" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <rect x="20" y="20" width="30" height="40" rx="2" fill="none" stroke="${stroke}" stroke-width="1" opacity="0.3"/>
        <rect x="${w-50}" y="20" width="30" height="40" rx="2" fill="none" stroke="${stroke}" stroke-width="1" opacity="0.3"/>
        <!-- Coffee Table -->
        <rect x="${w/2 - 30}" y="75" width="60" height="30" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <!-- Rug -->
        <rect x="30" y="70" width="${w-60}" height="40" fill="none" stroke="${furnitureStroke}" stroke-dasharray="4"/>
        <!-- TV Unit -->
        <rect x="40" y="${h-25}" width="${w-80}" height="10" fill="${stroke}" rx="2"/>
      `;
      break;
    case 'kitchen':
      content = `
        <!-- Counter L-Shape -->
        <path d="M0 0 L${w} 0 L${w} 40 L40 40 L40 ${h} L0 ${h} Z" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <!-- Stove -->
        <rect x="${w-50}" y="5" width="40" height="30" rx="2" fill="white" stroke="${stroke}" stroke-width="1"/>
        <circle cx="${w-40}" cy="15" r="3" fill="none" stroke="${stroke}"/>
        <circle cx="${w-20}" cy="15" r="3" fill="none" stroke="${stroke}"/>
        <circle cx="${w-40}" cy="28" r="3" fill="none" stroke="${stroke}"/>
        <circle cx="${w-20}" cy="28" r="3" fill="none" stroke="${stroke}"/>
        <!-- Sink -->
        <rect x="5" y="${h/2}" width="30" height="40" rx="2" fill="white" stroke="${stroke}" stroke-width="1"/>
        <circle cx="20" cy="${h/2+20}" r="2" fill="${stroke}"/>
      `;
      break;
    case 'bedroom':
      content = `
        <!-- Bed -->
        <rect x="${w/2 - 40}" y="15" width="80" height="${h-35}" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <!-- Pillows -->
        <rect x="${w/2 - 35}" y="20" width="30" height="15" rx="2" fill="white" stroke="${furnitureStroke}" stroke-width="1"/>
        <rect x="${w/2 + 5}" y="20" width="30" height="15" rx="2" fill="white" stroke="${furnitureStroke}" stroke-width="1"/>
        <!-- Blanket -->
        <rect x="${w/2 - 40}" y="${h-50}" width="80" height="30" fill="${fill}" stroke="none" opacity="0.5"/>
        <line x1="${w/2 - 40}" y1="${h-50}" x2="${w/2 + 40}" y2="${h-50}" stroke="${furnitureStroke}" stroke-width="1"/>
        <!-- Nightstands -->
        <rect x="${w/2 - 60}" y="20" width="15" height="15" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="1"/>
        <rect x="${w/2 + 45}" y="20" width="15" height="15" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="1"/>
      `;
      break;
    case 'bath':
      content = `
        <!-- Tub -->
        <rect x="${w-50}" y="5" width="45" height="${h-10}" rx="4" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <rect x="${w-45}" y="10" width="35" height="${h-20}" rx="10" fill="none" stroke="${furnitureStroke}" stroke-width="1"/>
        <!-- Vanity -->
        <rect x="0" y="${h/2-20}" width="30" height="40" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <circle cx="15" cy="${h/2}" r="8" fill="white" stroke="${stroke}" stroke-width="1"/>
        <!-- Toilet -->
        <ellipse cx="20" cy="${h-25}" rx="10" ry="14" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <rect x="5" y="${h-50}" width="30" height="15" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
      `;
      break;
    case 'dining':
      content = `
        <!-- Table -->
        <circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)/3}" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <!-- Chairs -->
        <rect x="${w/2-10}" y="10" width="20" height="20" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="1"/>
        <rect x="${w/2-10}" y="${h-30}" width="20" height="20" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="1"/>
        <rect x="10" y="${h/2-10}" width="20" height="20" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="1"/>
        <rect x="${w-30}" y="${h/2-10}" width="20" height="20" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="1"/>
      `;
      break;
    case 'office':
      content = `
        <!-- Desk -->
        <path d="M0 0 L${w} 0 L${w} 40 L40 40 L40 ${h} L0 ${h} Z" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <!-- Chair -->
        <circle cx="${w/2 + 10}" cy="${h/2 + 10}" r="15" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
        <!-- Laptop -->
        <rect x="50" y="10" width="30" height="20" fill="white" stroke="${stroke}" stroke-width="1"/>
      `;
      break;
    case 'kids':
      content = `
         <!-- Rug -->
         <circle cx="${w/2}" cy="${h/2}" r="40" fill="none" stroke="${furnitureStroke}" stroke-dasharray="3"/>
         <!-- Bed -->
         <rect x="10" y="10" width="60" height="100" rx="2" fill="${furnitureFill}" stroke="${stroke}" stroke-width="2"/>
         <!-- Toys -->
         <circle cx="${w-30}" cy="${h-30}" r="10" fill="${furnitureFill}" stroke="${stroke}"/>
         <rect x="${w-60}" y="${h-40}" width="20" height="20" fill="${furnitureFill}" stroke="${stroke}"/>
      `;
      break;
    case 'study':
      content = `
        <!-- Bookshelf -->
        <rect x="0" y="0" width="${w}" height="30" fill="${furnitureFill}" stroke="${stroke}"/>
        <line x1="20" y1="0" x2="20" y2="30" stroke="${stroke}"/>
        <line x1="40" y1="0" x2="40" y2="30" stroke="${stroke}"/>
        <line x1="60" y1="0" x2="60" y2="30" stroke="${stroke}"/>
        <!-- Desk -->
        <rect x="10" y="${h-50}" width="${w-20}" height="40" rx="2" fill="${furnitureFill}" stroke="${stroke}"/>
      `;
      break;
    case 'balcony':
      content = `
         <!-- Railing -->
         <line x1="0" y1="5" x2="${w}" y2="5" stroke="${stroke}" stroke-width="2"/>
         <line x1="0" y1="5" x2="0" y2="${h}" stroke="${stroke}" stroke-width="2"/>
         <line x1="${w}" y1="5" x2="${w}" y2="${h}" stroke="${stroke}" stroke-width="2"/>
         <!-- Plants -->
         <circle cx="20" cy="20" r="10" fill="none" stroke="${stroke}"/>
         <circle cx="${w-20}" cy="20" r="10" fill="none" stroke="${stroke}"/>
      `;
      break;
    default:
      content = `
         <rect x="10" y="10" width="${w-20}" height="${h-20}" fill="none" stroke="${furnitureStroke}" stroke-dasharray="5"/>
         <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${stroke}">${type}</text>
      `;
  }

  const svg = `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="4"/>
    ${content}
  </svg>
  `.trim();
  
  return encodeSVG(svg);
};
