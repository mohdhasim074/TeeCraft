
import { Link } from "react-router";

function NotFoundPage() {
    return (
        <section className="about-section">
            <div className="container about-content">
                <span className="eyebrow">404 — PAGE NOT FOUND</span>

                <h1>This page doesn't exist.</h1>

                <p>
                    The address may be incorrect, or the page may have
                    moved. Return to the TeeCraft homepage.
                </p>

                <Link className="button button-primary" to="/">
                    Back to Home
                </Link>
            </div>
        </section>
    );
}

export default NotFoundPage;
