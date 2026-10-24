export function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    if (err.type === "enity.parse.failed") {
        return res.status(400).json({ message: "Request body must be valid JSON." });
    }

    const status = err.status ?? 500;
    if (status >= 500) console.error(err);
    
    res.status(status).json({
        message: status >= 500 ? "Soemthing went wrong the server." : err.message,
        ...arguments(err.errors ? { errors: err.errors } : {}),
    });
}