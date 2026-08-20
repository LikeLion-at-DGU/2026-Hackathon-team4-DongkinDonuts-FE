import styled from "styled-components";

export const Overlay = styled.div`
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;

    /* 랜딩 전체 길이보다 충분히 길게 */
    height: 5000px;

    z-index: 9999;

    background: rgba(0, 0, 0, 0.38);

    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);

    /* 페이지 스크롤 허용 */
    pointer-events: auto;
`;

export const ModalPositioner = styled.div`
    position: relative;

    width: min(100%, 1440px);
    min-height: 100vh;

    margin: 0 auto;

    /* 모달 위치 잡기 */
    display: flex;
    justify-content: flex-end;

    padding-top: 270px;
    padding-right: 90px;

    box-sizing: border-box;
`;

export const ModalFrame = styled.div`
    position: relative;

    width: 410px;
    height: 680px;

    flex-shrink: 0;

    box-sizing: border-box;

    background: #262626;
    border-radius: 24px;

    color: #ffffff;

    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

    overflow: hidden;

    transform: scale(1.1);
    transform-origin: top right;
`;

export const ModalScroll = styled.div`
    width: 100%;
    height: 100%;

    padding: 30px 30px 22px;
    box-sizing: border-box;

    /* 여기만 스크롤 */
    overflow-y: scroll;
    overflow-x: hidden;

    /* Firefox */
    scrollbar-width: none;

    /* IE / old Edge */
    -ms-overflow-style: none;

    /* Chrome / Edge / Safari */
    &::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
    }
`;

export const CloseButton = styled.button`
    position: absolute;

    top: 24px;
    right: 25px;

    width: 24px;
    height: 24px;

    z-index: 10;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;
    border: none;

    background: transparent;
    color: #ccc;

    font-size: 22px;
    font-weight: 300;
    line-height: 1;

    cursor: pointer;
`;

export const Title = styled.h2`
    margin: 0;

    color: #ccc;

    font-family: Poppins;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.4;
`;

export const Description = styled.p`
    margin: 6px 0 0;

    color: #aaa;

    font-family: Poppins;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
`;

export const Divider = styled.div`
    width: 100%;
    height: 1px;

    margin: 18px 0;

    background: rgba(255, 255, 255, 0.18);
`;

export const Section = styled.div`
    width: 100%;
`;

export const SectionTitle = styled.h3`
    margin: 0;

    color: #ccc;

    font-family: Poppins;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.4;
`;

export const SectionDescription = styled.p`
    margin: 4px 0 0;

    color: #888;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
`;

/* 추천 시간 */

export const RecommendedTimes = styled.div`
    display: grid;

    grid-template-columns: repeat(
        auto-fit,
        minmax(72px, 1fr)
    );

    gap: 10px;

    width: 100%;

    margin-top: 15px;
`;

export const TimeButton = styled.button`
    width: 100%;
    min-width: 0;
    height: 38px;

    padding: 0 8px;

    border: 1px solid
        ${({ $active }) => ($active ? "#e04141" : "#777")};

    border-radius: 6px;

    background: transparent;

    color: ${({ $active }) => ($active ? "#e04141" : "#ddd")};

    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;

    cursor: pointer;

    &:hover {
        border-color: #e04141;
    }
`;

/* 직접 설정 */

export const TimePicker = styled.div`
    position: relative;

    width: 180px;
    height: 155px;

    margin: 10px auto 0;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 20px;

    overflow: hidden;
`;

export const TimeColumn = styled.div`
    width: 52px;
    height: 155px;

    overflow-y: auto;

    scroll-snap-type: y mandatory;

    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

export const PickerSpacer = styled.div`
    height: 62px;
    flex-shrink: 0;
`;

export const PickerItem = styled.button`
    width: 100%;
    height: 31px;

    padding: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    background: transparent;

    color: ${({ $active }) =>
        $active ? "#ffffff" : "#737373"};

    font-size: ${({ $active }) =>
        $active ? "17px" : "14px"};

    font-weight: ${({ $active }) =>
        $active ? 600 : 400};

    line-height: 31px;

    cursor: pointer;

    scroll-snap-align: center;

    transition:
        color 0.15s ease,
        font-size 0.15s ease;
`;

export const Colon = styled.span`
    position: relative;
    z-index: 3;

    color: #ffffff;

    font-size: 17px;
    font-weight: 600;

    pointer-events: none;
`;

export const SelectedLine = styled.div`
    position: absolute;

    top: 62px;
    left: 10px;
    right: 10px;

    height: 31px;

    border-top: 1px solid #505050;
    border-bottom: 1px solid #505050;

    pointer-events: none;

    z-index: 2;
`;

/* 반복 설정 */

export const RepeatRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-top: 2px;
`;

export const Toggle = styled.button`
    position: relative;

    width: 44px;
    height: 24px;

    flex-shrink: 0;

    padding: 0;
    border: none;
    border-radius: 999px;

    background: ${({ $active }) =>
        $active ? "#e04141" : "#555"};

    cursor: pointer;
`;

export const ToggleCircle = styled.span`
    position: absolute;

    top: 3px;

    left: ${({ $active }) =>
        $active ? "23px" : "3px"};

    width: 18px;
    height: 18px;

    border-radius: 50%;

    background: #fff;

    transition: left 0.2s;
`;

/* 하단 버튼 */

export const ButtonRow = styled.div`
    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 12px;

    margin-top: 18px;
`;

export const CancelButton = styled.button`
    width: 100%;
    height: 40px;

    border: 1px solid #666;
    border-radius: 6px;

    background: #353535;
    color: #ccc;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;

    cursor: pointer;

    &:hover {
        background: #404040;
    }
`;

export const SaveButton = styled.button`
    width: 100%;
    height: 40px;

    border: none;
    border-radius: 6px;

    background: #e04141;
    color: #fff;

    font-family: Poppins;
    font-size: 12px;
    font-weight: 400;

    cursor: pointer;

    &:hover {
        background: #d63b3b;
    }
`;