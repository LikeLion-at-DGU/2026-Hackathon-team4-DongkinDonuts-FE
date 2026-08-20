import brainResetImage from "../assets/images/brain-reset.png";
import waterImage from "../assets/images/water.jpg";
import breathImage from "../assets/images/breath.jpg";

export const routineData = [
    {
        id: 1,
        stageType: "BRAIN_WAKE",
        title: "가볍게 깨우기",
        description: (
            <>
                시선과 손을 움직이며 화면에 집중해요.
                <br />
                흐트러진 감각과 주의를 천천히 깨워보세요.
            </>
        ),
        status: "미완료",
        image: brainResetImage,
    },
    {
        id: 2,
        stageType: "BRAIN_SHIFT",
        title: "맞춤 세션",
        description: (
            <>
                간단한 움직임을 따라가며 하나의 활동에 집중해요.
                <br />
                수동적인 콘텐츠 소비에서 잠시 벗어나
                <br />
                주의를 전환해보세요.
            </>
        ),
        image: waterImage,
        featured: true,
    },
    {
        id: 3,
        stageType: "BRAIN_RESET",
        title: "마무리하기",
        description: (
            <>
                호흡과 움직임에 집중하며 복잡해진 생각과
                <br />
                긴장을 내려놓아보세요.
            </>
        ),
        status: "미완료",
        image: breathImage,
    },
];
