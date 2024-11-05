export const generateOtp = () => Math.floor(100000 + Math.random() * 900000);
export const formatNumberWithOneDecimal = (value: number) => {
  // Convert the number to a string
  var stringValue = value?.toString();

  // Check if the number has a decimal point
  if (stringValue?.indexOf(".") === -1) {
    // If no decimal point found, append '.0' to the end
    return stringValue + ".0";
  } else {
    var parts = stringValue?.split(".");

    // If the decimal part has more than one digit, truncate to one digit
    if (parts?.[1]?.length > 1) {
      parts[1] = parts[1]?.substring(0, 1);
    }

    return parts?.join(".");
  }
};

export const centsToUSD = (cents: number) => {
  // Ensure that 'cents' is a number
  if (typeof cents !== "number") {
    throw new Error("Input must be a number representing cents.");
  }

  // Calculate the equivalent amount in dollars
  const dollars = cents / 100;

  // Format the result as a currency with two decimal places
  return dollars.toString().replace(/\.?0+$/, "");
};
