import styled from "styled-components";
import { MEMBERS } from "../data/members";
import MemberCard from "../components/MemberCard";


const TeamPage = () => {
  return (
    <>
      <Container>
        <Header>
          <Label>TEAM</Label>
          <Title>우리를 소개합니다</Title>
          <Description>
            멋쟁이사자처럼 동국대학교 중앙해커톤 4팀입니다.
          </Description>
        </Header>

        <MemberList>
          {MEMBERS.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </MemberList>
      </Container>
    </>
  );
}

export default TeamPage;

/* ─────────── 스타일 ─────────── */

export const Container = styled.main`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} 24px;
`;

export const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const Label = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  letter-spacing: 0.12em;
`;

export const Title = styled.h1`
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

export const Description = styled.p`
  margin-top: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSize.medium};
`;

export const MemberList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;