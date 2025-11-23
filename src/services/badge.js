/**
 * Gera badge SVG customizável
 */
function generateBadge(count, options = {}) {
	const { style = "flat", color = "4c1", label = "Visitas", logo = null } = options;

	const countStr = formatNumber(count);
	const labelWidth = calculateTextWidth(label) + 10;
	const countWidth = calculateTextWidth(countStr) + 10;
	const totalWidth = labelWidth + countWidth;

	const styles = {
		flat: generateFlatStyle(labelWidth, countWidth, color, label, countStr, logo),
		"flat-square": generateFlatSquareStyle(labelWidth, countWidth, color, label, countStr, logo),
		plastic: generatePlasticStyle(labelWidth, countWidth, color, label, countStr, logo),
		"for-the-badge": generateForTheBadgeStyle(labelWidth, countWidth, color, label, countStr, logo),
	};

	return styles[style] || styles.flat;
}

function formatNumber(num) {
	if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + "M";
	}
	if (num >= 1000) {
		return (num / 1000).toFixed(1) + "K";
	}
	return num.toString();
}

function calculateTextWidth(text) {
	// Aproximação: 6px por caractere
	return text.length * 7;
}

function getColorValue(color) {
	const colors = {
		"brightgreen": "#4c1",
		"green": "#97ca00",
		"yellowgreen": "#a4a61d",
		"yellow": "#dfb317",
		"orange": "#fe7d37",
		"red": "#e05d44",
		"blue": "#007ec6",
		"lightgrey": "#9f9f9f",
	};
	return colors[color] || `#${color}`;
}

function generateFlatStyle(labelWidth, countWidth, color, label, count, logo) {
	const totalWidth = labelWidth + countWidth;
	const colorValue = getColorValue(color);

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${count}">
  <title>${label}: ${count}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${countWidth}" height="20" fill="${colorValue}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">
    ${
		logo
			? `<text x="${labelWidth / 2 - 10}" y="150" fill="#fff" transform="scale(.1)" textLength="${
					(labelWidth - 20) * 10
			  }">${logo} ${label}</text>`
			: `<text x="${labelWidth / 2}" y="150" fill="#fff" transform="scale(.1)" textLength="${
					(labelWidth - 10) * 10
			  }">${label}</text>`
	}
    <text x="${labelWidth + countWidth / 2}" y="150" fill="#fff" transform="scale(.1)" textLength="${
		(countWidth - 10) * 10
	}">${count}</text>
  </g>
</svg>`;
}

function generateFlatSquareStyle(labelWidth, countWidth, color, label, count, logo) {
	const totalWidth = labelWidth + countWidth;
	const colorValue = getColorValue(color);

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${count}">
  <title>${label}: ${count}</title>
  <g shape-rendering="crispEdges">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${countWidth}" height="20" fill="${colorValue}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">
    <text x="${labelWidth / 2}" y="140" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}">${label}</text>
    <text x="${labelWidth + countWidth / 2}" y="140" transform="scale(.1)" textLength="${
		(countWidth - 10) * 10
	}">${count}</text>
  </g>
</svg>`;
}

function generatePlasticStyle(labelWidth, countWidth, color, label, count, logo) {
	const totalWidth = labelWidth + countWidth;
	const colorValue = getColorValue(color);

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="18" role="img" aria-label="${label}: ${count}">
  <title>${label}: ${count}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
    <stop offset=".9" stop-color="#000" stop-opacity=".3"/>
    <stop offset="1" stop-color="#000" stop-opacity=".5"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="18" rx="4" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="18" fill="#555"/>
    <rect x="${labelWidth}" width="${countWidth}" height="18" fill="${colorValue}"/>
    <rect width="${totalWidth}" height="18" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">
    <text x="${labelWidth / 2}" y="140" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}">${label}</text>
    <text x="${labelWidth + countWidth / 2}" y="140" transform="scale(.1)" textLength="${
		(countWidth - 10) * 10
	}">${count}</text>
  </g>
</svg>`;
}

function generateForTheBadgeStyle(labelWidth, countWidth, color, label, count, logo) {
	const totalWidth = labelWidth + countWidth + 20;
	const colorValue = getColorValue(color);

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="28" role="img" aria-label="${label}: ${count}">
  <title>${label}: ${count}</title>
  <g shape-rendering="crispEdges">
    <rect width="${labelWidth + 10}" height="28" fill="#555"/>
    <rect x="${labelWidth + 10}" width="${countWidth + 10}" height="28" fill="${colorValue}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="100" font-weight="bold">
    <text x="${(labelWidth + 10) / 2}" y="175" transform="scale(.1)" textLength="${
		labelWidth * 10
	}">${label.toUpperCase()}</text>
    <text x="${labelWidth + 10 + (countWidth + 10) / 2}" y="175" transform="scale(.1)" textLength="${
		countWidth * 10
	}">${count}</text>
  </g>
</svg>`;
}

module.exports = {
	generateBadge,
};
