const publicAsset = (path) => `${import.meta.env.BASE_URL}${path}`;

export const whyBrainfitData = [
    {
        id: 1,
        number: "01.",
        label: "문제제기",
        title: "휴식할 때도 우리는 화면을 봅니다.",
        description: (
            <>
                디지털 기기 사용이 일상화되면서 피로가 쌓이지만,
                <br />
                이를 해소하기 위해 다시 SNS나 영상과 같은 디지털 콘텐츠를
                <br />
                소비하는 '디지털 피로의 역설'이 발생하고 있습니다.
            </>
        ),
        image: publicAsset("images/problem.png"),
        cardCategory: "CONTENTS CONSUMPTION",
        cardTitle: "콘텐츠 소비",
        cardDescription:(
            <>
                화면을 보고
                <br />
                정보를 받아들이는 방식
            </>
        ),
        tags: ["수동적", "일방향", "피로 누적"],
    },

    {
        id: 2,
        number: "02.",
        label: "Brainfit의 관점",
        title: (
            <>
                Brainfit은 화면을 끄는 대신
                <br />
                화면을 사용하는 방식을 바꿉니다.
            </>
        ),
        description: (
            <>
                화면을 끄는 대신, 수동적인 화면 사용을 능동적인 회복 경험으로
                <br />
                전환합니다. 단순히 바라보는 화면에서 벗어나 움직이고,
                <br />
                반응하고, 감각을 깨우는 방식을 택합니다.
            </>
        ),
        image: publicAsset("images/interaction.png"),
        cardCategory: "ACTIVE INTERACTION",
        cardTitle: "능동적인 상호작용",
        cardDescription: (
            <>
                화면을 매개로 
                <br />
                직접 움직이고 반응하는 방식
            </>
        ),
        tags: ["능동적", "상호작용", "회복 전환"],
    },

    {
        id: 3,
        number: "03.",
        label: "그래서 웹캠을 사용합니다",
        title: (
            <>
                웹캠은 사용자의 움직임을
                <br />
                Brainfit의 입력으로 만들어줍니다.
            </>
        ),
        description: (
            <>
                화면을 바라보기만 하는 것이 아니라
                <br />
                화면과 상호작용하게 됩니다.
                <br />
                즉각적인 피드백을 통해 능동적인 상호작용을 만들어냅니다.
            </>
        ),
        cardCategory: "BLAHBLA",
        cardTitle: "블라블라",
        cardDescription:
            "웹캠 기반 움직임을 활용한 인터랙션",
        tags: ["얼굴인식", "손동작", "상체움직임"],
    },
];
