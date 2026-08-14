import styled from "styled-components";

export const Card = styled.article`
  padding: ${({ theme }) => theme.spacing.lg};

  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.line};
  border-radius: ${({ theme }) => theme.radius.medium};

  text-align: center;

  box-shadow: ${({ theme }) => theme.shadow.small};

  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadow.medium};
  }
`;

export const Avatar = styled.div`
  width: 64px;
  height: 64px;

  margin: 0 auto ${({ theme }) => theme.spacing.md};

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => theme.radius.large};

  background: ${({ theme }) => theme.colors.primary};
  color: #ffffff;

  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

export const Name = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

export const Role = styled.p`
  margin-top: ${({ theme }) => theme.spacing.xs};

  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme }) => theme.fontWeight.regular};
`;