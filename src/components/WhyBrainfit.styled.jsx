import styled from "styled-components";

export const Container = styled.section`
    width: 100%;
    padding: 70px 0 100px;
    box-sizing: border-box;
    background: #ffffff;
`;

export const Header = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 18px;
    margin-bottom: 64px;
`;

export const Label = styled.p`
    margin: 0;

    color: #000;

    font-family: Poppins;
    font-size: 24px;
    font-weight: 400;
    line-height: 30px;
`;

export const Title = styled.h2`
    margin: 0;

    color: #000000;

    font-family: Poppins;
    font-size: 32px;
    font-weight: 700;
    line-height: 36px;
    text-align: center;
`;

export const SlideArea = styled.div`
    width: 100%;

    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 70px;
`;

export const TextArea = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export const Step = styled.span`
    color: #3355FA;
    font-family: Poppins;
    font-size: 24px;
    font-weight: 600;
    line-height: 29.489px;
    letter-spacing: -0.24px;
`;

export const SlideTitle = styled.h3`
    margin: 16px 0 0;

    color: #000;
    font-family: Poppins;
    font-size: 28px;
    font-weight: 600;
    line-height: 30px;

    word-break: keep-all;
`;

export const Description = styled.p`
    margin: 38px 0 0;
    color: #7E7E7E;
    font-family: Poppins;
    font-size: 18px;
    font-weight: 500;
    line-height: 30px;

    word-break: keep-all;
`;

export const InfoCard = styled.div`
  width: 430px;
  min-height: 230px;

  padding: 32px;

  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  border-radius: 20px;

  background: #f4f4f4;
`;

export const CardCategory = styled.span`
  color: #777777;

  font-family: Poppins;
  font-size: 12px;
  font-weight: 500;
`;

export const CardTitle = styled.h4`
  margin: 12px 0 0;

  color: #111111;

  font-family: "SUIT", sans-serif;
  font-size: 24px;
  font-weight: 700;
`;

export const CardDescription = styled.p`
  margin: 14px 0 0;

  color: #666666;

  font-family: "SUIT", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
`;

export const Tags = styled.div`
  margin-top: auto;

  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  padding: 7px 12px;

  border: 1px solid #cccccc;
  border-radius: 999px;

  color: #555555;

  font-family: Poppins;
  font-size: 12px;
  font-weight: 400;
`;

export const Navigation = styled.div`
  margin-top: 42px;

  display: flex;
  justify-content: center;
  align-items: center;

  gap: 18px;
`;

export const ArrowButton = styled.button`
  width: 42px;
  height: 42px;

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid #d0d0d0;
  border-radius: 50%;

  background: #ffffff;
  color: #111111;

  font-size: 20px;

  cursor: pointer;

  &:hover {
    background: #f4f4f4;
  }
`;

export const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Dot = styled.button`
  width: ${({ $active }) => ($active ? "26px" : "8px")};
  height: 8px;

  padding: 0;
  border: none;
  border-radius: 999px;

  background: ${({ $active }) => ($active ? "#111111" : "#dddddd")};

  cursor: pointer;

  transition: 0.2s ease;
`;