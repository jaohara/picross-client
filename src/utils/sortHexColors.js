// function to sort the array of hex colors.
//  note that this strips out alpha channels from the colors
export default function sortHexColors (hexColors) {
  const rgbColors = hexColors.map(hexToRgb);

  // sort RGB colors based on brightness
  rgbColors.sort((colorA, colorB) => {
    const brightnessA = calculateRelativeLuminance(colorA);
    const brightnessB = calculateRelativeLuminance(colorB);
    return brightnessA - brightnessB;
  });

  // convert RGB values back to hex
  const sortedHexColors = rgbColors.map(rgbToHex);

  return sortedHexColors;
};

// convert a hex string to an rgb object
function hexToRgb (hex) {
  // remove # if necessary
  hex = hex.replace('#', '');

  //convert to rgb
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);

  return { r, g, b };
}

// convert an rgb object back to a hex string
function rgbToHex (rgb) {
  const { r, g, b } = rgb;
  return `#${rgbComponentToHex(r)}${rgbComponentToHex(g)}${rgbComponentToHex(b)}`
}

// convert individual rgb components to hex values
function rgbComponentToHex (component) {
  const hex = component.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function calculateRelativeLuminance (rgb) {
  const { r, g, b } = rgb;
  const rsRGB = calculateSRGBValue(r);
  const gsRGB = calculateSRGBValue(g);
  const bsRGB = calculateSRGBValue(b);

  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

function calculateSRGBValue (color) {
  const sRGB = color / 255;
  return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}