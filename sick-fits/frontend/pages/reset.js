import ResetComponent from '../components/Reset';

const Reset = (props) => {
  const { resetToken } = props.query;
  return (
    <div>
      <ResetComponent resetToken={resetToken} />
    </div>
  );
};

export default Reset;
