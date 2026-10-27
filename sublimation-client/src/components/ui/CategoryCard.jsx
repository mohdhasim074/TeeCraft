
function CategoryCard({ number, name, description }) {
    return (
        <article className="category-card">
            <span className="category-number">
                {number}
            </span>

            <h3>{name}</h3>

            <p>{description}</p>
        </article>
    );
}

export default CategoryCard;
