import styled from "styled-components";
import FeatureCard from "../components/FeatureCard";
import { FEATURES } from "../data/features";


const ProjectPage = () => {
  return (
    <Container>
      <Label>PROJECT</Label>

      <Title>Brainfit</Title>

      <Description>
        매일 10분, 뇌와 표정을 깨우는 AI 데일리 웰니스
        <br />
        웹캠을 활용해 손과 얼굴을 직접 움직이며 웰니스를 관리합니다.
      </Description>

      <FeatureList>
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.number} feature={feature} />
        ))}
      </FeatureList>
    </Container>
  );
};

export default ProjectPage;

/* ─────────── 스타일 ─────────── */

const Container = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} 24px;
`;

const Label = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  letter-spacing: 0.1em;
`;

const Title = styled.h1`
  margin-top: ${({ theme }) => theme.spacing.sm};

  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

const Description = styled.p`
  margin-top: ${({ theme }) => theme.spacing.md};

  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.7;
`;

export const FeatureList = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};

  border-top: 1px solid ${({ theme }) => theme.colors.line};
`;