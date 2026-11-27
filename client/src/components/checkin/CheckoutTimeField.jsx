import { useFormContext } from "react-hook-form";

export default function CheckoutTimeField() {
  const { setValue, watch, register } = useFormContext();
  const hasHardCheckoutTime = watch("hasHardCheckoutTime", null);
  const checkoutTime = watch("checkoutTime", "");

  const handleCheckoutTimeChange = (checkoutTime) => {
    setValue("checkoutTime", checkoutTime, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleHardCheckoutChange = (hasHardTime) => {
    setValue("hasHardCheckoutTime", hasHardTime, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (!hasHardTime) {
      handleCheckoutTimeChange("");
    }
  };

  return (
    <fieldset className="checkin-checkout-field">
      <legend className="checkin-question">
        Do you have a hard check-out time?
      </legend>
      <p className="checkin-checkout-note">
        A time you must leave by, no matter how the search is going.
      </p>
      <div className="checkin-presets">
        {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(
          ({ value, label }) => (
            <button
              key={label}
              className={`checkin-chip ${hasHardCheckoutTime === value ? "is-selected" : ""}`}
              type="button"
              aria-pressed={hasHardCheckoutTime === value}
              onClick={() => handleHardCheckoutChange(value)}
            >
              {label}
            </button>
          ),
        )}
      </div>
      {hasHardCheckoutTime && (
        <div className="checkin-time-field">
          <label htmlFor="checkoutTime">
            Check-out time (24-hour, e.g. 1800)
          </label>
          <input
            id="checkoutTime"
            className="checkin-checkout-input"
            type="time"
            step={300}
            value={checkoutTime}
            aria-label="Check-out time"
            {...register("checkoutTime")}
            onChange={(event) => handleCheckoutTimeChange(event.target.value)}
          />
        </div>
      )}
    </fieldset>
  );
}
