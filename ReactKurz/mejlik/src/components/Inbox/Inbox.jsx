import "./inbox.css";

export const Inbox = (props) => {
  const { account, messages } = props;
  return (
    <>
      {messages == 0 ? (
        <>
          <button className="rect-no">{account}</button>
          <p className="message">No new messages</p>
        </>
      ) : (
        <>
          <button className="rect">{account}</button>
          <p className="message">You have {messages} new messages</p>
        </>
      )}
    </>
  );
};
