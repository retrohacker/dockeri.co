var fs = require('fs');
var path = require('path');

function file(p) {
  return fs.readFileSync(path.join(__dirname, p));
}

var logo_svg = file('docker_wave_whale.svg');
var star_svg = file('repository-star-icon.svg');
var cloud_svg = file('repository-cloud-icon.svg');
var comment_svg = file('repository-comments-icon.svg');
var trusted_svg = file('trusted-icon.svg');

module.exports = function(name, stars, downloads, comments, trusted) {
  return `
<svg version="1.1"
    baseProfile="full"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:ev="http://www.w3.org/2001/xml-events"
    x="0px"
    y="0px"
    width="389px"
    height="82px"
    viewBox="0 0 389 82"
    enable-background="new 0 0 350 82"
  >

  <g>
    <rect x="1" y="1"
        width="387" height="80"
        stroke="rgb(57, 77, 84)"
        stroke-width="3"
        fill="rgb(242, 252, 255)"
    />
  </g>

  <g transform="translate(10,11)">
    <g transform="scale(.38)">
      ${logo_svg}
    </g>
  </g>

  <g font-family="Courier, Courier New, monospace" font-size="14" fill="rgb(102, 102, 102)">
    <text x="120" y="28" font-weight="bold" font-size="16">
      ${name}
    </text>
    <g transform="translate(93,35)">
      <g transform="scale(1.1)">
        <g transform="translate(19.8,-7.1)">
          ${star_svg}
        </g>
        <g transform="translate(99.5,0)">
          ${cloud_svg}
        </g>
        <g transform="translate(175.3,0)">
          ${comment_svg}
          {% include "./repository-comments-icon.svg" %}
        </g>
      </g>
      <g transform="translate(0,35)">
        <text transform="translate(37.3,0)" text-anchor="middle">
          ${stars}
        </text>
        <text transform="translate(119.6,0)" text-anchor="middle">
          ${downloads}
        </text>
        <text transform="translate(202.2,0)" text-anchor="middle">
          ${comments}
        </text>
      </g>
    </g>
  </g>
  <g transform="translate(364,5)">
    <g transform="scale(1.2)">
      ${ trusted ? trusted_svg : '' }
    </g>
  </g>
</svg>
  `
}
