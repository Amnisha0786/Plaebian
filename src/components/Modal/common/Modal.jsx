// library components
import ReactModal from "react-modal";

//styles
import styles from "./styles.module.scss";
ReactModal.setAppElement("body");

const Modal = ({
  children,
  isOpen,
  handleCloseModal,
  closeButtonClass,
  modalClass,
  text,
  style,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      style={style || {}}
      className={` ${styles.em_modal} ${modalClass}`}
    >
      {children}
      <button
        onClick={handleCloseModal}
        className={`${styles.close_button} ${closeButtonClass}`}
      >
        {text ? text : "Close Modal"}
      </button>
    </ReactModal>
  );
};
export default Modal;
