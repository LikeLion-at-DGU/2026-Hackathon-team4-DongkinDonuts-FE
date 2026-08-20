import { createGlobalStyle } from "styled-components";
import SuitThinWOFF2 from "../assets/fonts/SUIT-Thin.woff2";
import SuitExtraLightWOFF2 from "../assets/fonts/SUIT-ExtraLight.woff2";
import SuitLightWOFF2 from "../assets/fonts/SUIT-Light.woff2";
import SuitRegularWOFF2 from "../assets/fonts/SUIT-Regular.woff2";
import SuitMediumWOFF2 from "../assets/fonts/SUIT-Medium.woff2";
import SuitSemiBoldWOFF2 from "../assets/fonts/SUIT-SemiBold.woff2";
import SuitBoldWOFF2 from "../assets/fonts/SUIT-Bold.woff2";
import SuitExtraBoldWOFF2 from "../assets/fonts/SUIT-ExtraBold.woff2";
import SuitHeavyWOFF2 from "../assets/fonts/SUIT-Heavy.woff2";


export const GlobalStyle = createGlobalStyle`
/* ---------- Font Face Declarations ---------- */
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitThinWOFF2}) format('woff2');
  font-weight: 100;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitExtraLightWOFF2}) format('woff2');
  font-weight: 200;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitLightWOFF2}) format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitRegularWOFF2}) format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitMediumWOFF2}) format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitSemiBoldWOFF2}) format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitBoldWOFF2}) format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitExtraBoldWOFF2}) format('woff2');
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SUIT';
  src: url(${SuitHeavyWOFF2}) format('woff2');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}
/* ---------- CSS Reset ---------- */
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, menu, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
main, menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

article, aside, details, figcaption, figure,
footer, header, hgroup, main, menu, nav, section {
  display: block;
}

*[hidden] {
  display: none;
}

menu, ol, ul {
  list-style: none;
  padding-left: 0;
}

blockquote, q {
  quotes: none;
}

blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'SUIT', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;