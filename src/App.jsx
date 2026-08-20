import { Outlet, ScrollRestoration } from "react-router-dom";
import styled from "styled-components";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { GlobalStyle } from "./styles/GlobalStyle";

const PageViewport = styled.div`
  width: 100%;
  overflow-x: hidden;

  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 1440px;
  min-width: 1440px;
  min-height: 100vh;

  display: flex;
  flex-direction: column;

  background: #ffffff;

  zoom: min(calc(100vw / 1440px), calc(100vh / 880px), 1.5);
`;

const Layout = () => {
  return (
    <PageViewport>
      <Wrapper>
        <Header />
        <Outlet />
        <Footer />
      </Wrapper>
      <ScrollRestoration />
    </PageViewport>
  );
};

function App() {
  return (
    <>
      <GlobalStyle />
      <Layout />
    </>
  );
}

export default App;