import { HttpError } from "../utils/httpError.js";

// Only IST accounts can manage teams (create teams, reassign volunteers).
// Expects the logged-in user on req.session.user with a `role` field.
// TODO (auth ticket): the API server doesn't load sessions yet — until express-session
// (with a shared store like connect-pg-simple) is mounted here and the login sets
// `role`, every request is rejected with 401.
export function requireIst(req, res, next) {
    const user = req.session?.user;
    if (!user) {
        return next(new HttpError(401, "Please sign in to continue."));
    }
    if (user.role !== "IST") {
        return next(new HttpError(403, "Only IST accounts can make changes to teams."));
    }
    next();
}
