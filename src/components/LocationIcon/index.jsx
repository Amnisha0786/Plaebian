// assets
import { ReactComponent as LocationOne } from "assets/icons/Location_2_Legionary_A.svg";
import { ReactComponent as locationTwo } from "assets/icons/Location_3_Centurion_A.svg";
import { ReactComponent as locationThree } from "assets/icons/Location_4_Gladiator_A.svg";
import { ReactComponent as locationFour } from "assets/icons/Location_5_Overlord_A.svg";
import { ReactComponent as locationFive } from "assets/icons/Location_6_King_A.svg";
import { ReactComponent as locationSix } from "assets/icons/Location_7_Monarch_A.svg";
import { ReactComponent as locationSeven } from "assets/icons/Location_8_Caesar_A.svg";
import { ReactComponent as locationEight } from "assets/icons/Location_9_August_A.svg";

const iconTypes = {
  locationOne: LocationOne,
  locationTwo: locationTwo,
  locationThree: locationThree,
  locationFour: locationFour,
  locationFive: locationFive,
  locationSix: locationSix,
  locationSeven: locationSeven,
  locationEight: locationEight,
};

const LocationIcon = ({ title, ...props }) => {
  if (title) {
    let Icon = iconTypes[title];
    return <Icon {...props} />;
  }

  return <LocationOne {...props} />;
};

export default LocationIcon;
