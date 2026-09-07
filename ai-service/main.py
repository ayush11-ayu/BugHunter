from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI(
    title="BugHunter AI Service",
    description="AI service for BugHunter bug analysis",
    version="1.0.0",
)


# ============================================================
# AI BUG ANALYSIS
# ============================================================

class BugAnalysisRequest(BaseModel):
    title: str
    description: str
    environment: str = ""
    stepsToReproduce: str = ""
    expectedResult: str = ""
    actualResult: str = ""


def analyze_bug_content(request: BugAnalysisRequest):
    text = " ".join(
        [
            request.title,
            request.description,
            request.environment,
            request.stepsToReproduce,
            request.expectedResult,
            request.actualResult,
        ]
    ).lower()

    # --------------------------------------------------------
    # Category detection
    # --------------------------------------------------------

    category = "General"

    if any(
        word in text
        for word in [
            "login",
            "logout",
            "password",
            "authentication",
            "auth",
            "sign in",
            "signin",
        ]
    ):
        category = "Authentication"

    elif any(
        word in text
        for word in [
            "api",
            "endpoint",
            "request",
            "response",
            "server",
            "backend",
            "500",
            "404",
            "400",
        ]
    ):
        category = "Backend/API"

    elif any(
        word in text
        for word in [
            "database",
            "mongodb",
            "mysql",
            "query",
            "data",
            "record",
        ]
    ):
        category = "Database"

    elif any(
        word in text
        for word in [
            "button",
            "screen",
            "page",
            "layout",
            "css",
            "ui",
            "interface",
            "display",
        ]
    ):
        category = "UI/Frontend"

    elif any(
        word in text
        for word in [
            "slow",
            "performance",
            "timeout",
            "latency",
            "loading",
        ]
    ):
        category = "Performance"

    # --------------------------------------------------------
    # Severity detection
    # --------------------------------------------------------

    severity = "Minor"

    if any(
        word in text
        for word in [
            "crash",
            "data loss",
            "security",
            "blocked",
            "completely broken",
            "production down",
        ]
    ):
        severity = "Blocker"

    elif any(
        word in text
        for word in [
            "not working",
            "does not work",
            "cannot",
            "unable",
            "failure",
            "fails",
        ]
    ):
        severity = "Major"

    elif any(
        word in text
        for word in [
            "wrong",
            "incorrect",
            "error",
            "unexpected",
        ]
    ):
        severity = "Critical"

    # --------------------------------------------------------
    # Priority detection
    # --------------------------------------------------------

    priority = "Low"

    if severity == "Blocker":
        priority = "Critical"

    elif severity == "Critical":
        priority = "High"

    elif severity == "Major":
        priority = "High"

    elif severity == "Minor":
        priority = "Medium"

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    summary = (
        f"The reported issue is related to {category.lower()}. "
        f"The system is not behaving as expected based on the "
        f"reported bug description."
    )

    # --------------------------------------------------------
    # Possible cause
    # --------------------------------------------------------

    if category == "Authentication":
        possible_cause = (
            "Possible causes include an authentication request failure, "
            "incorrect login handling, invalid credentials processing, "
            "or an issue in the authentication API."
        )

    elif category == "Backend/API":
        possible_cause = (
            "Possible causes include an API endpoint failure, "
            "incorrect request data, server-side validation, "
            "or an unexpected backend response."
        )

    elif category == "Database":
        possible_cause = (
            "Possible causes include an incorrect database query, "
            "missing data, connection problems, or incorrect data handling."
        )

    elif category == "UI/Frontend":
        possible_cause = (
            "Possible causes include an incorrect event handler, "
            "frontend state issue, rendering problem, or UI interaction bug."
        )

    elif category == "Performance":
        possible_cause = (
            "Possible causes include slow database queries, "
            "large requests, inefficient processing, or network latency."
        )

    else:
        possible_cause = (
            "The issue may be caused by incorrect application logic, "
            "unexpected input, or an implementation defect."
        )

    # --------------------------------------------------------
    # Suggested fix
    # --------------------------------------------------------

    if category == "Authentication":
        suggested_fix = (
            "Inspect the login event handler, authentication API request, "
            "server response, token handling, and browser console errors."
        )

    elif category == "Backend/API":
        suggested_fix = (
            "Check the API request payload, endpoint implementation, "
            "server logs, validation rules, and returned HTTP status."
        )

    elif category == "Database":
        suggested_fix = (
            "Check the database connection, query conditions, schema, "
            "and whether the expected records exist."
        )

    elif category == "UI/Frontend":
        suggested_fix = (
            "Inspect the frontend event handler, component state, "
            "browser console errors, and UI rendering logic."
        )

    elif category == "Performance":
        suggested_fix = (
            "Profile the slow operation, inspect database queries, "
            "reduce unnecessary processing, and check network latency."
        )

    else:
        suggested_fix = (
            "Review the reproduction steps, application logs, "
            "related code, and error messages to isolate the root cause."
        )

    # --------------------------------------------------------
    # Confidence
    # --------------------------------------------------------

    confidence = 70

    if request.stepsToReproduce:
        confidence += 10

    if request.expectedResult:
        confidence += 5

    if request.actualResult:
        confidence += 5

    confidence = min(confidence, 95)

    return {
        "category": category,
        "priority": priority,
        "severity": severity,
        "summary": summary,
        "possibleCause": possible_cause,
        "suggestedFix": suggested_fix,
        "confidence": confidence,
    }


# ============================================================
# DUPLICATE BUG DETECTION
# ============================================================

class DuplicateBug(BaseModel):
    id: str
    title: str
    description: str


class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    existingBugs: list[DuplicateBug]


def calculate_similarity(
    title1,
    description1,
    title2,
    description2,
):
    text1 = f"{title1} {description1}".lower()
    text2 = f"{title2} {description2}".lower()

    words1 = set(text1.split())
    words2 = set(text2.split())

    if not words1 or not words2:
        return 0

    common_words = words1.intersection(words2)
    total_words = words1.union(words2)

    similarity = (
        len(common_words) / len(total_words)
    ) * 100

    return round(similarity, 2)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "BugHunter AI Service is running",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "success": True,
        "service": "BugHunter AI Service",
        "status": "healthy",
    }


# ============================================================
# BUG ANALYSIS ENDPOINT
# ============================================================

@app.post("/analyze")
def analyze_bug(request: BugAnalysisRequest):
    analysis = analyze_bug_content(request)

    return {
        "success": True,
        "message": "Bug analysis completed successfully",
        "analysis": {
            "title": request.title,
            "description": request.description,
            **analysis,
        },
    }


# ============================================================
# DUPLICATE BUG CHECK ENDPOINT
# ============================================================

@app.post("/duplicate-check")
def duplicate_check(request: DuplicateCheckRequest):
    matches = []

    for bug in request.existingBugs:
        similarity = calculate_similarity(
            request.title,
            request.description,
            bug.title,
            bug.description,
        )

        if similarity >= 30:
            matches.append(
                {
                    "bugId": bug.id,
                    "title": bug.title,
                    "description": bug.description,
                    "similarity": similarity,
                }
            )

    matches.sort(
        key=lambda item: item["similarity"],
        reverse=True,
    )

    return {
        "success": True,
        "message": "Duplicate bug check completed successfully",
        "isDuplicate": len(matches) > 0,
        "matches": matches[:5],
    }