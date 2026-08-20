import styled from "styled-components";

export const Container = styled.section`
    width: calc(100% + 88px);
    margin-left: -44px;

    padding: 60px 44px 33px;
    box-sizing: border-box;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.30) 0%, rgba(115, 115, 115, 0.12) 100%);
`;

/* Routine 영역과 동일한 1040px 기준 */
export const Header = styled.div`
    width: 1352px;
    margin: 6px auto 90px;

    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateX(-35px);

    gap: 20px;
`;

export const Label = styled.p`
    margin: 0;

    color: #000;
    text-align: center;

    font-family: Poppins;
    font-size: 24px;
    font-weight: 400;
    line-height: 30px;
`;

export const Title = styled.h2`
    margin: 0;

    color: #000;
    text-align: center;

    font-family: Poppins;
    font-size: 32px;
    font-weight: 700;
    line-height: 40px;
`;

export const SlideArea = styled.div`
    position: relative;

    width: 1352px;
    height: 240px;
    margin: 40px 0 0;

    display: flex;
    justify-content: center;
    align-items: flex-start;

    column-gap: 30px;
`;

export const TextArea = styled.div`
    width: 464px;
    height: 245px;
    position: relative;
    left: -40px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export const Step = styled.span`
    color: #3355fa;

    font-family: Poppins;
    font-size: 20px;
    font-weight: 600;
    line-height: 29px;
    letter-spacing: -0.2px;
`;

export const SlideTitle = styled.h3`
    width: 520px;
    min-height: 64px;

    margin: 10px 0 0;

    color: #000;

    font-family: Poppins;
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;

    word-break: keep-all;
`;

export const Description = styled.p`
    margin: 15px 0 0;

    color: #7e7e7e;

    font-family: Poppins;
    font-size: 17px;
    font-weight: 500;
    line-height: 32px;

    word-break: keep-all;
`;

export const InfoCard = styled.div`
    width: 530px;
    height: 240px;

    padding: 20px 8px;
    box-sizing: border-box;

    display: flex;
    align-items: center;
    gap: 30px;

    border-radius: 26px;
    background: #f7f7f7;
`;

export const CardImage = styled.img`
    width: 214px;
    height: 167px;

    flex-shrink: 0;

    background: #f7f7f7;
`;

export const CardContent = styled.div`
    width: 258px;
    height: 168px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export const CardCategory = styled.span`
    margin: 0;

    color: #000;

    font-family: Poppins;
    font-size: 18px;
    font-weight: 500;
    line-height: 28px;

    white-space: nowrap;
`;

export const CardTitle = styled.h4`
    margin: 8px 0 0;

    color: #000;

    font-family: Poppins;
    font-size: 24px;
    font-weight: 600;
    line-height: 28px;

    white-space: nowrap;
`;

export const CardDescription = styled.p`
    margin: 12px 0 0;

    min-height: 44px;

    color: #484848;

    font-family: Poppins;
    font-size: 17px;
    font-weight: 500;
    line-height: 22px;

    word-break: keep-all;
`;

export const Tags = styled.div`
    margin-top: 16px;

    display: flex;
    align-items: center;
    gap: 5px;
`;

export const Tag = styled.span`
    padding: 0 10px;

    border: 0.775px solid #000;
    border-radius: 30px;
    

    color: #000;

    font-family: Poppins;
    font-size: 15px;
    font-weight: 300;
    line-height: 28px;

    white-space: nowrap;
`;

export const Navigation = styled.div`
    width: 1352px;

    margin: 42px auto 0;

    display: flex;
    justify-content: center;
    align-items: center;
`;

export const Dots = styled.div`
    display: flex;
    align-items: center;
    gap: 11px;
`;

export const Dot = styled.button`
    width: ${({ $active }) => ($active ? "60px" : "15px")};
    height: 15px;

    padding: 0;
    border: none;
    border-radius: 999px;

    background: ${({ $active }) =>
        $active ? "#C3C3C3" : "#e5e7eb"};

    cursor: pointer;

    transition:
        width 0.2s ease,
        background 0.2s ease;
`;

export const ArrowButton = styled.button`
    position: absolute;
    top: 50%;

    ${({ $left }) => $left && `left: -20px;`}
    ${({ $right }) => $right && `right: 40px;`}

    transform: translateY(-50%);

    width: 44px;
    height: 44px;

    padding: 0;

    display: flex;
    justify-content: center;
    align-items: center;

    border: none;
    border-radius: 50%;

    background: #ffffff;

    color: ${({ disabled }) =>
        disabled ? "#cfcfcf" : "#9D9D9D"};

    box-shadow: ${({ disabled }) =>
        disabled
            ? "0 3px 10px rgba(0, 0, 0, 0.06)"
            : "0 4px 14px rgba(0, 0, 0, 0.14)"};

    font-size: 23px;
    line-height: 1;

    cursor: ${({ disabled }) =>
        disabled ? "default" : "pointer"};

    opacity: ${({ disabled }) =>
        disabled ? 0.55 : 1};

    z-index: 3;

    transition: 0.2s ease;

        img {
        transform: ${({ $right }) =>
            $right ? "rotate(180deg)" : "none"};
    }

    &:hover {
        background: ${({ disabled }) =>
            disabled ? "#ffffff" : "#f5f5f5"};
    }
`;