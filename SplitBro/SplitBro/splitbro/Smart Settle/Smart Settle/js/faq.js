let faqQuestions =
    document.querySelectorAll(
        ".faq-question"
    );

faqQuestions.forEach(
    question => {

        question.addEventListener(
            "click",
            () => {

                let faqItem =
                    question.parentElement;

                let icon =
                    question.querySelector(
                        "i"
                    );

                faqItem.classList.toggle(
                    "active"
                );

                if (
                    faqItem.classList.contains(
                        "active"
                    )
                ) {

                    icon.classList.remove(
                        "fa-plus"
                    );

                    icon.classList.add(
                        "fa-minus"
                    );

                } else {

                    icon.classList.remove(
                        "fa-minus"
                    );

                    icon.classList.add(
                        "fa-plus"
                    );

                }

            }
        );

    }
);