# Privacy and Safety Notes

The first vertical slice keeps analysis state in the current browser session and does not retain uploaded images permanently. Provider credentials belong only in server-side environment variables and must never be sent to client components.

Allergen findings and dietary restrictions are safety-related information. The application sends only the current session's restrictions to the server-side analysis boundary, displays conflicts in the context of the current food result, and avoids putting restriction data in URLs, analytics events, or unnecessary error messages.

Before durable storage is introduced, the project must define image retention duration, deletion behavior, access controls, user authentication, provider data-processing terms, and result-history permissions. The application must continue to suppress nutrition when evidence is insufficient and must distinguish possible allergens from identified allergens.
