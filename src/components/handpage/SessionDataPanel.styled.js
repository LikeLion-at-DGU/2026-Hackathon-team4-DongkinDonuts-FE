import styled from "styled-components";

// 실시간 진행 시간 표시
export const LiveTime = styled.div`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border-radius: 20px;
  background: #4b4b4b;
  color: #eee;
  font-size: 12px;
  font-weight: 600;
  z-index: 20;
`;

export const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e95353;
`;

// 실시간 데이터 영역
export const DataArea = styled.div`
  position: absolute;
  top: 28px;
  right: 55px;
  width: 225px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 20;
`;

export const DataCard = styled.div`
  padding: 14px 16px;
  border-radius: 17px;
  background: #484848;
`;

export const DataTitle = styled.div`
  margin-bottom: 12px;
  color: #eee;
  font-size: 12px;
  font-weight: 700;
`;

export const DataRow = styled.div`
  display: flex;
  justify-content: space-between;

  div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  span {
    color: #aaa;
    font-size: 8px;
  }

  strong {
    font-size: 17px;
  }
`;

// 화면 거리 상태 카드
export const DistanceCard = styled(DataCard)``;

export const DistanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;

  span {
    font-size: 12px;
    color: #ddd;
  }

  strong {
    font-size: 10px;
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
  border-radius: 20px;
  background: linear-gradient(90deg, #e89b9b, #b7e395 50%, #e89b9b);
`;

export const DistanceMarker = styled.div`
  position: absolute;
  top: -5px;
  width: 3px;
  height: 20px;
  border-radius: 3px;
  background: white;
  transition: left 0.18s ease-out;
`;