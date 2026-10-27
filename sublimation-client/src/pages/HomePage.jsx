
import CategoryCard from "../components/ui/CategoryCard";

const categories = [
    {
        id: "tshirts",
        number: "01",
        name: "Custom T-Shirts",
        description:
            "Personalized apparel made around your ideas.",
    },
    {
        id: "sublimation",
        number: "02",
        name: "Sublimation Printing",
        description:
            "Creative printing for personalized products.",
    },
    {
        id: "gifts",
        number: "03",
        name: "Custom Gifts",
        description:
            "Thoughtful products with a personal touch.",
    },
];

function HomePage() {
    return (
        <>
            <section className="hero">
                <div className="container hero-content">
                    <div className="hero-copy">
                        <span className="eyebrow">
                            PERSONALIZED PRINTING & APPAREL
                        </span>

                        <h1>
                            Wear Your <span>Ideas.</span>
                        </h1>

                        <p>
                            Make your everyday essentials more personal.
                            Discover creative custom printing and products
                            designed to express your individuality.
                        </p>

                        <a
                            className="button button-primary"
                            href="#categories"
                        >
                            Explore Our Collection
                            <span aria-hidden="true">→</span>
                        </a>
                    </div>

                    <div className="hero-art" aria-hidden="true">
                        <div className="hero-art-inner">
                            <span className="hero-art-brand">
                                TeeCraft
                            </span>

                            <div className="hero-shirt">
                                <span>T</span>
                            </div>

                            <span className="hero-art-caption">
                                MADE TO BE YOURS
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section
                className="categories-section"
                id="categories"
                aria-labelledby="categories-heading"
            >
                <div className="container">
                    <div className="section-heading">
                        <span className="eyebrow">
                            WHAT WE CREATE
                        </span>

                        <h2 id="categories-heading">
                            Explore TeeCraft
                        </h2>

                        <p>
                            Creative possibilities for everyday products.
                        </p>
                    </div>

                    <div className="category-grid">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                number={category.number}
                                name={category.name}
                                description={category.description}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="about-section" id="about">
                <div className="container about-content">
                    <span className="eyebrow">
                        THE TEECRAFT IDEA
                    </span>

                    <h2>
                        Your imagination. Your expression.
                    </h2>

                    <p>
                        TeeCraft is built around a simple idea:
                        personalized products should make creativity
                        accessible, straightforward, and enjoyable.
                    </p>
                </div>
            </section>
        </>
    );
}

export default HomePage;
