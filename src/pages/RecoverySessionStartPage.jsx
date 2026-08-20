import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import { getNextRecoverySlot } from "../api/plans";

import {
    buildRecoveryRoutinePath,
    findRunnableRoutine,
} from "../config/recoveryRouting";

import {
    HandRoutineGlobalStyle,
    RoutineContainer,
} from "./HandRoutinePage.styled";

const pageStyle = {
    minHeight: "calc(100vh - 160px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px",
    color: "#fff",
    textAlign: "center",
};

const buttonStyle = {
    marginTop: 22,
    width: 180,
    height: 44,
    border: "none",
    borderRadius: 6,
    background: "#E04141",
    color: "#fff",
    cursor: "pointer",
};

function RecoverySessionStartPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] =
        useState(
            "회복 세션을 준비하고 있어요."
        );

    useEffect(() => {
        let isMounted = true;

        const routeToNextRoutine =
            async () => {
                /*
                 * 자율 진행 모드
                 *
                 * useRoutineHome에서:
                 * navigate("/recovery-session", {
                 *   state: {
                 *     autonomous: true,
                 *     stageType: routine.stageType,
                 *   }
                 * })
                 *
                 * 로 들어온 경우
                 */
                if (
                    location.state
                        ?.autonomous
                ) {
                    const stageType =
                        location.state
                            ?.stageType;

                    /*
                     * 가볍게 깨우기
                     * 실제 첫 번째 루틴 경로로 이동
                     */
                    navigate(
                        "/handroutine",
                        {
                            replace: true,
                            state: {
                                autonomous:
                                    true,
                                stageType,
                            },
                        }
                    );

                    return;
                }

                /*
                 * 기존 AI 계획 기반 진행
                 */
                try {
                    const slot =
                        await getNextRecoverySlot();

                    const routine =
                        findRunnableRoutine(
                            slot
                        );

                    if (!routine) {
                        if (
                            isMounted
                        ) {
                            setMessage(
                                "지금 시작할 수 있는 루틴이 없어요."
                            );
                        }

                        return;
                    }

                    navigate(
                        buildRecoveryRoutinePath(
                            slot,
                            routine
                        ),
                        {
                            replace:
                                true,
                        }
                    );
                } catch (error) {
                    console.error(
                        "회복 세션 조회 실패:",
                        error
                    );

                    if (isMounted) {
                        setMessage(
                            "아직 준비된 회복 세션이 없어요."
                        );
                    }
                }
            };

        routeToNextRoutine();

        return () => {
            isMounted = false;
        };
    }, [
        navigate,
        location.state,
    ]);

    return (
        <>
            <HandRoutineGlobalStyle />

            <RoutineContainer>
                <div style={pageStyle}>
                    <div>
                        <h1>
                            {message}
                        </h1>

                        <button
                            type="button"
                            style={
                                buttonStyle
                            }
                            onClick={() =>
                                navigate(
                                    "/"
                                )
                            }
                        >
                            홈으로
                        </button>
                    </div>
                </div>
            </RoutineContainer>
        </>
    );
}

export default RecoverySessionStartPage;
