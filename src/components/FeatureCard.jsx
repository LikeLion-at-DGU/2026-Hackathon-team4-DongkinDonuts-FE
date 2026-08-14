import * as S from "./FeatureCard.styled";

const FeatureCard = ({ feature }) => {
  return (
    <S.Card>
      <S.Number>{feature.number}</S.Number>

      <S.Content>
        <S.Title>{feature.title}</S.Title>
        <S.Description>{feature.description}</S.Description>
      </S.Content>
    </S.Card>
  );
};

export default FeatureCard;