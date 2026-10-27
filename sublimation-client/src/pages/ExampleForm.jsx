
import { useState } from "react";

import Button from "../components/ui/Button";
import TextField from "../components/ui/TextField";
import FeedbackMessage from "../components/ui/FeedbackMessage";

function ExampleForm() {
    const [email, setEmail] = useState("");

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
            }}
        >
            <TextField
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
            />

            <FeedbackMessage variant="info">
                Enter your email address to continue.
            </FeedbackMessage>

            <Button type="submit">
                Continue
            </Button>
        </form>
    );
}

export default ExampleForm;
