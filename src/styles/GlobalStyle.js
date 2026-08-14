import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    @font-face {
    font-family: "SUIT";
    src: url("/fonts/SUIT-Variable.woff2") format("woff2");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
    }
    
    *,
    *::before,
    *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html {
        font-size: 16px;
        scroll-behavior: smooth;
    }

    body {
        min-height: 100vh;
        background-color: ${({ theme }) => theme.colors.background};
        color: ${({ theme }) => theme.colors.text};

        font-size: ${({ theme }) => theme.fontSize.medium};
        font-weight: ${({ theme }) => theme.fontWeight.regular};
        line-height: 1.5;

        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    #root {
        min-height: 100vh;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    ul,
    ol {
        list-style: none;
    }

    button {
        border: none;
        outline: none;
        background: none;
        color: inherit;
        cursor: pointer;

        font: inherit;
    }

    input,
    textarea,
    select {
        border: none;
        outline: none;
        background: transparent;

        font: inherit;
        color: inherit;
    }

    img {
        display: block;
        max-width: 100%;
        user-select: none;
    }
`;

export default GlobalStyle;