import * as S from "./MemberCard.styled";

const MemberCard = ({ member }) => {
  return (
    <S.Card>
      <S.Avatar>{member.name[0]}</S.Avatar>
      <S.Name>{member.name}</S.Name>
      <S.Role>{member.role}</S.Role>
    </S.Card>
  );
};

export default MemberCard;


