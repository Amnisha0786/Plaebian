const StatusSection = ({ statusArray }) => {
  return (
    <div className="status_section">
      <div className="statue_img">
        {statusArray.map((status, index) => (
          <div className="img_text" key={index}>
            <img
              src={require(`assets/images/${status.image}`)}
              className="img_circle"
              alt="status"
            />
            <span>
              <img src={require(`assets/icons/${status.icon}`)} alt="icon" />
              {status.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusSection;
