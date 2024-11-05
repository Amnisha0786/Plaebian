import styles from "./style.module.scss";

const LoaderSpiner = () => {
  return (
    <>
      <div className={styles.loader_css}>
        <div className={styles.loader}></div>
      </div>
    </>
  );
};

export default LoaderSpiner;
