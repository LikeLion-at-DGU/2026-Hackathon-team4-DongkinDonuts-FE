import styled from "styled-components";

export const Card = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  padding: ${({ theme }) => theme.spacing.lg} 0;

  border-bottom: 1px solid ${({ theme }) => theme.colors.line};
`;

export const Number = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

export const Content = styled.div``;

export const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

export const Description = styled.p`
  margin-top: ${({ theme }) => theme.spacing.xs};

  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSize.small};
`;