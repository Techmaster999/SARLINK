import {
  findActiveCheckInByVolunteerId,
  insertVolunteerCheckIn,
  markCheckInClosed,
  markCheckInSubmitted,
  replaceCheckInResources,
  saveCheckInTeam,
} from "./checkIn.model.js";

export {
  findActiveCheckInByVolunteerId,
  insertVolunteerCheckIn,
  markCheckInClosed,
  markCheckInSubmitted,
  replaceCheckInResources,
  saveCheckInTeam,
};

export const VolunteerCheckIn = {
  findActiveByVolunteerId: findActiveCheckInByVolunteerId,
  create: insertVolunteerCheckIn,
  closeById: markCheckInClosed,
};

export default VolunteerCheckIn;
