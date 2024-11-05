import { useRef } from "react";

// hooks
import { useSelector } from "react-redux";

// library utils
import { toast } from "react-toastify";

// images
import clipboard from "assets/icons/clipboard-regular.svg";

const ReferralCode = () => {
  const user = useSelector((state) => state.user?.value);
  const textAreaRef = useRef(null);

  function copyToClipboard(e) {
    const code = document.getElementById("copycode").innerHTML;
    navigator.clipboard.writeText(code);
    toast("Referral copied to clipboard!");
    e.target.focus();
  }

  return (
    <p className="refer" ref={textAreaRef}>
      Invite a friend to signup in this app and Earn 100 coins for first 10
      referrals. Your referral code is:{" "}
      <span id="copycode">{user?.account?.referralCode}</span>
      <img
        src={clipboard}
        alt=""
        className="power-icon"
        onClick={copyToClipboard}
      />
    </p>
  );
};

export default ReferralCode;
