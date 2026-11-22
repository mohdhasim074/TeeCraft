
import { useState } from "react";

import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import FeedbackMessage from "../components/ui/FeedbackMessage";

function validateEmail(value) {
    const email = value.trim();

    if (!email) {
        return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Enter a valid email address.";
    }

    return "";
}

function ExampleForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleEmailChange(event) {
        const nextEmail = event.target.value;

        setEmail(nextEmail);
        setSubmitted(false);

        if (error) {
            setError(validateEmail(nextEmail));
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        const validationError = validateEmail(email);

        setError(validationError);
        setSubmitted(false);

        if (validationError) {
            return;
        }

        setSubmitted(true);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <TextField
                id="example-email"
                label="Email address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                helpText="Enter an email address to test the form."
                error={error}
                autoComplete="email"
                required
            />

            {submitted && (
                <FeedbackMessage
                    variant="success"
                    title="Validation successful"
                >
                    Your email address passed validation.
                    This demonstration does not submit or store data.
                </FeedbackMessage>
            )}

            <Button type="submit">
                Continue
            </Button>
        </form>
    );
}

export default ExampleForm;
