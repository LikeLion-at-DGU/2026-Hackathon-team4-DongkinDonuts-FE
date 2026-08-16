import { useState } from "react";
import { whyBrainfitData } from "../data/whybrainfitData";

import * as S from "./WhyBrainfit.styled";

function WhyBrainfit() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const current = whyBrainfitData[currentIndex];

    const handlePrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? whyBrainfitData.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev === whyBrainfitData.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <S.Container>
            <S.Header>
                <S.Label>Why Brainfit</S.Label>
                <S.Title>왜 Brainfit이어야 할까요?</S.Title>
            </S.Header>

            <S.SlideArea>
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
                </S.InfoCard>
            </S.SlideArea>

            <S.Navigation>
                <S.ArrowButton onClick={handlePrev}>
                    ←
                </S.ArrowButton>

                <S.Dots>
                    {whyBrainfitData.map((item, index) => (
                        <S.Dot
                            key={item.id}
                            $active={index === currentIndex}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </S.Dots>

                <S.ArrowButton onClick={handleNext}>
                    →
                </S.ArrowButton>
            </S.Navigation>
        </S.Container>
    );
}

export default WhyBrainfit;