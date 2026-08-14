import { Link } from "react-router-dom";
import styled from "styled-components";

const LandingPage = () => {
  return (
    <Container>
      <Content>
        <Label>LIKELION · DONGGUK UNIVERSITY</Label>

        <Title>
          멋쟁이사자처럼
          <br />
          동국대학교 중앙해커톤
          <br />
          <Highlight>4팀</Highlight>
        </Title>

        <Description>
          멋쟁이사자처럼 동국대학교 4팀의
          <br />
          중앙해커톤 프로젝트를 소개합니다.
        </Description>

        <ButtonGroup>
          <Link to="/team">
            <Button>팀 소개</Button>
          </Link>

          <Link to="/project">
            <Button $primary>프로젝트 소개</Button>
          </Link>
        </ButtonGroup>
      </Content>
    </Container>
  );
};

export default LandingPage;

/* ─────────── 스타일 ─────────── */

const Container = styled.main`
  min-height: 80vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.xl} 24px;
`;

const Content = styled.section`
  width: 100%;
  max-width: 900px;
`;

const Label = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};

  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  letter-spacing: 0.12em;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(40px, 7vw, 72px);
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  line-height: 1.15;
  letter-spacing: -0.04em;
`;

const Highlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const Description = styled.p`
  margin-top: ${({ theme }) => theme.spacing.lg};

  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSize.medium};
  line-height: 1.7;
`;

const ButtonGroup = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};

  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.medium};

  background: ${({ theme }) => theme.colors.primary};

  color: ${({ theme }) => "#FFFFFF"};

  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ theme }) => theme.fontWeight.medium};

  cursor: pointer;

  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadow.medium};
  }

  &:active {
    transform: translateY(0);
  }
`;