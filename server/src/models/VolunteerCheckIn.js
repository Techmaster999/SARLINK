/* DT-193: VolunteerCheckIn model wrapper for retrieving check-ins and associating resources */
import {
  findCheckInById,
  markCheckInSubmitted,
  replaceCheckInResources,
  saveCheckInTeam,
} from "./checkIn.model.js";

export const VolunteerCheckIn = {
  findById: findCheckInById,
  getCheckInById: findCheckInById,
  replaceResources: replaceCheckInResources,
  saveTeam: saveCheckInTeam,
  markSubmitted: markCheckInSubmitted,
};

export {
  findCheckInById,
  markCheckInSubmitted,
  replaceCheckInResources,
  saveCheckInTeam,
};

export default VolunteerCheckIn;
