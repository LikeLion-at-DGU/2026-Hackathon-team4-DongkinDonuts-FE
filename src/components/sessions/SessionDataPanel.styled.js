import styled from "styled-components";

// 실시간 진행 시간 표시
export const LiveTime = styled.div`
  position: absolute;
  top: 38px;
  left: 50%;
  transform: translateX(-50%);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  height: 59px;
  padding: 16px 23px;
  gap: 9px;

  border-radius: 41.67px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 7.75px 15.5px 0px rgba(0, 0, 0, 0.15);
  
  color: #FFFFFF;
  font-family: SUIT;
  font-size: 23px;
  font-weight: 500;
  z-index: 20;
  box-sizing: border-box;
`;

export const LiveDot = styled.span`
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #EE3D3D;
`;

// 실시간 데이터 영역
export const DataArea = styled.div`
  position: absolute;
  top: 28px;
  right: 55px;
  width: 308.235px;
  height: 324px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 20;
`;

export const DataCard = styled.div`
  padding: 20px 33px 15px 33px;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.1);;
`;

export const DataTitle = styled.div`
  margin-bottom: 18.7px;
  color: #fff;
  font-size: 23px;
  font-weight: 600;
  font-family: SUIT;
  font-style: normal;
`;

export const DataRow = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 85px;

  div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  } 

  span {
    color: #EBEBEB;
    font-family: SUIT;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
  }

  strong {
    display: flex;
    justify-content: flex-end;
    color: #FFF;
    font-family: SUIT;
    font-size: 25px;
    font-style: normal;
    font-weight: 600;
  }
`;

// 화면 거리 상태 카드
export const DistanceCard = styled(DataCard)``;

export const DistanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 19px;

  span {
    font-size: 23px;
    font-weight: 600;
    color: #ddd;
  }

  strong {
    font-size: 15px;
    font-weight: 500;
    padding-top: 8px;
    &.distance-good {
      color: #c8e9a7 !important;
    }
    &.distance-warning {
      color: #f1a3a3 !important;
    }
  }
`;

export const DistanceBar = styled.div`
  position: relative;
  width: 100%;
  height: 10px;
  border-radius: 40px;
  background: linear-gradient(90deg, #e89b9b, #b7e395 50%, #e89b9b);
`;

export const DistanceMarker = styled.div`
  position: absolute;
  top: -5px;
  width: 3px;
  height: 20px;
  border-radius: 40px;
  background: #FFF;
  transition: left 0.18s ease-out;
`;

// 데이터 패널 밑에 표시되는 세션 이미지
export const SessionImageWrap = styled.div`
  position: absolute;
  top: 372px;
  right: 55px;
  width: 308.235px;
  border-radius: 40px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  z-index: 20;

  img {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
  }
`;