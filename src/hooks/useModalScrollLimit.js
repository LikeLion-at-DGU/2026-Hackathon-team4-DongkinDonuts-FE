import { useEffect, useRef } from "react";

// 모달이 화면 아래로 잘리지 않도록, 모달 하단이 뷰포트 아래로 내려가지 않는
// 선까지만 페이지 스크롤을 허용한다. TimeChangeModal.jsx에 인라인으로 있던
// 로직을 그대로 훅으로 분리한 것 — f7e6ff3 커밋에서 분리는 됐는데 이 파일
// 자체가 커밋에 안 들어가서(add 누락) 빌드가 깨졌던 걸 복구.
export function useModalScrollLimit() {
    const modalFrameRef = useRef(null);
    const maxScrollRef = useRef(null);

    useEffect(() => {
        const calculateMaxScroll = () => {
            const modal = modalFrameRef.current;

            if (!modal) return;

            const rect =
                modal.getBoundingClientRect();

            const modalBottom =
                rect.bottom + window.scrollY;

            const bottomGap = 20;

            const maxScroll =
                modalBottom -
                window.innerHeight +
                bottomGap;

            maxScrollRef.current =
                Math.max(
                    window.scrollY,
                    maxScroll
                );
        };

        const handleWindowScroll = () => {
            const maxScroll =
                maxScrollRef.current;

            if (maxScroll === null) return;

            if (window.scrollY > maxScroll) {
                window.scrollTo({
                    top: maxScroll,
                    behavior: "auto",
                });
            }
        };

        requestAnimationFrame(
            calculateMaxScroll
        );

        window.addEventListener(
            "scroll",
            handleWindowScroll,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            calculateMaxScroll
        );

        return () => {
            window.removeEventListener(
                "scroll",
                handleWindowScroll
            );

            window.removeEventListener(
                "resize",
                calculateMaxScroll
            );
        };
    }, []);

    return modalFrameRef;
}
