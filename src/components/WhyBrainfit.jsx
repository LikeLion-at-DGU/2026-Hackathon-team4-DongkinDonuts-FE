import { useState } from "react";
import { whyBrainfitData } from "../data/whybrainfitData";

import * as S from "./WhyBrainfit.styled";

function WhyBrainfit() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const current = whyBrainfitData[currentIndex];

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < whyBrainfitData.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    return (
        <S.Container>
            <S.Header>
                <S.Label>Why Brainfit</S.Label>
                <S.Title>왜 Brainfit이어야 할까요?</S.Title>
            </S.Header>

            <S.SlideArea>
                <S.ArrowButton
                    $left
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24" fill="none">
                        <path d="M11.6665 21.667L1.6665 11.667L11.6665 1.66699" stroke="#9D9D9D" stroke-width="3.33333" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </S.ArrowButton>

                <S.TextArea>
                    <S.Step>
                        {current.number} {current.label}
                    </S.Step>

                    <S.SlideTitle>
                        {current.title}
                    </S.SlideTitle>

                    <S.Description>
                        {current.description}
                    </S.Description>
                </S.TextArea>

                <S.InfoCard>
                    <S.CardImage
                        src={current.image}
                        alt={current.cardTitle}
                    />

                    <S.CardContent>
                        <S.CardCategory>
                            {current.cardCategory}
                        </S.CardCategory>

                        <S.CardTitle>
                            {current.cardTitle}
                        </S.CardTitle>

                        <S.CardDescription>
                            {current.cardDescription}
                        </S.CardDescription>

                        <S.Tags>
                            {current.tags.map((tag) => (
                                <S.Tag key={tag}>{tag}</S.Tag>
                            ))}
                        </S.Tags>
                    </S.CardContent>
                </S.InfoCard>

                <S.ArrowButton
                    $right
                    onClick={handleNext}
                    disabled={currentIndex === whyBrainfitData.length - 1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M15 30L25 20L15 10" stroke="#9D9D9D" stroke-width="3.33333" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </S.ArrowButton>
            </S.SlideArea>

            <S.Navigation>
                <S.Dots>
                    {whyBrainfitData.map((item, index) => (
                        <S.Dot
                            key={item.id}
                            $active={index === currentIndex}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </S.Dots>
            </S.Navigation>
        </S.Container>
    );
}

export default WhyBrainfit;