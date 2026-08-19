import styled from "styled-components";

export const Page = styled.main`
    width: 100%;
    box-sizing: border-box;
    padding: 20px 20px 40px;

    background: #ffffff;
`;

export const ImageWrapper = styled.div`
    position: relative;

    width: 100%;
    margin: 0 auto;
`;

export const SettingsImage = styled.img`
    display: block;

    width: 100%;
    height: auto;

    object-fit: contain;
    filter: contrast(1.2) saturate(1.1);
`;

/* 이미지 속 왼쪽 위 Brainfit 카드 위에 덮는 투명 버튼 */
export const BrainfitClickArea = styled.button`
    position: absolute;

    /*
     * 이미지 전체 크기를 기준으로 한 비율
     * 왼쪽 위 Brainfit 카드 영역
     */
    left: 3%;
    top: 3%;
    width: 35%;
    height: 35%;

    padding: 0;
    border: none;
    border-radius: 20px;

    background: transparent;
    cursor: pointer;

    z-index: 2;

    /* 개발할 때 클릭 영역 확인하고 싶으면 잠깐 켜기 */
    /* background: rgba(255, 0, 0, 0.2); */
`;