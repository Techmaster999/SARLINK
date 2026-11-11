import { HttpError } from "../utils/httpError.js";

// Only lets accounts with one of the given roles through, e.g. requireRole("IST", "Sheriff").
// Expects the logged-in user on req.session.user with a `role` field.
// TODO (auth ticket): the API server doesn't load sessions yet — until express-session
// (with a shared store like connect-pg-simple) is mounted here and the login sets
// `role`, every request is rejected with 401.
export function requireRole(...roles) {
    return function (req, res, next) {
        const user = req.session?.user;
        if (!user) {
            return next(new HttpError(401, "Please sign in to continue."));
        }
        if (!roles.includes(user.role)) {
            return next(new HttpError(403, "Your account isn't allowed to do this."));
        }
        next();
    };
}
